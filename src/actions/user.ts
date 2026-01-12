'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase-server';

// Generate unique referral code from user's name: First 4 letters + 4 numbers (e.g., SANA4022)
function generateReferralCode(fullName: string): string {
    // Extract first 4 letters from name (remove spaces, convert to uppercase)
    const nameLetters = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const first4Letters = nameLetters.substring(0, 4).padEnd(4, 'X'); // Pad with X if name is short

    // Generate 4 random numbers
    const numbers = Math.floor(1000 + Math.random() * 9000).toString(); // Random 4-digit number

    return first4Letters + numbers;
}

export async function syncUserProfile(role: 'OWNER' | 'WORKER', fullName: string, phone: string, referralCodeParam?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    console.log('syncUserProfile called with:', { userId: user.id, email: user.email, role, fullName, phone, referralCodeParam });

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

            // Check for referral code - prioritize parameter, fallback to metadata
            const referralCode = referralCodeParam || user.user_metadata?.referred_by_code;
            let referredBy = null;

            if (referralCode) {
                console.log('Processing referral code:', referralCode);
                const referrer = await db.select().from(users).where(eq(users.referralCode, referralCode)).limit(1);

                if (referrer.length > 0) {
                    const refUser = referrer[0];
                    referredBy = refUser.id;

                    // Increment referrer count
                    // Logic: Cap at 5 for reward sake, but we can track total invites if we want. 
                    // User requested one-time reward at 5.
                    const newCount = (refUser.referralCount || 0) + 1;

                    // Grant Pro if they hit 5
                    if (newCount === 5) {
                        const proExpiry = new Date();
                        proExpiry.setMonth(proExpiry.getMonth() + 1); // 1 month from now

                        await db.update(users)
                            .set({
                                referralCount: newCount,
                                proExpiresAt: proExpiry
                            })
                            .where(eq(users.id, refUser.id as any));

                        console.log('Referrer reached 5! Granted 1 month Pro.');
                    } else {
                        await db.update(users)
                            .set({ referralCount: newCount })
                            .where(eq(users.id, refUser.id as any));

                        console.log(`Referrer count updated to ${newCount}`);
                    }
                }
            }

            // Insert new user with Supabase Auth ID
            await db.insert(users).values({
                id: user.id as any,
                email: user.email!,
                fullName,
                role,
                phone,
                referralCode: generateReferralCode(fullName), // Generate code from user's name + 4 numbers
                referredBy: referredBy, // Link to referrer
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

            // Logic to add referral code if missing (migration for existing users)
            const updateData: any = { fullName, role, phone };
            if (!existingUser.referralCode) {
                updateData.referralCode = generateReferralCode(fullName);
            }

            // Update existing user
            await db.update(users)
                .set(updateData)
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

export async function getAvailableWorkers() {
    const supabase = await createClient();

    // In a real app, we might filter by 'WORKER' role if strictly enforced,
    // or just return all users who have listed themselves.
    const { data: workers, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'WORKER')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching workers:', error);
        return [];
    }

    return workers;
}

// Action to generate a referral code for an existing user if they don't have one
export async function generateMissingReferralCode() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    try {
        const existingUsers = await db.select().from(users).where(eq(users.id, user.id as any)).limit(1);
        const existingUser = existingUsers[0];

        if (!existingUser) throw new Error('User profile not found');

        if (existingUser.referralCode) {
            return existingUser.referralCode; // Already exists
        }

        // Generate and save new code
        // Use user metadata name or fallback to full name from DB
        const fullName = existingUser.fullName || user.user_metadata?.full_name || 'User';
        const newCode = generateReferralCode(fullName);

        await db.update(users)
            .set({ referralCode: newCode })
            .where(eq(users.id, user.id as any));

        return newCode;
    } catch (error: any) {
        console.error('Error generating missing referral code:', error);
        throw new Error('Failed to generate referral code');
    }
}
