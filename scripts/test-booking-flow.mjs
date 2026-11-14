import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';

const base='http://127.0.0.1:3187';
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
const ids=[];let testUser;let evidence;
async function db(path,options={}){
 const r=await fetch(url+path,{...options,headers:{...headers,...options.headers}});
 if(!r.ok)throw new Error(`Test database request failed: ${r.status}`);
 const t=await r.text();return t?JSON.parse(t):null;
}
async function api(path,{cookie='',data,form,method}={}){
 const r=await fetch(base+path,{method:method||(data||form?'POST':'GET'),headers:{Origin:base,...(cookie?{Cookie:cookie}:{}),...(data?{'Content-Type':'application/json'}:{})},body:form|| (data?JSON.stringify(data):undefined),redirect:'manual'});
 const text=await r.text();let body;try{body=JSON.parse(text);}catch{body=text;}
 return {r,body,cookie:r.headers.get('set-cookie')?.split(';')[0]};
}
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3187'],{env:{...process.env,BOOKINGS_ENABLED:'true'},stdio:'ignore',windowsHide:true});
try{
 for(let i=0;i<40;i++){try{const r=await fetch(base);if(r.ok)break;}catch{}if(server.exitCode!==null)throw new Error('Test server could not start');await new Promise(r=>setTimeout(r,500));}
 const email=`hotel-test-${randomUUID()}@example.com`,password=randomBytes(24).toString('hex');
 testUser=await db('/auth/v1/admin/users',{method:'POST',body:JSON.stringify({email,password,email_confirm:true})});
 const uid=testUser.id;
 await db('/rest/v1/hotel_admins',{method:'POST',body:JSON.stringify({user_id:uid})});
 assert.equal((await api('/api/admin')).r.status,401);
 assert.equal((await api('/api/bookings')).r.status,404);
 const login=await api('/api/admin',{data:{action:'login',email,password}});assert.equal(login.r.status,200,JSON.stringify(login.body));const admin=login.cookie;
 const input={arrival:'2098-03-10',departure:'2098-03-12',room:'non_ac',adults:2,children:0,extra:true,name:'AUTOMATED TEST ONLY',phone:'0000000000',email:'',requests:'Temporary integration test',accepted:true};
 assert.equal((await api('/api/bookings',{data:{...input,departure:input.arrival}})).r.status,400);
 async function book(){const result=await api('/api/bookings',{data:input});assert.equal(result.r.status,201,JSON.stringify(result.body));ids.push(result.body.id);assert.equal(result.body.total,400000);assert.equal(result.body.advance_due,120000);return result;}
 const first=await book(),second=await book();
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
 assert.equal((await api('/api/admin',{cookie:admin,data:{action:'approve',id:first.body.id}})).r.status,200);
 status=await api('/api/bookings',{cookie:first.cookie});assert.equal(status.body.status,'confirmed');
 assert.equal((await api('/api/admin',{cookie:admin,data:{action:'approve',id:second.body.id}})).r.status,400);
 assert.equal((await api('/api/admin',{cookie:admin,data:{action:'reject',id:second.body.id}})).r.status,200);
 assert.equal((await api('/api/bookings',{cookie:second.cookie})).body.status,'rejected');
 assert.equal((await api('/api/bookings',{data:input})).r.status,400);
 console.log('PASS: booking pricing, invalid dates, private guest status, admin login, file validation, private screenshot access, payment submission, duplicate payment rejection, approval, last-room conflict and rejection.');
}finally{
 server.kill();
 if(evidence)await db('/storage/v1/object/payment-evidence',{method:'DELETE',body:JSON.stringify({prefixes:[evidence]})});
 for(const id of ids){for(const table of ['booking_events','payments'])await db(`/rest/v1/${table}?booking_id=eq.${id}`,{method:'DELETE'});await db(`/rest/v1/bookings?id=eq.${id}`,{method:'DELETE'});}
 if(testUser?.id){await db(`/rest/v1/hotel_admins?user_id=eq.${testUser.id}`,{method:'DELETE'});await db(`/auth/v1/admin/users/${testUser.id}`,{method:'DELETE'});}
 console.log('Removed only temporary test records, screenshot and test admin account.');
}
