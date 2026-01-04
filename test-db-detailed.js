const postgres = require('postgres');

async function test() {
    const connectionString = "postgresql://postgres:Akash%4013%24%23%21%24@db.raqtqeckmqegboekezsr.supabase.co:5432/postgres";
    console.log('Attempting to connect to Supabase...');

    const sql = postgres(connectionString, {
        prepare: false,
        ssl: 'require'
    });

    try {
        // Test 1: Simple Selection
        console.log('\n--- Test 1: Simple SELECT ---');
        const result = await sql`SELECT 1 + 1 AS result`;
        console.log('Success:', result[0]);

        // Test 2: Check Users Table exists
        console.log('\n--- Test 2: Check users table ---');
        const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `;
        console.log('Tables found:', tables.length);
        if (tables.length === 0) {
            console.error('Table "users" NOT FOUND in public schema!');
        }

        // Test 3: Select from users with ID parameter (mimicking drizzle)
        console.log('\n--- Test 3: SELECT from users with param ---');
        const userId = 'b796a5e8-f7d4-48c8-9177-deeb9033d6df';
        try {
            const users = await sql`
        SELECT "id", "email", "full_name" 
        FROM "users" 
        WHERE "id" = ${userId}
        LIMIT 1
      `;
            console.log('Query executed successfully.');
            console.log('User found:', users.length > 0 ? users[0] : 'No user with this ID');
        } catch (e) {
            console.error('FAILED Test 3:', e.message);
            console.error('Detail:', e.detail);
            console.error('Hint:', e.hint);
            console.error('Code:', e.code);
        }

    } catch (err) {
        console.error('CRITICAL ERROR:', err);
    } finally {
        await sql.end();
    }
}

test();
