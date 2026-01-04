
const { db } = require('./src/db');
const { jobs, users } = require('./src/db/schema');
const { desc, eq } = require('drizzle-orm');

async function test() {
    try {
        const result = await db.select({
            job: jobs,
            owner: users
        })
            .from(jobs)
            .innerJoin(users, eq(jobs.ownerId, users.id))
            .orderBy(desc(jobs.createdAt));

        console.log('Result length:', result.length);
        if (result.length > 0) {
            console.log('Sample job:', result[0].job);
        }
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

test();
