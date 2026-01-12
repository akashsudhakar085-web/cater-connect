'use server';

import { db } from '@/db';
import { applications, jobs, users, ratings } from '@/db/schema';
import { createClient } from '@/lib/supabase-server';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notification';

export async function applyToJob(jobId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: 'Not authenticated' };

        // Check if already applied
        const existingApps = await db.select().from(applications).where(
            and(
                eq(applications.jobId, jobId as any),
                eq(applications.workerId, user.id as any)
            )
        ).limit(1);
        const existing = existingApps[0];

        if (existing) return { success: false, message: 'Already applied' };

        await db.insert(applications).values({
            jobId: jobId as any,
            workerId: user.id as any,
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Notify Owner - swallow errors here to not fail application
        try {
            const targetJobs = await db.select().from(jobs).where(eq(jobs.id, jobId as any)).limit(1);
            if (targetJobs[0]) {
                await createNotification(
                    targetJobs[0].ownerId as any,
                    `New applicant for your gig: ${targetJobs[0].title}`,
                    `/dashboard/my-jobs`
                );
            }
        } catch (notifError) {
            console.error('Notification failed:', notifError);
        }

        revalidatePath('/dashboard');
        return { success: true, message: 'Application sent successfully' };
    } catch (error: any) {
        console.error('ApplyToJob Error:', error);
        return { success: false, message: error.message || 'Failed to apply' };
    }
}

export async function updateApplicationStatus(applicationId: string, status: 'ACCEPTED' | 'REJECTED' | 'STARTED' | 'COMPLETED') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Verify ownership and get worker info
    const targetApplication = await db.select()
        .from(applications)
        .innerJoin(jobs, eq(applications.jobId, jobs.id))
        .where(eq(applications.id, applicationId as any))
        .limit(1);

    if (!targetApplication.length || targetApplication[0].jobs.ownerId !== user.id) {
        throw new Error('Unauthorized');
    }

    // Update Application Status
    await db.update(applications)
        .set({ status, updatedAt: new Date() })
        .where(eq(applications.id, applicationId as any));

    let notificationMessage = `Your application for ${targetApplication[0].jobs.title} was ${status.toLowerCase()}`;

    if (status === 'STARTED') {
        notificationMessage = `The Gig "${targetApplication[0].jobs.title}" has STARTED! Good luck.`;
    } else if (status === 'COMPLETED') {
        notificationMessage = `The Gig "${targetApplication[0].jobs.title}" is marked COMPLETED. Please rate the owner.`;
        // Also mark Job as COMPLETED if all apps are done? Or just leave Job as OPEN?
        // Usually, if a job is done, the JOB status should update too.
        await db.update(jobs)
            .set({ status: 'COMPLETED' })
            .where(eq(jobs.id, targetApplication[0].jobs.id as any));
    }

    // Notify Worker
    await createNotification(
        targetApplication[0].applications.workerId as any,
        notificationMessage,
        `/dashboard/my-applications`
    );

    revalidatePath('/dashboard');
}

export async function requestTimeExtension(applicationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const app = await db.select().from(applications).innerJoin(jobs, eq(applications.jobId, jobs.id)).where(eq(applications.id, applicationId as any)).limit(1);

    if (!app.length) throw new Error('Application not found');

    // Notify Owner
    await createNotification(
        app[0].jobs.ownerId as any,
        `Worker ${user.user_metadata.full_name || 'Crew'} requested a time extension for "${app[0].jobs.title}".`,
        `/dashboard/my-jobs`
    );
}

export async function markJobDoneRequest(applicationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const app = await db.select().from(applications).innerJoin(jobs, eq(applications.jobId, jobs.id)).where(eq(applications.id, applicationId as any)).limit(1);

    if (!app.length) throw new Error('Application not found');

    // Notify Owner
    await createNotification(
        app[0].jobs.ownerId as any,
        `Worker has marked "${app[0].jobs.title}" as DONE. Please verify and complete.`,
        `/dashboard/my-jobs`
    );
}

export async function getWorkerApplications() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const results = await db.select({
            application: applications,
            job: jobs
        })
            .from(applications)
            .innerJoin(jobs, eq(applications.jobId, jobs.id))
            .where(eq(applications.workerId, user.id as any))
            .orderBy(desc(applications.createdAt));

        return results;
    } catch (error) {
        console.error('DATABASE ERROR in getWorkerApplications:', error);
        return [];
    }
}

export async function getOwnerJobApplications() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const results = await db.select({
            application: applications,
            job: jobs,
            worker: users
        })
            .from(applications)
            .innerJoin(jobs, eq(applications.jobId, jobs.id))
            .innerJoin(users, eq(applications.workerId, users.id))
            .where(eq(jobs.ownerId, user.id as any))
            .orderBy(desc(applications.createdAt));

        return results;
    } catch (error) {
        console.error('DATABASE ERROR in getOwnerJobApplications:', error);
        return [];
    }
}


export async function rejectPendingApplications(jobId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify ownership
    const job = await db.select().from(jobs).where(eq(jobs.id, jobId as any)).limit(1);
    if (!job.length || job[0].ownerId !== user.id) throw new Error('Unauthorized');

    await db.update(applications)
        .set({ status: 'REJECTED' })
        .where(
            and(
                eq(applications.jobId, jobId as any),
                eq(applications.status, 'PENDING')
            )
        );

    revalidatePath('/dashboard');
}

export async function getApplicationsForJob(jobId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const results = await db.select({
            application: applications,
            worker: users
        })
            .from(applications)
            .innerJoin(users, eq(applications.workerId, users.id))
            .where(eq(applications.jobId, jobId as any))
            .orderBy(desc(applications.createdAt));

        // Enhancing results with 'hasRated' flag
        const enhancedResults = await Promise.all(results.map(async (item) => {
            let hasRated = false;
            if (user) {
                const rating = await db.select().from(ratings).where(
                    and(
                        eq(ratings.jobId, jobId as any),
                        eq(ratings.raterId, user.id as any),
                        eq(ratings.ratedUserId, item.worker.id as any)
                    )
                ).limit(1);
                hasRated = rating.length > 0;
            }
            return {
                ...item,
                hasRated
            };
        }));

        return enhancedResults;
    } catch (error) {
        console.error('DATABASE ERROR in getApplicationsForJob:', error);
        return [];
    }
}
