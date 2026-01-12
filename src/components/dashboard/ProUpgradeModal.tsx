'use client';

import { X, Zap, Bell, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProUpgradeModal({ onClose }: { onClose: () => void }) {
    const router = useRouter();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className="relative glass-dark border border-secondary/20 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl shadow-secondary/10">
                {/* Decorative Elements */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-[80px]" />

                <div className="relative z-10 p-8 text-center space-y-6">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/40 hover:bg-white/5 rounded-full">
                        <X size={20} />
                    </button>

                    <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary/20 shadow-[0_0_30px_-10px_rgba(255,0,128,0.3)]">
                        <Zap size={40} className="text-secondary" />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Upgrade to Pro</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Unlock Elite Command Features</p>
                    </div>

                    <div className="space-y-3 text-left bg-white/5 p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-full bg-red-500/20 text-red-500"><Bell size={12} /></div>
                            <span className="text-xs font-bold text-white/80">Urgent Emergency Flagging</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-500"><Bell size={12} /></div>
                            <span className="text-xs font-bold text-white/80">Direct Worker Contact</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-full bg-yellow-500/20 text-yellow-500"><Star size={12} /></div>
                            <span className="text-xs font-bold text-white/80">Top of Feed Visibility</span>
                        </div>
                    </div>

                    <button
                        onClick={() => { onClose(); router.push('/dashboard/subscription'); }}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all text-white"
                    >
                        Upgrade Now - ₹99
                    </button>

                    <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}
