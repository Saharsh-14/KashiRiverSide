// Run with node --env-file=.env.local scripts/prepare-admin.mjs.
// Creates an owner-approved account without printing secrets or setting a password.
const url=process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const email="kashiriverside@gmail.com";
async function call(path,options={}) {
 const response=await fetch(url+path,{...options,headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",...options.headers}});
 if(!response.ok)throw new Error(`Admin provisioning failed: HTTP ${response.status}`);
 const text=await response.text(); return text?JSON.parse(text):null;
}
let found;
for(let page=1;page<=100;page++){
 const data=await call(`/auth/v1/admin/users?page=${page}&per_page=100`);
 found=data.users.find(u=>u.email?.toLowerCase()===email);
 if(found||data.users.length<100)break;
}
if(!found)found=await call('/auth/v1/admin/users',{method:'POST',body:JSON.stringify({email,email_confirm:true})});
const id=found.id??found.user?.id;
if(!id)throw new Error('Missing admin user ID');
await call('/rest/v1/hotel_admins?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({user_id:id})});
console.log('Admin account allowlisted. Password setup is still required.');
