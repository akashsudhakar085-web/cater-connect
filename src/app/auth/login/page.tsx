'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="glass p-8 rounded-3xl w-full max-w-md space-y-8 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 blur-[80px]" />

                <div className="space-y-2 text-center relative">
                    <h1 className="text-4xl font-black italic tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                        WELCOME BACK
                    </h1>
                    <p className="text-white/40 font-medium tracking-tight">Cater Connect • Enterprise Catering Feed</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5 relative">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Work Email</label>
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
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Password</label>
                            <button type="button" className="text-[10px] font-bold text-primary/60 hover:text-primary uppercase tracking-wider">Forgot?</button>
                        </div>
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
                        {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-white/40 text-sm">
                        New to the platform?{' '}
                        <Link href="/auth/signup" className="text-primary font-bold hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
