const postgres = require('postgres');

const connectionString = "postgresql://postgres:Akash%4013%24%23%21%24@db.raqtqeckmqegboekezsr.supabase.co:5432/postgres";
const sql = postgres(connectionString, { ssl: 'require' });

async function checkUser() {
    try {
        const email = 'akash.it24@mamcet.com';
        console.log(`Checking user with email: ${email}`);

        // Check in our users table
        const ourUsers = await sql`
      SELECT id, email, phone, full_name, role
      FROM users 
      WHERE email = ${email}
    `;

        console.log('\nIn our users table:');
        if (ourUsers.length > 0) {
            console.log('Found:', ourUsers[0]);
        } else {
            console.log('Not found');
        }

        // Check in Supabase auth.users table
        const authUsers = await sql`
      SELECT id, email, created_at
      FROM auth.users 
      WHERE email = ${email}
    `;

        console.log('\nIn Supabase auth.users:');
        if (authUsers.length > 0) {
            console.log('Found:', authUsers[0]);
        } else {
            console.log('Not found');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUser();
