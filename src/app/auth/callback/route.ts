import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const ref = searchParams.get('ref'); // Get referral code
    const next = searchParams.get('next') ?? '/onboarding';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // If there's a referral code, pass it to onboarding
            const redirectUrl = ref ? `${origin}/onboarding?ref=${ref}` : `${origin}${next}`;
            return NextResponse.redirect(redirectUrl);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate user`);
}
