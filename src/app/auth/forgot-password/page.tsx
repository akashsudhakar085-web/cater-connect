'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="glass p-8 rounded-3xl w-full max-w-md space-y-8 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 blur-[80px]" />

                <div className="space-y-2 text-center relative">
                    <h1 className="text-3xl font-black italic tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                        RESET PASSWORD
                    </h1>
                    <p className="text-white/40 font-medium tracking-tight">Enter your email to receive a reset link</p>
                </div>

                {!success ? (
                    <form onSubmit={handleReset} className="space-y-5 relative">
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
                            {loading ? 'SENDING LINK...' : 'SEND RESET LINK'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-5 text-center">
                        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
                            Check your email for the password reset link!
                        </div>
                    </div>
                )}

                <div className="text-center pt-2">
                    <Link href="/auth/login" className="text-white/40 text-sm font-bold hover:text-white transition-colors">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
