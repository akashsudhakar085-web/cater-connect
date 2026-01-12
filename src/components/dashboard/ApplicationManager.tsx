'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { updateApplicationStatus, getApplicationsForJob, rejectPendingApplications } from '@/actions/application';
import { Check, X, User, MessageCircle, Trash2 } from 'lucide-react';
import { RatingModal } from '@/components/jobs/RatingModal';
import { StarRating } from '@/components/common/StarRating';
import { showToast } from '@/lib/toast';

export function ApplicationManager({ jobId }: { jobId: string }) {
    const [applications, setApplications] = useState<any[]>([]);
    const [ratingModal, setRatingModal] = useState<{ show: boolean, jobId: string, workerId: string, workerName: string } | null>(null);
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

    const handleStatus = async (id: string, status: 'ACCEPTED' | 'REJECTED' | 'STARTED' | 'COMPLETED') => {
        try {
            await updateApplicationStatus(id, status);
            showToast({ message: `Application ${status.toLowerCase()}`, type: 'success' });
        } catch (error) {
            showToast({ message: 'Failed to update status', type: 'error' });
        }
    };

    const handleClearPending = async () => {
        if (!confirm('Are you sure you want to reject all pending applications?')) return;
        try {
            await rejectPendingApplications(jobId);
            showToast({ message: 'All pending applications rejected', type: 'success' });
        } catch (error) {
            showToast({ message: 'Failed to clear applications', type: 'error' });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-white/40 tracking-widest">Applications</h3>
                {applications.some(a => a.application.status === 'PENDING') && (
                    <button
                        onClick={handleClearPending}
                        className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                        <Trash2 size={12} /> Clear Pending
                    </button>
                )}
            </div>
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
                                        <div className="flex items-center gap-1 mb-1">
                                            <StarRating rating={Number(worker?.averageRating || 0)} size={10} />
                                            <span className="text-[9px] text-white/40 underline">({worker?.ratingCount || 0} reviews)</span>
                                        </div>
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
                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {app.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatus(app.id, 'ACCEPTED')}
                                                    className="p-2 bg-green-500/10 text-green-400 rounded-full hover:bg-green-500/20 hover:scale-105 transition-all"
                                                    title="Accept"
                                                >
                                                    <Check size={16} strokeWidth={3} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatus(app.id, 'REJECTED')}
                                                    className="p-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 hover:scale-105 transition-all"
                                                    title="Reject"
                                                >
                                                    <X size={16} strokeWidth={3} />
                                                </button>
                                            </>
                                        )}

                                        {app.status === 'ACCEPTED' && (
                                            <button
                                                onClick={() => handleStatus(app.id, 'STARTED')}
                                                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-500/30 transition-all flex items-center gap-1"
                                            >
                                                Start Job
                                            </button>
                                        )}

                                        {app.status === 'STARTED' && (
                                            <button
                                                onClick={() => handleStatus(app.id, 'COMPLETED')}
                                                className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-purple-500/30 transition-all flex items-center gap-1"
                                            >
                                                Complete
                                            </button>
                                        )}

                                        {app.status === 'COMPLETED' && (
                                            <button
                                                onClick={() => setRatingModal({
                                                    show: true,
                                                    jobId,
                                                    workerId: app.workerId,
                                                    workerName: worker?.fullName || 'Worker'
                                                })}
                                                disabled={false} // Would check if rated
                                                className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-yellow-500/30 transition-all flex items-center gap-1"
                                            >
                                                Rate Worker
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {app.status === 'REJECTED' && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl pointer-events-none">
                                        <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-black uppercase tracking-widest border border-red-500/20 transform -rotate-12">
                                            Rejected
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {ratingModal && (
                <RatingModal
                    jobId={ratingModal.jobId}
                    ratedUserId={ratingModal.workerId}
                    ratedUserName={ratingModal.workerName}
                    onClose={() => setRatingModal(null)}
                    onSuccess={() => setRatingModal(null)} // Optionally refresh list or UI state
                />
            )}
        </div>
    );
}
