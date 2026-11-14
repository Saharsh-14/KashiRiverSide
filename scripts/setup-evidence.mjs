const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
const existing=await fetch(`${url}/storage/v1/bucket/payment-evidence`,{headers});
if(existing.ok){const bucket=await existing.json();if(bucket.public)throw new Error('Existing evidence bucket is public; manual review required');console.log('Private bucket already exists');}
else {
 const response=await fetch(`${url}/storage/v1/bucket`,{method:'POST',headers,body:JSON.stringify({id:'payment-evidence',name:'payment-evidence',public:false,file_size_limit:3145728,allowed_mime_types:['image/png','image/jpeg']})});
 if(!response.ok)throw new Error(`Bucket setup failed: HTTP ${response.status}`);
 console.log('Private payment-evidence bucket created');
}
