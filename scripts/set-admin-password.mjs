import { readFileSync, writeFileSync } from 'node:fs';
const email = 'kashiriverside@gmail.com';
const password = process.env.ADMIN_SETUP_PASSWORD;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const url = process.env.SUPABASE_URL;
async function request(path, options = {}) {
  const response = await fetch(url + path, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...options.headers },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Supabase request failed (HTTP ${response.status}).`);
  return response.json();
}
try {
  if (!password || password.length < 8 || !key || !url) throw new Error('Required setup values are missing or password is too short.');
  let user;
  for (let page = 1; page <= 100; page++) {
    const data = await request(`/auth/v1/admin/users?page=${page}&per_page=100`);
    user = data.users.find(item => item.email?.toLowerCase() === email);
    if (user || data.users.length < 100) break;
  }
  if (!user) throw new Error('The intended admin account was not found.');
  const allowed = await request(`/rest/v1/hotel_admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`);
  if (!allowed.length) throw new Error('Account is not on the admin allowlist.');
  await request(`/auth/v1/admin/users/${user.id}`, { method: 'PUT', body: JSON.stringify({ password }) });
  const session = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (session.user?.id !== user.id || !session.access_token) throw new Error('Login verification failed.');
  const current = await request('/auth/v1/user', { headers: { Authorization: `Bearer ${session.access_token}` } });
  if (current.id !== user.id) throw new Error('Authenticated identity mismatch.');
  // Remove only the temporary credential assignment; preserve all other settings.
  const contents = readFileSync('.env.local', 'utf8');
  writeFileSync('.env.local', contents.split(/\r?\n/).filter(line => !/^\s*(?:export\s+)?ADMIN_SETUP_PASSWORD\s*=/.test(line)).join('\n'));
  console.log('Admin password set. Login and admin membership verified. Temporary password entry removed.');
} catch (error) {
  console.error(error instanceof Error && /^(Supabase request failed|Required setup|The intended|Account is not|Login verification|Authenticated identity)/.test(error.message) ? error.message : 'Setup failed; secret values were not logged.');
  process.exitCode = 1;
}
