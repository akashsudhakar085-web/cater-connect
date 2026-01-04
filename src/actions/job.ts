'use server';

import { db } from '@/db';
import { jobs, users } from '@/db/schema';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
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
