
const postgres = require('postgres');

const connectionString = "postgresql://postgres:Akash%4013%24%23%21%24@db.raqtqeckmqegboekezsr.supabase.co:5432/postgres";
const sql = postgres(connectionString, { ssl: 'require' });

async function migrate() {
    try {
        console.log('Adding location column to jobs table...');
        await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT 'General'`;
        console.log('Success!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
