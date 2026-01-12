'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Check, Loader2, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';

export default function SubscriptionPage() {
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);
    const [tier, setTier] = useState<'FREE' | 'PRO'>('FREE');
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const loadSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }
            setUser(user);

            const { data } = await supabase
                .from('users')
                .select('tier, pro_expires_at')
                .eq('id', user.id)
                .single();

            if (data) {
                setTier(data.tier);
                setExpiresAt(data.pro_expires_at);
            }
            setLoading(false);
        };

        loadSubscription();
    }, [router, supabase]);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async (newTier: 'FREE' | 'PRO') => {
        if (!user) return;

        if (newTier === 'FREE') {
            // Downgrade logic (simple update)
            setUpgrading(true);
            try {
                const { error } = await supabase
                    .from('users')
                    .update({ tier: 'FREE' })
                    .eq('id', user.id);
                if (error) throw error;
                setTier('FREE');
                showToast({ message: 'Downgraded to Free plan', type: 'success' });
            } catch (error) {
                console.error(error);
                showToast({ message: 'Failed to downgrade', type: 'error' });
            } finally {
                setUpgrading(false);
            }
            return;
        }

        // Upgrade Logic with Razorpay
        setUpgrading(true);
        try {
            const res = await loadRazorpay();
            if (!res) {
                showToast({ message: 'Razorpay SDK failed to load', type: 'error' });
                return;
            }

            // Create Order
            const response = await fetch('/api/create-order', { method: 'POST' });
            const order = await response.json();

            if (order.error) {
                showToast({ message: 'Server error. Please try again', type: 'error' });
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Cater Connect',
                description: 'Pro Subscription',
                order_id: order.id,
                handler: async function (response: any) {
                    // Payment Success!
                    // In real production, verify signature server-side here.
                    // For now, assume success and update DB.

                    try {
                        const { error } = await supabase
                            .from('users')
                            .update({ tier: 'PRO' })
                            .eq('id', user.id);
                        if (error) throw error;
                        setTier('PRO');
                        showToast({ message: 'Payment Successful! Welcome to Pro', type: 'success' });
                    } catch (err) {
                        console.error(err);
                        showToast({ message: 'Payment success but update failed. Contact support', type: 'error' });
                    }
                },
                prefill: {
                    name: user.user_metadata?.full_name || 'User',
                    email: user.email,
                    contact: user.phone || '9999999999'
                },
                theme: {
                    color: '#FF0080' // Your primary/secondary color
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Error in payment flow:', error);
            showToast({ message: 'Something went wrong with payment', type: 'error' });
        } finally {
            setUpgrading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="p-4 space-y-8 max-w-4xl mx-auto">
            <header className="text-center space-y-2">
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">Pick Your Plan</h1>
                <p className="text-white/40">Unlock premium features and scale your catering business.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* FREE PLAN */}
                <div className={`glass p-8 rounded-[2rem] border-2 relative overflow-hidden transition-all ${tier === 'FREE' ? 'border-primary/50 bg-primary/5' : 'border-transparent'}`}>
                    {tier === 'FREE' && <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Current Plan</div>}

                    <div className="space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                            <Shield size={28} className="text-white/40" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tight">Starter</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-4xl font-black italic text-white">₹0</span>
                                <span className="text-xs font-bold text-white/40 uppercase">/ MONTH</span>
                            </div>
                        </div>
                        <ul className="space-y-4">
                            {['Basic Profile', 'View Open Gigs', 'Standard Applications'].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-white/60 font-medium">
                                    <Check size={16} className="text-white/20" /> {feat}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleUpgrade('FREE')}
                            disabled={tier === 'FREE' || upgrading}
                            className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {tier === 'FREE' ? 'Active' : 'Downgrade'}
                        </button>
                    </div>
                </div>

                {/* PRO PLAN */}
                <div className={`glass p-8 rounded-[2rem] border-2 relative overflow-hidden transition-all ${tier === 'PRO' ? 'border-secondary/50 bg-secondary/5' : 'border-secondary/20'}`}>
                    {tier === 'PRO' && <div className="absolute top-4 right-4 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Current Plan</div>}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/20 blur-[80px]" />

                    <div className="space-y-6 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                            <Zap size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">Pro Access</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-4xl font-black italic text-secondary">₹99</span>
                                <span className="text-xs font-bold text-white/40 uppercase">/ MONTH</span>
                            </div>
                        </div>
                        <ul className="space-y-4">
                            {['Verified Badge', 'Priority Applications', 'Direct Owner Chat', 'Emergency Alerts', 'Zero Platform Fees'].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                                    <div className="bg-secondary p-0.5 rounded-full"><Check size={12} className="text-black" /></div> {feat}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleUpgrade('PRO')}
                            disabled={tier === 'PRO' || upgrading}
                            className="w-full py-4 rounded-xl bg-secondary text-black font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all shadow-xl shadow-secondary/20"
                        >
                            {tier === 'PRO' ? 'Active Plan' : upgrading ? 'Processing...' : 'Upgrade Now'}
                        </button>
                        {tier === 'PRO' && expiresAt && (
                            <p className="text-center text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                Expires: {new Date(expiresAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
