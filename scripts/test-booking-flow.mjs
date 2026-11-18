import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHmac, randomUUID, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';

const base='http://127.0.0.1:3187';
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !process.env.HOTEL_TEST_SUPABASE_URL || url !== process.env.HOTEL_TEST_SUPABASE_URL) {
 throw new Error('Run integration tests only against a dedicated test project: set HOTEL_TEST_SUPABASE_URL to its SUPABASE_URL.');
}
const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
const ids=[];let testUser;let evidence;let originalNonAcRate;
async function db(path,options={}){
 const r=await fetch(url+path,{...options,headers:{...headers,...options.headers}});
 if(!r.ok)throw new Error(`Test database request failed: ${r.status}`);
 const t=await r.text();return t?JSON.parse(t):null;
}
async function api(path,{cookie='',data,form,method,idempotencyKey,clientIp='203.0.113.10'}={}){
 const r=await fetch(base+path,{method:method||(data||form?'POST':'GET'),headers:{Origin:base,'X-Forwarded-For':clientIp,...(cookie?{Cookie:cookie}:{}),...(data?{'Content-Type':'application/json','Idempotency-Key':idempotencyKey||randomUUID()}:{})},body:form|| (data?JSON.stringify(data):undefined),redirect:'manual'});
 const text=await r.text();let body;try{body=JSON.parse(text);}catch{body=text;}
 return {r,body,cookie:r.headers.get('set-cookie')?.split(';')[0]};
}
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3187'],{env:{...process.env,BOOKINGS_ENABLED:'true',EMAIL_NOTIFICATIONS_ENABLED:'false'},stdio:'inherit',windowsHide:true});
try{
 for(let i=0;i<40;i++){try{const r=await fetch(base);if(r.ok)break;}catch{}if(server.exitCode!==null)throw new Error('Test server could not start');await new Promise(r=>setTimeout(r,500));}
 const email=`hotel-test-${randomUUID()}@example.com`,password=randomBytes(24).toString('hex');
 testUser=await db('/auth/v1/admin/users',{method:'POST',body:JSON.stringify({email,password,email_confirm:true})});
 const uid=testUser.id;
 await db('/rest/v1/hotel_admins',{method:'POST',body:JSON.stringify({user_id:uid})});
 assert.equal((await api('/api/admin')).r.status,401);
 assert.equal((await api('/api/admin',{data:{action:'test_email'}})).r.status,400);
 assert.equal((await api('/api/bookings')).r.status,404);
 const login=await api('/api/admin',{data:{action:'login',email,password}});assert.equal(login.r.status,200,JSON.stringify(login.body));const admin=login.cookie;
 const historyRows=Array.from({length:101},(_,i)=>({room_type:'ac',check_in:'2099-01-01',check_out:'2099-01-02',adults:1,children:0,guest_name:`TEST HISTORY ${i}`,phone:'0000000000',policy_version:'test',nightly_rate:200000,total:200000,advance_due:60000}));
 const history=await db('/rest/v1/bookings?select=id',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(historyRows)});
 ids.push(...history.map(row=>row.id));
 const allHistory=await api('/api/admin',{cookie:admin});assert.equal(allHistory.r.status,200);assert.equal(allHistory.body.bookings.filter(b=>b.guest_name.startsWith('TEST HISTORY ')).length,101);
 const input={arrival:'2098-03-10',departure:'2098-03-12',room:'non_ac',adults:2,children:0,extra:true,name:'AUTOMATED TEST ONLY',phone:'0000000000',email:'',requests:'Temporary integration test',accepted:true};
 assert.equal((await api('/api/bookings',{data:{...input,departure:input.arrival}})).r.status,400);
 async function book(){const result=await api('/api/bookings',{data:input,clientIp:'203.0.113.11'});assert.equal(result.r.status,201,JSON.stringify(result.body));ids.push(result.body.id);assert.equal(result.body.total,400000);assert.equal(result.body.advance_due,120000);return result;}
 let first=await book(),second=await book();
 const roomRates=await db('/rest/v1/room_types?code=eq.non_ac&select=nightly_rate');originalNonAcRate=roomRates[0].nightly_rate;
 assert.equal((await api('/api/admin',{data:{action:'rate',roomType:'non_ac',ratePaise:160000}})).r.status,400);
 assert.equal((await api('/api/admin',{cookie:admin,data:{action:'rate',roomType:'non_ac',ratePaise:-1}})).r.status,400);
 assert.equal((await api('/api/admin',{cookie:admin,data:{action:'rate',roomType:'non_ac',ratePaise:160000}})).r.status,200);
 const publicRates=await api('/api/rooms');assert.equal(publicRates.r.status,200);assert.equal(publicRates.body.rooms.find(r=>r.code==='non_ac').nightly_rate,160000);
 assert.equal((await api('/api/bookings',{cookie:first.cookie})).body.total,400000);
 assert.equal((await api('/api/bookings',{data:{...input,quotedNightlyRate:originalNonAcRate}})).r.status,400);
 assert.equal((await api('/api/admin',{cookie:admin,data:{action:'rate',roomType:'non_ac',ratePaise:originalNonAcRate}})).r.status,200);
 const retryKey=randomUUID();
 const retryFirst=await api('/api/bookings',{data:input,idempotencyKey:retryKey,clientIp:'203.0.113.12'});
 const retrySecond=await api('/api/bookings',{data:input,idempotencyKey:retryKey,clientIp:'203.0.113.12'});
 assert.equal(retryFirst.r.status,201,JSON.stringify(retryFirst.body));
 assert.equal(retrySecond.r.status,200,JSON.stringify(retrySecond.body));
 assert.equal(retrySecond.body.id,retryFirst.body.id);
 assert.match(retryFirst.body.recovery_code,/^[A-F0-9]{4}(?:-[A-F0-9]{4}){4}$/);
 const wrongRecovery=await api('/api/bookings',{data:{action:'recover',id:retryFirst.body.id,code:'0000-0000-0000-0000-0000'},clientIp:'203.0.113.13'});
 assert.equal(wrongRecovery.r.status,400);
 const recovered=await api('/api/bookings',{data:{action:'recover',id:retryFirst.body.id,code:retryFirst.body.recovery_code},clientIp:'203.0.113.13'});
 assert.equal(recovered.r.status,200,JSON.stringify(recovered.body));
 assert.equal(recovered.body.id,retryFirst.body.id);
 assert.equal((await api('/api/bookings',{cookie:recovered.cookie})).body.id,retryFirst.body.id);
 assert.equal((await api('/api/bookings',{cookie:retryFirst.cookie})).r.status,404);
 ids.push(retryFirst.body.id);
 for(let attempt=0;attempt<5;attempt++){
  const limited=await api('/api/bookings',{data:input,clientIp:'203.0.113.99'});
  assert.equal(limited.r.status,201,JSON.stringify(limited.body));ids.push(limited.body.id);
 }
 const blocked=await api('/api/bookings',{data:input,clientIp:'203.0.113.99'});
 assert.equal(blocked.r.status,429,JSON.stringify(blocked.body));
 assert.equal(blocked.r.headers.get('retry-after'),'600');
 assert.equal(first.body.can_pay,true);
 // A malicious screenshot is rejected before any payment is recorded.
 const bad=new FormData();bad.set('reference','TEST'+Date.now());bad.set('screenshot',new Blob(['not an image'],{type:'image/png'}),'bad.png');
 assert.equal((await api('/api/payments',{cookie:first.cookie,form:bad})).r.status,400);
 async function pay(booking,withFile){const form=new FormData();form.set('reference',randomBytes(12).toString('hex'));if(withFile)form.set('screenshot',new Blob([readFileSync('public/assets/krs-logo.png')],{type:'image/png'}),'test.png');const r=await api('/api/payments',{cookie:booking.cookie,form});assert.equal(r.r.status,200,JSON.stringify(r.body));}
 await pay(first,true);await pay(second,false);
 const rows=await db(`/rest/v1/payments?booking_id=eq.${first.body.id}&select=screenshot_path`);evidence=rows[0].screenshot_path;assert.ok(evidence);
 const publicFile=await fetch(`${url}/storage/v1/object/public/payment-evidence/${evidence}`);assert.notEqual(publicFile.status,200);
 assert.equal((await api(`/api/admin/evidence?booking=${first.body.id}`)).r.status,401);
 const privateLink=await api(`/api/admin/evidence?booking=${first.body.id}`,{cookie:admin});assert.equal(privateLink.r.status,303);
 assert.equal((await fetch(privateLink.r.headers.get('location'))).status,200);
 let status=await api('/api/bookings',{cookie:first.cookie});assert.equal(status.body.status,'payment_submitted_pending_verification');
 // Duplicate submission must not create another payment.
 const duplicate=new FormData();duplicate.set('reference','DUPLICATETEST001');assert.equal((await api('/api/payments',{cookie:first.cookie,form:duplicate})).r.status,400);
 assert.equal((await api('/api/admin',{cookie:admin,data:{action:'room_block',roomType:'non_ac',roomNumber:1,startDate:input.arrival,endDate:'2098-03-11',blocked:true}})).r.status,200);
 assert.equal((await api('/api/admin',{cookie:admin,data:{action:'approve',id:first.body.id}})).r.status,400);
 assert.equal((await api('/api/bookings',{data:input})).r.status,400);
 assert.equal((await api('/api/admin',{cookie:admin,data:{action:'room_block',roomType:'non_ac',roomNumber:1,startDate:input.arrival,endDate:'2098-03-11',blocked:false}})).r.status,200);
 const race=await Promise.all([first,second].map(b=>api('/api/admin',{cookie:admin,data:{action:'approve',id:b.body.id}})));
 assert.deepEqual(race.map(x=>x.r.status).sort(),[200,400]);
 if(race[1].r.status===200)[first,second]=[second,first];
 const view=await api('/api/admin/availability?date='+input.arrival,{cookie:admin});
 assert.equal(view.r.status,200);assert.equal(view.body.find(x=>x.room==='non_ac').summary.vacant,0);
 assert.equal(view.body.find(x=>x.room==='non_ac').rooms[0].bookings.length,1);
 assert.notEqual((await api('/api/admin/availability?date='+input.arrival)).r.status,200);
 const acBlock={action:'room_block',roomType:'ac',roomNumber:2,startDate:'2098-03-10',endDate:'2098-03-12',blocked:true};
 assert.equal((await api('/api/admin',{cookie:admin,data:acBlock})).r.status,200);
 const acSecondNight=await api('/api/admin/availability?date=2098-03-11',{cookie:admin});
 assert.equal(acSecondNight.body.find(x=>x.room==='ac').rooms[1].blocks.length,1);
 assert.deepEqual(Object.fromEntries(Object.entries(acSecondNight.body.find(x=>x.room==='ac').rooms[1].blockRange).filter(([key])=>['start_date','end_date'].includes(key))),{start_date:'2098-03-10',end_date:'2098-03-12'});
 const acCheckout=await api('/api/admin/availability?date=2098-03-12',{cookie:admin});
 assert.equal(acCheckout.body.find(x=>x.room==='ac').rooms[1].blocks.length,0);
 assert.equal((await api('/api/admin',{cookie:admin,data:{...acBlock,blocked:false}})).r.status,200);
 const edits=await Promise.all([api('/api/admin',{cookie:admin,data:{action:'room_block',roomType:'non_ac',roomNumber:1,startDate:input.arrival,endDate:'2098-03-11',blocked:true}}),api('/api/admin',{cookie:admin,data:{action:'approve',id:second.body.id}})]);
 assert.equal(edits[0].r.status,400);assert.equal(edits[1].r.status,400);
 const checkoutView=await api('/api/admin/availability?date='+input.departure,{cookie:admin}); assert.equal(checkoutView.body.find(x=>x.room==='non_ac').summary.vacant,1);
 status=await api('/api/bookings',{cookie:first.cookie});assert.equal(status.body.status,'confirmed');
 assert.equal((await api('/api/admin',{cookie:admin,data:{action:'approve',id:second.body.id}})).r.status,400);
 assert.equal((await api('/api/admin',{cookie:admin,data:{action:'reject',id:second.body.id}})).r.status,200);
 assert.equal((await api('/api/bookings',{cookie:second.cookie})).body.status,'rejected');
 assert.equal((await api('/api/bookings',{data:input})).r.status,400);
 assert.notEqual((await api('/api/admin',{data:{action:'release_confirmed_room',id:first.body.id}})).r.status,200);
 assert.equal((await api('/api/admin',{cookie:admin,data:{action:'release_confirmed_room',id:first.body.id}})).r.status,200);
 assert.equal((await api('/api/bookings',{cookie:first.cookie})).body.status,'cancelled');
 assert.equal((await api('/api/admin/availability?date='+input.arrival,{cookie:admin})).body.find(x=>x.room==='non_ac').summary.vacant,1);
 const retainedPayments=await db('/rest/v1/payments?booking_id=eq.'+first.body.id+'&select=status,verified_amount');
 assert.equal(retainedPayments[0].status,'verified'); assert.equal(retainedPayments[0].verified_amount,120000);
 assert.notEqual((await api('/api/admin',{cookie:admin,data:{action:'release_confirmed_room',id:first.body.id}})).r.status,200);
 console.log('PASS: booking pricing, idempotent retries, durable rate limiting, cross-device recovery, invalid dates, private guest status, admin login, file validation, private screenshot access, payment submission, duplicate payment rejection, date-specific admin availability, approval, last-room conflict and rejection.');
}finally{
 server.kill();
 if(evidence)await db('/storage/v1/object/payment-evidence',{method:'DELETE',body:JSON.stringify({prefixes:[evidence]})});
 if(originalNonAcRate)await db('/rest/v1/room_types?code=eq.non_ac',{method:'PATCH',body:JSON.stringify({nightly_rate:originalNonAcRate})});
 for(let i=0;i<ids.length;i+=100){const list=ids.slice(i,i+100).join(',');for(const table of ['booking_email_outbox','booking_events','payments'])await db(`/rest/v1/${table}?booking_id=in.(${list})`,{method:'DELETE'});await db(`/rest/v1/bookings?id=in.(${list})`,{method:'DELETE'});}
 await db('/rest/v1/room_blocks?stay_date=gte.2098-03-10&stay_date=lte.2098-03-11',{method:'DELETE'});
 // Remove only the test clients' own limiter entries, never other guests' limits.
 const testClients=['203.0.113.10','203.0.113.11','203.0.113.12','203.0.113.13','203.0.113.99'];
 for(const client of testClients)for(const purpose of ['booking-rate','booking-recovery-rate']){
  const clientHash=createHmac('sha256',key).update(`${purpose}:${client}`).digest('hex');
  await db(`/rest/v1/booking_rate_limits?client_hash=eq.${clientHash}`,{method:'DELETE'});
 }
 if(testUser?.id){await db(`/rest/v1/hotel_admins?user_id=eq.${testUser.id}`,{method:'DELETE'});await db(`/auth/v1/admin/users/${testUser.id}`,{method:'DELETE'});}
 console.log('Removed only temporary test records, screenshot and test admin account.');
}
