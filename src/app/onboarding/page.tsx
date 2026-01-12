'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { syncUserProfile } from '@/actions/user';
import { showToast } from '@/lib/toast';

function RoleSelectionForm() {
    const [role, setRole] = useState<'OWNER' | 'WORKER' | null>(null);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Extract referral code from URL
        const ref = searchParams.get('ref');
        if (ref) {
            setReferralCode(ref);
        }
    }, [searchParams]);

    useEffect(() => {
        async function checkProfile() {
            try {
                const response = await fetch('/api/user/me');
                const data = await response.json();
                if (data?.dbUser?.role && data?.dbUser?.fullName && data?.dbUser?.phone) {
                    router.replace('/dashboard');
                } else if (data?.dbUser) {
                    // Pre-fill existing data so they only fill what's missing
                    if (data.dbUser.role) setRole(data.dbUser.role);
                    if (data.dbUser.fullName) setFullName(data.dbUser.fullName);
                    if (data.dbUser.phone) setPhone(data.dbUser.phone);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setChecking(false);
            }
        }
        checkProfile();
    }, [router]);

    const handleComplete = async () => {
        if (!role || !fullName || !phone) return;
        setLoading(true);
        try {
            await syncUserProfile(role, fullName, phone, referralCode || undefined);
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            showToast({ message: 'Failed to save profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (checking) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-primary font-bold uppercase tracking-widest text-sm">Verifying Session...</div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="glass p-8 rounded-3xl w-full max-w-md space-y-8 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px]" />

                <div className="text-center relative">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap">SET UP YOUR SHIP</h1>
                    <p className="text-white/40 text-sm font-medium">Complete your profile to start hiring or earning</p>
                </div>

                <div className="space-y-5 relative">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Full Legal Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="input-field w-full py-4"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">WhatsApp Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="input-field w-full py-4"
                            placeholder="+91 98765 43210"
                        />
                        <p className="text-[10px] text-white/20 ml-1">Used for real-time hiring & communication</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Referral Code (Optional)</label>
                        <input
                            type="text"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                            className="input-field w-full py-4"
                            placeholder="Enter referral code"
                        />
                        <p className="text-[10px] text-white/20 ml-1">Get rewards when you use a friend's code</p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Choose your station</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setRole('OWNER')}
                                className={`p-5 rounded-2xl border-2 transition-all text-center space-y-2 relative overflow-hidden group ${role === 'OWNER' ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="text-2xl group-hover:scale-125 transition-all">👨‍💼</div>
                                <div className="font-black italic text-sm tracking-tight uppercase">OWNER</div>
                                <div className="text-[10px] text-white/30 font-bold leading-tight">POST GIGS &<br />HIRE CREW</div>
                            </button>
                            <button
                                onClick={() => setRole('WORKER')}
                                className={`p-5 rounded-2xl border-2 transition-all text-center space-y-2 relative overflow-hidden group ${role === 'WORKER' ? 'border-secondary bg-secondary/10' : 'border-white/5 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="text-2xl group-hover:scale-125 transition-all">🔪</div>
                                <div className="font-black italic text-sm tracking-tight uppercase">CREW</div>
                                <div className="text-[10px] text-white/30 font-bold leading-tight">FIND GIGS &<br />GET PAID</div>
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleComplete}
                    disabled={!role || !fullName || !phone || loading}
                    className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary/20 relative overflow-hidden group"
                >
                    <span className="relative z-10 font-black italic uppercase tracking-widest">
                        {loading ? 'INITIALIZING...' : 'FINISH COMMISSION'}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
            </div>
        </div>
    );
}

export default function RoleSelectionPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-primary font-bold uppercase tracking-widest text-sm">Loading...</div>
            </div>
        }>
            <RoleSelectionForm />
        </Suspense>
    );
}
