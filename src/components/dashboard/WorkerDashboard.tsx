'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, MapPin, Clock, AlertCircle, MessageCircle, Check } from 'lucide-react';
import { getWorkerJobFeed } from '@/actions/job';
import { applyToJob } from '@/actions/application';
import { ProUpgradeModal } from './ProUpgradeModal';
import { showToast } from '@/lib/toast';
import { StarRating } from '@/components/common/StarRating';
import Link from 'next/link';

export function WorkerDashboard({ user }: { user: any }) {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const { data: jobs, isLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => await getWorkerJobFeed(),
    });

    useEffect(() => {
        const channel = supabase
            .channel('public:jobs')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
                queryClient.invalidateQueries({ queryKey: ['jobs'] });
            })
            // Also listen to applications changes to update status immediately
            .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
                queryClient.invalidateQueries({ queryKey: ['jobs'] });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient, supabase]);

    if (isLoading) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-pulse text-xs font-black uppercase tracking-widest text-white/20">Scanning available gigs...</div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Intel Feed</h2>
            </div>

            <div className="grid gap-4">
                {jobs?.map((item) => {
                    const job = item.job;
                    const owner = item.owner;
                    const status = item.applicationStatus; // PENDING, ACCEPTED, REJECTED, STARTED, COMPLETED

                    const handleApply = async (id: string) => {
                        try {
                            const result = await applyToJob(id);
                            if (result && result.success) {
                                showToast({ message: 'Application sent! Ready for duty.', type: 'success' });
                                queryClient.invalidateQueries({ queryKey: ['jobs'] });
                            } else {
                                showToast({ message: result?.message || 'Failed to apply', type: 'error' });
                            }
                        } catch (err: any) {
                            showToast({ message: err.message || 'Network error', type: 'error' });
                        }
                    };

                    const openWhatsApp = () => {
                        if (!owner?.phone) {
                            showToast({ message: 'Owner has no contact available.', type: 'warning' });
                            return;
                        }
                        const msg = encodeURIComponent(`Hi ${owner.fullName}, I'm interested in the "${job.title}" gig on Cater Connect!`);
                        window.open(`https://wa.me/${owner.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
                    };

                    return (
                        <div key={job.id} className="glass p-6 rounded-[2.5rem] space-y-5 relative overflow-hidden group transition-all hover:border-white/10 border-white/5">
                            {job.isEmergency && (
                                <div className="absolute top-0 right-[-40px] bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-12 py-1 rotate-45 shadow-lg z-20">
                                    Emergency
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={12} className="text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{job.category}</span>
                                    </div>
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase leading-tight">{job.title}</h3>
                                    <div className="text-[10px] text-white/40 font-bold flex flex-col gap-1">
                                        <span>OFFERED BY: {owner?.fullName || 'SYSTEM'}</span>
                                        {owner && (
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <StarRating rating={Number(owner.averageRating || 0)} size={10} />
                                                <span className="text-white/40">({owner.ratingCount || 0})</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black italic tracking-tighter text-secondary">₹{job.pay}</div>
                                    <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">PER DAY</div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-white/40">
                                    <MapPin size={12} className="text-secondary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{job.location || 'REMOTE'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white/40">
                                    <Clock size={12} className="text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">4-6 HOURS</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                {/* Dynamic Status Button */}
                                {!status ? (
                                    <button
                                        onClick={() => handleApply(job.id)}
                                        className="flex-[2] py-3.5 rounded-2xl bg-white text-black font-black italic uppercase tracking-widest text-xs hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-white/5"
                                    >
                                        <span>Apply Now</span>
                                    </button>
                                ) : status === 'PENDING' ? (
                                    <button disabled className="flex-[2] py-3.5 rounded-2xl bg-white/10 text-white/40 font-bold uppercase tracking-widest text-xs cursor-not-allowed border border-white/5">
                                        Processing Application...
                                    </button>
                                ) : status === 'ACCEPTED' ? (
                                    <Link href="/dashboard/my-applications" className="flex-[2] py-3.5 rounded-2xl bg-green-500 text-white font-black italic uppercase tracking-widest text-xs hover:bg-green-600 text-center shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                                        <Check size={16} strokeWidth={3} />
                                        <span>Accepted! View Job</span>
                                    </Link>
                                ) : status === 'STARTED' ? (
                                    <Link href="/dashboard/my-applications" className="flex-[2] py-3.5 rounded-2xl bg-blue-500 text-white font-black italic uppercase tracking-widest text-xs hover:bg-blue-600 text-center shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                        <Clock size={16} strokeWidth={3} />
                                        <span>Job In Progress</span>
                                    </Link>
                                ) : status === 'COMPLETED' ? (
                                    <Link href="/dashboard/my-applications" className="flex-[2] py-3.5 rounded-2xl bg-yellow-500 text-white font-black italic uppercase tracking-widest text-xs hover:bg-yellow-600 text-center shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2">
                                        <StarRating rating={0} size={14} />
                                        <span>Job Completed</span>
                                    </Link>
                                ) : status === 'REJECTED' ? (
                                    <button disabled className="flex-[2] py-3.5 rounded-2xl bg-red-500/10 text-red-400 font-bold uppercase tracking-widest text-xs cursor-not-allowed border border-red-500/10">
                                        Application Rejected
                                    </button>
                                ) : null}

                                <button
                                    onClick={() => {
                                        if (user.tier === 'FREE') {
                                            setShowUpgradeModal(true);
                                            return;
                                        }
                                        openWhatsApp();
                                    }}
                                    className="flex-1 rounded-2xl bg-white/5 text-white/60 font-black italic uppercase tracking-widest text-xs hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/5"
                                >
                                    <MessageCircle size={18} />
                                    <span>Chat</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {showUpgradeModal && <ProUpgradeModal onClose={() => setShowUpgradeModal(false)} />}
        </div>
    );
}
