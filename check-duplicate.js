const postgres = require('postgres');

const connectionString = "postgresql://postgres:Akash%4013%24%23%21%24@db.raqtqeckmqegboekezsr.supabase.co:5432/postgres";
const sql = postgres(connectionString, { ssl: 'require' });

async function checkPhone() {
    try {
        const phone = '+916385453647';
        console.log(`Checking if phone ${phone} already exists...`);

        const existing = await sql`
      SELECT id, email, phone, full_name
      FROM users 
      WHERE phone = ${phone}
    `;

        if (existing.length > 0) {
            console.log('✗ Phone number already exists!');
            console.log('Existing user:', existing[0]);
        } else {
            console.log('✓ Phone number is available');
        }

        // Also check the email
        const email = 'akash.it24@mamcet.com';
        const emailCheck = await sql`
      SELECT id, email, phone, full_name
      FROM users 
      WHERE email = ${email}
    `;

        if (emailCheck.length > 0) {
            console.log('\n✗ Email already exists!');
            console.log('Existing user:', emailCheck[0]);
        } else {
            console.log('\n✓ Email is available');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkPhone();
