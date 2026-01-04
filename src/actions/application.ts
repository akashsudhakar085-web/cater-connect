'use server';

import { db } from '@/db';
import { applications, jobs, users } from '@/db/schema';
import { createClient } from '@/lib/supabase-server';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notification';

export async function applyToJob(jobId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Check if already applied
    const existingApps = await db.select().from(applications).where(
        and(
            eq(applications.jobId, jobId as any),
            eq(applications.workerId, user.id as any)
        )
    ).limit(1);
    const existing = existingApps[0];

    if (existing) throw new Error('Already applied');

    await db.insert(applications).values({
        jobId: jobId as any,
        workerId: user.id as any,
    });

    // Notify Owner
    const targetJobs = await db.select().from(jobs).where(eq(jobs.id, jobId as any)).limit(1);
    if (targetJobs[0]) {
        await createNotification(
            targetJobs[0].ownerId as any,
            `New applicant for your gig: ${targetJobs[0].title}`,
            `/dashboard/my-jobs`
        );
    }

    revalidatePath('/dashboard');
}

export async function updateApplicationStatus(applicationId: string, status: 'ACCEPTED' | 'REJECTED') {
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

    await db.update(applications)
        .set({ status })
        .where(eq(applications.id, applicationId as any));

    // Notify Worker
    await createNotification(
        targetApplication[0].applications.workerId as any,
        `Your application for ${targetApplication[0].jobs.title} was ${status.toLowerCase()}`,
        `/dashboard/my-applications`
    );

    revalidatePath('/dashboard');
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

export async function getApplicationsForJob(jobId: string) {
    try {
        const results = await db.select({
            application: applications,
            worker: users
        })
            .from(applications)
            .innerJoin(users, eq(applications.workerId, users.id))
            .where(eq(applications.jobId, jobId as any))
            .orderBy(desc(applications.createdAt));

        return results;
    } catch (error) {
        console.error('DATABASE ERROR in getApplicationsForJob:', error);
        return [];
    }
}
