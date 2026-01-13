'use server';

import { db } from '@/db';
import { jobs, users, applications, ratings } from '@/db/schema';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createJob(formData: {
    title: string;
    pay: number;
    category: string;
    location: string;
    isEmergency: boolean;
    description?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    await db.insert(jobs).values({
        ownerId: user.id as any,
        title: formData.title,
        pay: formData.pay.toString() as any,
        category: formData.category,
        location: formData.location,
        isEmergency: formData.isEmergency,
        description: formData.description,
    });

    revalidatePath('/dashboard');
}


export async function getJobs() {
    try {
        return await db.select({
            job: jobs,
            owner: users
        })
            .from(jobs)
            .innerJoin(users, eq(jobs.ownerId, users.id))
            .orderBy(desc(jobs.createdAt));
    } catch (error) {
        console.error('CRITICAL DATABASE ERROR in getJobs:', error);
        return [];
    }
}

export async function getOwnerJobs() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        return await db.select().from(jobs)
            .where(eq(jobs.ownerId, user.id as any))
            .orderBy(desc(jobs.createdAt));
    } catch (error) {
        console.error('CRITICAL DATABASE ERROR in getOwnerJobs:', error);
        return [];
    }
}

export async function deleteJob(jobId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: 'Not authenticated' };

        // Verify ownership
        const job = await db.select().from(jobs).where(eq(jobs.id, jobId as any)).limit(1);

        if (!job.length || job[0].ownerId !== user.id) {
            return { success: false, message: 'Unauthorized' };
        }

        // Delete associated applications first to prevent foreign key constraint errors
        await db.delete(applications).where(eq(applications.jobId, jobId as any));

        // Delete associated ratings (Fix for foreign key constraint)
        await db.delete(ratings).where(eq(ratings.jobId, jobId as any));

        // Delete the job
        await db.delete(jobs).where(eq(jobs.id, jobId as any));

        revalidatePath('/dashboard');
        return { success: true, message: 'Job deleted successfully' };
    } catch (error: any) {
        console.error('Delete job error:', error);
        return { success: false, message: error.message || 'Failed to delete job' };
    }
}

export async function getWorkerJobFeed() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // If no user, just return jobs without application status
        if (!user) {
            const jobsData = await getJobs();
            return jobsData.map(j => ({ ...j, applicationStatus: null as string | null }));
        }

        const data = await db.select({
            job: jobs,
            owner: users,
            application: applications
        })
            .from(jobs)
            .innerJoin(users, eq(jobs.ownerId, users.id))
            .leftJoin(applications, and(
                eq(applications.jobId, jobs.id),
                eq(applications.workerId, user.id as any)
            ))
            .orderBy(desc(jobs.createdAt));

        // Format result to be similar structure but with application status
        return data.map(row => ({
            job: row.job,
            owner: row.owner,
            applicationStatus: row.application ? row.application.status : null
        }));

    } catch (error) {
        console.error('CRITICAL DATABASE ERROR in getWorkerJobFeed:', error);
        return [];
    }
}
