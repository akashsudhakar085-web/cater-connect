'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, MapPin, Clock, AlertCircle, MessageCircle } from 'lucide-react';
import { getJobs } from '@/actions/job';
import { applyToJob } from '@/actions/application';

export function WorkerDashboard({ user }: { user: any }) {
    const supabase = createClient();
    const queryClient = useQueryClient();

    const { data: jobs, isLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => await getJobs(),
    });

    useEffect(() => {
        const channel = supabase
            .channel('public:jobs')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
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

                    const handleApply = async (id: string) => {
                        try {
                            await applyToJob(id);
                            alert('Application sent! Ready for duty.');
                        } catch (err: any) {
                            alert(err.message);
                        }
                    };

                    const openWhatsApp = () => {
                        if (!owner?.phone) return alert('Owner has no comms channel active.');
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
                                    <p className="text-[10px] text-white/40 font-bold flex items-center gap-2">
                                        <span>OFFERED BY: {owner?.fullName || 'SYSTEM'}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black italic tracking-tighter text-secondary">${job.pay}</div>
                                    <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">PER HOUR</div>
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
                                <button
                                    onClick={() => handleApply(job.id)}
                                    className="flex-[2] py-3.5 rounded-2xl bg-white text-black font-black italic uppercase tracking-widest text-xs hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-white/5"
                                >
                                    Apply Now
                                </button>
                                <button
                                    onClick={openWhatsApp}
                                    className="flex-1 rounded-2xl bg-green-500 text-white font-black italic uppercase tracking-widest text-xs hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-500/20"
                                >
                                    <MessageCircle size={18} />
                                    <span>Chat</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
