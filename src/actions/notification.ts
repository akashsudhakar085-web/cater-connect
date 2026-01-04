'use server';

import { db } from '@/db';
import { notifications } from '@/db/schema';
import { createClient } from '@/lib/supabase-server';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createNotification(userId: string, message: string, link?: string) {
    await db.insert(notifications).values({
        userId: userId as any,
        message,
        link,
    });
}

export async function getNotifications() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        return await db.select()
            .from(notifications)
            .where(eq(notifications.userId, user.id as any))
            .orderBy(desc(notifications.createdAt))
            .limit(20);
    } catch (error) {
        console.error('DATABASE ERROR in getNotifications:', error);
        return [];
    }
}

export async function markAsRead(notificationId: string) {
    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId as any));
    revalidatePath('/dashboard/notifications');
}
