'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Briefcase, TrendingUp, AlertCircle, MapPin } from 'lucide-react';
import { CreateJobModal } from './CreateJobModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getOwnerJobs } from '@/actions/job';
import { ApplicationManager } from './ApplicationManager';
import { createClient } from '@/lib/supabase-client';

export function OwnerDashboard({ user }: { user: any }) {
    const [showModal, setShowModal] = useState(false);
    const supabase = createClient();
    const queryClient = useQueryClient();

    const { data: jobs, isLoading } = useQuery({
        queryKey: ['owner-jobs'],
        queryFn: async () => await getOwnerJobs(),
    });

    useEffect(() => {
        // Handle deep links (e.g. #job-123) after data loads
        if (!isLoading && window.location.hash) {
            const id = window.location.hash.substring(1);
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [isLoading]);

    useEffect(() => {
        const channel = supabase
            .channel('owner:updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
                queryClient.invalidateQueries({ queryKey: ['owner-jobs'] });
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
                queryClient.invalidateQueries({ queryKey: ['owner-jobs'] });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [queryClient, supabase]);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Headquarters</p>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">COMMAND</h1>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={32} />
                </button>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="glass p-5 rounded-[2rem] items-start flex flex-col gap-1 border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                    <Briefcase className="text-primary/60 mb-2" size={20} />
                    <span className="text-3xl font-black italic tracking-tighter">{jobs?.length || 0}</span>
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Active Ops</span>
                </div>
                <div className="glass p-5 rounded-[2rem] items-start flex flex-col gap-1 border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all" />
                    <Users className="text-secondary/60 mb-2" size={20} />
                    <span className="text-3xl font-black italic tracking-tighter">?</span>
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Total Crew</span>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between pl-1">
                    <h2 className="text-xs font-black uppercase tracking-widest text-white/20">Active Deployments</h2>
                </div>

                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-32 glass rounded-3xl" />
                        <div className="h-32 glass rounded-3xl" />
                    </div>
                ) : !jobs || jobs.length === 0 ? (
                    <div className="glass p-12 rounded-[2.5rem] text-center space-y-6 border-white/5 border-2 border-dashed relative overflow-hidden">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                            <TrendingUp size={40} />
                        </div>
                        <div className="space-y-2">
                            <p className="font-black italic uppercase tracking-tight text-xl">NO ACTIVE OPERATIONS</p>
                            <p className="text-sm text-white/40 font-medium">Your feed is currently dark. Post a gig to recruit crew.</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary px-8 py-4 rounded-2xl font-black italic uppercase tracking-widest"
                        >
                            INITIATE POSTING
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {jobs.map((job) => (
                            <div key={job.id} id={`job-${job.id}`} className="glass p-6 rounded-[2.5rem] border-white/5 space-y-6 relative overflow-hidden scroll-mt-24">
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{job.category}</span>
                                            <span className="text-white/20 px-1">•</span>
                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/40">
                                                <MapPin size={10} className="text-secondary" />
                                                {job.location}
                                            </div>
                                            {job.isEmergency && <span className="text-[8px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded font-black uppercase">Immediate</span>}
                                        </div>
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">{job.title}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black italic tracking-tighter">${job.pay}</div>
                                        <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest">RATE / HR</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <ApplicationManager jobId={job.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && <CreateJobModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
