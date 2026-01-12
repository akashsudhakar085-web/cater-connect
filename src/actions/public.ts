'use server';

import { db } from '@/db';
import { jobs, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// Fetch recent jobs for public display (No contact info)
export async function getPublicJobs(limit = 10) {
    try {
        const results = await db.select({
            id: jobs.id,
            title: jobs.title,
            description: jobs.description,
            pay: jobs.pay,
            category: jobs.category,
            location: jobs.location,
            createdAt: jobs.createdAt,
            ownerName: users.fullName,
            ownerAvatar: users.avatarUrl,
        })
            .from(jobs)
            .innerJoin(users, eq(jobs.ownerId, users.id))
            .where(eq(jobs.status, 'OPEN'))
            .orderBy(desc(jobs.createdAt))
            .limit(limit);

        return results;
    } catch (error) {
        console.error('Error fetching public jobs:', error);
        return [];
    }
}

// Fetch recent workers for public display (No phone/contact)
export async function getPublicWorkers(limit = 10) {
    try {
        const results = await db.select({
            id: users.id,
            fullName: users.fullName,
            avatarUrl: users.avatarUrl,
            role: users.role,
            serviceRole: users.serviceRole,
            baseLocation: users.baseLocation,
            dailyRate: users.dailyRate,
            createdAt: users.createdAt,
        })
            .from(users)
            .where(eq(users.role, 'WORKER'))
            .orderBy(desc(users.createdAt))
            .limit(limit);

        return results;
    } catch (error) {
        console.error('Error fetching public workers:', error);
        return [];
    }
}
