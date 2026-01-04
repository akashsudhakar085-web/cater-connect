'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="glass p-8 rounded-2xl w-full max-w-md space-y-6 text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold">Check your email</h2>
                    <p className="text-white/60">
                        We've sent a confirmation link to <span className="text-white font-medium">{email}</span>.
                        Please click the link to activate your account.
                    </p>
                    <Link
                        href="/auth/login"
                        className="btn-primary w-full py-3 block text-center mt-4"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="glass p-8 rounded-3xl w-full max-w-md space-y-8 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 blur-[80px]" />

                <div className="space-y-2 text-center relative">
                    <h1 className="text-4xl font-black italic tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                        JOIN THE CREW
                    </h1>
                    <p className="text-white/40 font-medium tracking-tight">Cater Connect • Enterprise Catering Feed</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-5 relative">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field w-full py-4 text-lg"
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Secure Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field w-full py-4 text-lg"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary/20"
                    >
                        {loading ? 'INITIALIZING...' : 'CREATE ACCOUNT'}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-white/40 text-sm">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-primary font-bold hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
