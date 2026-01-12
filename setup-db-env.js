const fs = require('fs');

// Original password: Akash@13$#!$
// URL encoded:
const password = encodeURIComponent('Akash@13$#!$');
const connectionString = `postgresql://postgres.raqtqeckmqegboekezsr:${password}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;

const content = `\nDATABASE_URL=${connectionString}\n`;

fs.appendFileSync('.env.local', content, { encoding: 'utf8' });
console.log('Added DATABASE_URL to .env.local');
