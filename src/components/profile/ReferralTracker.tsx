'use client';

import { useState } from 'react';
import { Copy, Check, Users, Gift, MessageCircle, Send } from 'lucide-react';

export function ReferralTracker({
    referralCode,
    referralCount,
    proExpiresAt,
    onCodeGenerated
}: {
    referralCode: string | null,
    referralCount: number,
    proExpiresAt: string | null,
    onCodeGenerated?: (code: string) => void
}) {
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [localCode, setLocalCode] = useState<string | null>(referralCode);

    // Update local state if prop changes
    if (referralCode && referralCode !== localCode) {
        setLocalCode(referralCode);
    }

    // Dynamic sharing data - point to signup page
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/signup?ref=${localCode}` : '';
    const shareText = `Join me on Cater Connect! Use my code ${localCode} to skip the waitlist:`;

    const handleShare = (platform: 'whatsapp' | 'telegram') => {
        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        } else {
            window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        }
    };

    const handleCopy = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Hide if goal reached (5 referrals)
    if (referralCount >= 5) {
        return null;
    }

    // Cap at 5 for the progress bar
    const progress = Math.min(referralCount, 5);
    const progressPercent = (progress / 5) * 100;
    const isProViaReferral = proExpiresAt && new Date(proExpiresAt) > new Date();

    return (
        <div className="glass p-6 rounded-3xl space-y-6 relative overflow-hidden border-orange-500/20">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[60px]" />

            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-orange-400">
                        <Gift size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Free Pro Access</span>
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Invite Friends</h3>
                    <p className="text-xs text-white/40 max-w-[200px]">Get 1 Month of Pro features for every 5 friends who join.</p>
                </div>
                <div className="text-right">
                    <span className="text-4xl font-black italic text-white">{progress}</span>
                    <span className="text-xl font-black italic text-white/20">/5</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-5">
                <div className="space-y-2">
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-1000 ease-out relative"
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/30">
                        <span>{referralCount} Joined</span>
                        <span>Goal: 5</span>
                    </div>
                </div>

                {/* Share Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleShare('whatsapp')}
                        className="py-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl flex items-center justify-center gap-2 hover:bg-[#25D366]/20 transition-all group"
                    >
                        <MessageCircle size={16} className="text-[#25D366]" />
                        <span className="text-[#25D366] font-black text-[10px] uppercase tracking-widest group-hover:scale-105 transition-transform">WhatsApp</span>
                    </button>
                    <button
                        onClick={() => handleShare('telegram')}
                        className="py-3 bg-[#0088cc]/10 border border-[#0088cc]/20 rounded-xl flex items-center justify-center gap-2 hover:bg-[#0088cc]/20 transition-all group"
                    >
                        <Send size={16} className="text-[#0088cc]" />
                        <span className="text-[#0088cc] font-black text-[10px] uppercase tracking-widest group-hover:scale-105 transition-transform">Telegram</span>
                    </button>
                </div>
            </div>

            {/* Referral Code */}
            {localCode ? (
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Your Invite Code</label>
                    <button
                        onClick={handleCopy}
                        className="w-full bg-black/30 border border-dashed border-white/20 rounded-xl p-4 flex items-center justify-between group hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
                    >
                        <span className="font-mono text-lg font-bold tracking-widest text-orange-400">{localCode}</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-white/40 group-hover:text-white transition-colors">
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            {copied ? 'COPIED' : 'COPY'}
                        </div>
                    </button>
                    <p className="text-[10px] text-white/30 text-center pt-2">
                        Share this code. Each friend gets their own unique link when they use it.
                    </p>
                </div>
            ) : (
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                    <p className="text-xs text-white/40">You don't have a referral code yet.</p>
                    <button
                        onClick={async () => {
                            try {
                                setGenerating(true);
                                // Dynamically import the action to avoid build issues if mixed component
                                const { generateMissingReferralCode } = await import('@/actions/user');
                                const code = await generateMissingReferralCode();
                                setLocalCode(code);
                                if (onCodeGenerated) onCodeGenerated(code);
                            } catch (error) {
                                console.error('Failed to generate code:', error);
                            } finally {
                                setGenerating(false);
                            }
                        }}
                        disabled={generating}
                        className="btn-primary py-2 px-6 rounded-xl text-xs font-bold uppercase tracking-widest"
                    >
                        {generating ? 'Creating...' : 'Generate My Code'}
                    </button>
                </div>
            )}

            {isProViaReferral && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                    <div className="p-1 bg-green-500 rounded-full text-black"><Check size={10} /></div>
                    <div>
                        <p className="text-xs font-bold text-green-400">Pro Active via Referrals</p>
                        <p className="text-[10px] text-green-500/60 font-medium">Expires: {new Date(proExpiresAt!).toLocaleDateString()}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
