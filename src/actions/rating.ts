'use server';

import { db } from '@/db';
import { ratings, users, jobs } from '@/db/schema';
import { createClient } from '@/lib/supabase-server';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notification';

export async function submitRating(
    jobId: string,
    ratedUserId: string,
    ratingValue: number,
    review: string = ''
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');
    if (ratingValue < 1 || ratingValue > 5) throw new Error('Rating must be 1-5');

    // 1. Check if already rated specifically for this job
    const existing = await db.select()
        .from(ratings)
        .where(
            and(
                eq(ratings.jobId, jobId as any),
                eq(ratings.raterId, user.id as any),
                eq(ratings.ratedUserId, ratedUserId as any)
            )
        )
        .limit(1);

    if (existing.length > 0) throw new Error('You have already rated this user for this job');

    // 2. Insert Rating
    await db.insert(ratings).values({
        jobId: jobId as any,
        raterId: user.id as any,
        ratedUserId: ratedUserId as any,
        rating: ratingValue,
        review: review
    });

    // 3. Update User's Average Rating
    // We can do this by fetching all ratings for the user and averaging
    const allRatings = await db.select({ rating: ratings.rating })
        .from(ratings)
        .where(eq(ratings.ratedUserId, ratedUserId as any));

    const totalStars = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const count = allRatings.length;
    const average = count > 0 ? (totalStars / count).toFixed(2) : '0';

    await db.update(users)
        .set({
            averageRating: average as any,
            ratingCount: count
        })
        .where(eq(users.id, ratedUserId as any));

    // 4. Notify the rated user
    await createNotification(
        ratedUserId,
        `You received a ${ratingValue}-star rating!`,
        `/dashboard/profile` // Or a relevant link
    );

    revalidatePath('/dashboard');
    return { success: true };
}

export async function hasUserRated(jobId: string, ratedUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const existing = await db.select()
        .from(ratings)
        .where(
            and(
                eq(ratings.jobId, jobId as any),
                eq(ratings.raterId, user.id as any),
                eq(ratings.ratedUserId, ratedUserId as any)
            )
        )
        .limit(1);

    return existing.length > 0;
}

export async function getUserRating(jobId: string, ratedUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const existing = await db.select()
        .from(ratings)
        .where(
            and(
                eq(ratings.jobId, jobId as any),
                eq(ratings.raterId, user.id as any),
                eq(ratings.ratedUserId, ratedUserId as any)
            )
        )
        .limit(1);

    return existing[0] || null;
}
