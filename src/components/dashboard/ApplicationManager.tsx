'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { updateApplicationStatus, getApplicationsForJob } from '@/actions/application';
import { Check, X, User, MessageCircle } from 'lucide-react';

export function ApplicationManager({ jobId }: { jobId: string }) {
    const [applications, setApplications] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchApps = async () => {
            const data = await getApplicationsForJob(jobId);
            setApplications(data || []);
        };

        fetchApps();

        const channel = supabase
            .channel(`applications:${jobId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'applications',
                filter: `job_id=eq.${jobId}`
            }, () => {
                fetchApps();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [jobId]);

    const handleStatus = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
        try {
            await updateApplicationStatus(id, status);
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase text-white/40 tracking-widest">Applications</h3>
            {applications.length === 0 ? (
                <p className="text-sm text-white/20 italic">No applications yet...</p>
            ) : (
                <div className="grid gap-2">
                    {applications.map((item) => {
                        const app = item.application;
                        const worker = item.worker;

                        const openWhatsApp = () => {
                            if (!worker?.phone) return alert('No WhatsApp number provided by worker');
                            const msg = encodeURIComponent(`Hi ${worker.fullName}, this is regarding your application for the catering gig on Cater Connect!`);
                            window.open(`https://wa.me/${worker.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
                        };

                        return (
                            <div key={app.id} className="glass p-4 rounded-2xl flex items-center justify-between border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-primary">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm tracking-tight">{worker?.fullName || 'Anonymous Worker'}</p>
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${app.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                            'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 items-center">
                                    <button
                                        onClick={openWhatsApp}
                                        className="py-2.5 px-4 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-green-500/20"
                                    >
                                        <MessageCircle size={16} />
                                        <span className="text-[10px] font-black italic uppercase tracking-widest">Hire</span>
                                    </button>

                                    {app.status === 'PENDING' && (
                                        <div className="flex gap-1.5 ml-1">
                                            <button
                                                onClick={() => handleStatus(app.id, 'ACCEPTED')}
                                                className="p-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleStatus(app.id, 'REJECTED')}
                                                className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 border border-white/5 transition-all active:scale-95"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
