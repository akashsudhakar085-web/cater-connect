import { createBrowserClient } from '@supabase/ssr';

let supabase: ReturnType<typeof createBrowserClient> | undefined;

export const createClient = () => {
    if (supabase) return supabase;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('Supabase URL or Key missing in browser client!');
    }

    supabase = createBrowserClient(
        url ?? 'http://localhost:3000',
        key ?? 'missing-key'
    );

    return supabase;
};
