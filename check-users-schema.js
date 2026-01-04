const postgres = require('postgres');

const connectionString = "postgresql://postgres:Akash%4013%24%23%21%24@db.raqtqeckmqegboekezsr.supabase.co:5432/postgres";
const sql = postgres(connectionString, { ssl: 'require' });

async function checkSchema() {
    try {
        console.log('Checking users table schema...');
        const columns = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;

        console.log('Users table columns:');
        columns.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type} (default: ${col.column_default}, nullable: ${col.is_nullable})`);
        });

        // Check constraints
        const constraints = await sql`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'users'
    `;

        console.log('\nConstraints:');
        constraints.forEach(c => {
            console.log(`  ${c.constraint_name}: ${c.constraint_type}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkSchema();
