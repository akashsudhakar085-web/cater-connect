const postgres = require('postgres');

const connectionString = "postgresql://postgres:Akash%4013%24%23%21%24@db.raqtqeckmqegboekezsr.supabase.co:5432/postgres";
const sql = postgres(connectionString, { ssl: 'require' });

async function migrate() {
    try {
        console.log('Checking if location column exists...');
        const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' AND column_name = 'location'
    `;

        if (columns.length > 0) {
            console.log('✓ Location column already exists!');
        } else {
            console.log('Adding location column to jobs table...');
            await sql`ALTER TABLE jobs ADD COLUMN location TEXT NOT NULL DEFAULT 'General'`;
            console.log('✓ Location column added successfully!');
        }

        // Verify
        const allColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs'
    `;
        console.log('All columns in jobs table:', allColumns.map(c => c.column_name));

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
