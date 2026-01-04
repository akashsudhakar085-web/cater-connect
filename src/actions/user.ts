'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase-server';

export async function syncUserProfile(role: 'OWNER' | 'WORKER', fullName: string, phone: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    console.log('syncUserProfile called with:', { userId: user.id, email: user.email, role, fullName, phone });

    try {
        // Use Supabase Auth ID as the source of truth
        const existingUsers = await db.select().from(users).where(eq(users.id, user.id as any)).limit(1);
        const existingUser = existingUsers[0];

        console.log('Existing user check:', existingUser ? 'Found' : 'Not found');

        if (!existingUser) {
            // Only check for duplicate phone (email is handled by Supabase Auth)
            const phoneCheck = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
            console.log('Phone duplicate check:', phoneCheck.length > 0 ? 'Duplicate found' : 'Available');

            if (phoneCheck.length > 0) {
                throw new Error('This phone number is already registered. Please use a different phone number.');
            }

            console.log('Attempting to insert new user...');
            // Insert new user with Supabase Auth ID
            await db.insert(users).values({
                id: user.id as any,
                email: user.email!,
                fullName,
                role,
                phone,
            });
            console.log('User inserted successfully');
        } else {
            // When updating, check if phone is being changed to one that's already in use by a different user
            if (existingUser.phone !== phone) {
                const phoneCheck = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
                if (phoneCheck.length > 0 && phoneCheck[0].id !== user.id) {
                    throw new Error('This phone number is already in use by another account.');
                }
            }

            console.log('Attempting to update existing user...');
            // Update existing user
            await db.update(users)
                .set({ fullName, role, phone })
                .where(eq(users.id, user.id as any));
            console.log('User updated successfully');
        }
    } catch (error: any) {
        console.error('DATABASE ERROR in syncUserProfile:', error);
        console.error('Error details:', { message: error.message, code: error.code, detail: error.detail });

        // Re-throw user-friendly errors as-is
        if (error.message?.includes('phone number')) {
            throw error;
        }

        // Check for specific database constraint errors
        if (error.code === '23505') { // Unique constraint violation
            if (error.detail?.includes('email')) {
                throw new Error('This email is already registered with a different account.');
            }
            if (error.detail?.includes('phone')) {
                throw new Error('This phone number is already registered. Please use a different phone number.');
            }
        }

        // For other database errors, provide a generic message
        throw new Error(`Failed to save profile: ${error.message || 'Unknown error'}`);
    }
}

export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    try {
        const dbUsers = await db.select().from(users).where(eq(users.id, user.id as any)).limit(1);
        const dbUser = dbUsers[0];

        return {
            supabaseUser: user,
            dbUser: dbUser ?? null,
        };
    } catch (error) {
        console.error('Database Error in getCurrentUser:', error);
        // Return the supabase user even if DB fails to prevent total crash
        return {
            supabaseUser: user,
            dbUser: null,
            error: 'Database connection failed'
        };
    }
}
