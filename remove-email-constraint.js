const postgres = require('postgres');

const connectionString = "postgresql://postgres:Akash%4013%24%23%21%24@db.raqtqeckmqegboekezsr.supabase.co:5432/postgres";
const sql = postgres(connectionString, { ssl: 'require' });

async function removeEmailConstraint() {
    try {
        console.log('Removing UNIQUE constraint on email column...');

        // Drop the unique constraint on email
        await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique`;

        console.log('✓ Email UNIQUE constraint removed successfully!');

        // Verify
        const constraints = await sql`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'users' AND constraint_name = 'users_email_unique'
    `;

        if (constraints.length === 0) {
            console.log('✓ Verified: users_email_unique constraint no longer exists');
        } else {
            console.log('⚠ Warning: Constraint still exists');
        }

        process.exit(0);
    } catch (err) {
        console.error('Failed to remove constraint:', err);
        process.exit(1);
    }
}

removeEmailConstraint();
