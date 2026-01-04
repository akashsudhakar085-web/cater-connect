import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import 'dotenv/config';

export const createClient = async () => {
    const cookieStore = await cookies();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('Supabase URL or Key missing in server client! Auth will FAIL.');
    }

    return createServerClient(
        url ?? 'http://localhost:3000',
        key ?? 'missing-key',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
};
