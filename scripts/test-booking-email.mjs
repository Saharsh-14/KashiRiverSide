import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';

const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key||!process.env.HOTEL_TEST_SUPABASE_URL||url!==process.env.HOTEL_TEST_SUPABASE_URL) throw new Error('A dedicated test project must be explicitly configured.');
if(process.env.KRS_SEND_ONE_TEST_EMAIL!=='yes') throw new Error('Explicit confirmation is required to send the test email.');
const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
async function db(path,options={}) { const r=await fetch(url+path,{...options,headers:{...headers,...options.headers}});if(!r.ok)throw new Error(`Test database request failed: ${r.status}`);const t=await r.text();return t?JSON.parse(t):null; }
const base='http://127.0.0.1:3188';let server,user,booking;
try {
 const pending=await db('/rest/v1/booking_email_outbox?select=id&status=in.(pending,failed)&limit=1');
 assert.equal(pending.length,0,'The test queue must be empty before sending one email.');
 const email=`hotel-test-${randomUUID()}@example.com`,password=randomBytes(24).toString('hex');
 user=await db('/auth/v1/admin/users',{method:'POST',body:JSON.stringify({email,password,email_confirm:true})});
 await db('/rest/v1/hotel_admins',{method:'POST',body:JSON.stringify({user_id:user.id})});
 [booking]=await db('/rest/v1/bookings?select=id',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({room_type:'non_ac',check_in:'2098-03-10',check_out:'2098-03-12',adults:1,children:0,guest_name:'EMAIL DELIVERY TEST',phone:'0000000000',policy_version:'test',nightly_rate:150000,total:300000,advance_due:90000})});
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3188'],{env:{...process.env,EMAIL_NOTIFICATIONS_ENABLED:'true'},stdio:'inherit',windowsHide:true});
 let ready=false;for(let i=0;i<40;i++){try{const r=await fetch(base);if(r.ok){ready=true;break;}}catch{}if(server.exitCode!==null)break;await new Promise(r=>setTimeout(r,500));}if(!ready)throw new Error('Test server failed to start');
 async function action(data,cookie=''){const r=await fetch(base+'/api/admin',{method:'POST',headers:{Origin:base,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(data)});const body=await r.json();if(!r.ok)throw new Error(body.error||`Request failed: ${r.status}`);return {cookie:r.headers.get('set-cookie')?.split(';')[0],body};}
 const session=await action({action:'login',email,password});assert.ok(session.cookie);
 await action({action:'retry_emails'},session.cookie);
 const jobs=await db(`/rest/v1/booking_email_outbox?booking_id=eq.${booking.id}&select=status,recipient`);
 assert.equal(jobs.length,1);assert.equal(jobs[0].recipient,'hotel');assert.equal(jobs[0].status,'sent','Email was not accepted by Gmail');
 console.log('PASS: One hotel notification was accepted by Gmail.');
} finally {
 server?.kill();
 if(booking?.id){await db(`/rest/v1/booking_email_outbox?booking_id=eq.${booking.id}`,{method:'DELETE'});await db(`/rest/v1/bookings?id=eq.${booking.id}`,{method:'DELETE'});}
 if(user?.id){await db(`/rest/v1/hotel_admins?user_id=eq.${user.id}`,{method:'DELETE'});await db(`/auth/v1/admin/users/${user.id}`,{method:'DELETE'});}
 console.log('Removed temporary email-test records and test admin.');
}
