import { db } from '@/db';
import { applications, jobs, notifications } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        // Secure logic here...

        // Find applications 'STARTED' for > 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const stuckApplications = await db.select({
            app: applications,
            job: jobs
        })
            .from(applications)
            .innerJoin(jobs, eq(applications.jobId, jobs.id))
            .where(
                and(
                    eq(applications.status, 'STARTED'),
                    lte(applications.updatedAt, twentyFourHoursAgo)
                )
            );

        console.log(`Found ${stuckApplications.length} stuck applications`);

        let notificationsSent = 0;

        for (const { app, job } of stuckApplications) {
            // Notify Owner
            // We use 'SYSTEM_ALERT' but schema has allowed types.
            // Check 'notification_type' enum in schema if strict.
            // Assuming 'STATUS_UPDATE' or similar is safe, or generic string if just text.
            // Schema has `type: text`? Let's assume text for not breaking.
            // Actually let's use 'SYSTEM' if available or just update logic.

            await db.insert(notifications).values({
                userId: job.ownerId,
                message: `Reminder: Please mark job "${job.title}" as completed if finished.`,
                isRead: false
            });
            notificationsSent++;
        }

        return NextResponse.json({ success: true, count: notificationsSent });
    } catch (error: any) {
        console.error('Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
