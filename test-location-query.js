const postgres = require('postgres');

const connectionString = "postgresql://postgres:Akash%4013%24%23%21%24@db.raqtqeckmqegboekezsr.supabase.co:5432/postgres";
const sql = postgres(connectionString, { ssl: 'require' });

async function testQuery() {
    try {
        console.log('Testing actual query that the app uses...');
        const result = await sql`
      SELECT 
        jobs.id, 
        jobs.owner_id, 
        jobs.title, 
        jobs.description, 
        jobs.pay, 
        jobs.category,
        jobs.location,
        jobs.is_emergency,
        jobs.status,
        jobs.created_at,
        users.id as user_id,
        users.email,
        users.full_name
      FROM jobs
      INNER JOIN users ON jobs.owner_id = users.id
      ORDER BY jobs.created_at DESC
      LIMIT 1
    `;

        console.log('✓ Query successful!');
        console.log('Sample result:', result[0]);
        process.exit(0);
    } catch (err) {
        console.error('Query failed:', err.message);
        console.error('Full error:', err);
        process.exit(1);
    }
}

testQuery();
