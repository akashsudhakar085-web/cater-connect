const fs = require('fs');
const content = `NEXT_PUBLIC_SUPABASE_URL=https://raqtqeckmqegboekezsr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_P_-dpugwbFDsEQvYDv4TEQ_xREqLIj3
`;
fs.writeFileSync('.env.local', content, { encoding: 'utf8' });
console.log('Fixed .env.local encoding');
