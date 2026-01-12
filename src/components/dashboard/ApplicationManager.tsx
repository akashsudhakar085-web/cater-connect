'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { updateApplicationStatus, getApplicationsForJob, rejectPendingApplications } from '@/actions/application';
import { Check, X, User, MessageCircle, Trash2 } from 'lucide-react';
import { RatingModal } from '@/components/jobs/RatingModal';
import { ViewRatingModal } from '@/components/jobs/ViewRatingModal';
import { StarRating } from '@/components/common/StarRating';
import { showToast } from '@/lib/toast';
import { ProUpgradeModal } from '@/components/dashboard/ProUpgradeModal';
import { getUserRating } from '@/actions/rating';

export function ApplicationManager({ jobId, isPro }: { jobId: string, isPro: boolean }) {
    const [applications, setApplications] = useState<any[]>([]);
    const [ratingModal, setRatingModal] = useState<{ show: boolean, jobId: string, workerId: string, workerName: string } | null>(null);
    const [viewRatingModal, setViewRatingModal] = useState<{ workerName: string, rating: number, review: string } | null>(null);
    const [showProModal, setShowProModal] = useState(false);
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
            const result = await rejectPendingApplications(jobId);
            if (result.success) {
                showToast({ message: result.message || 'All pending applications rejected', type: 'success' });
            } else {
                showToast({ message: result.message || 'Failed to clear applications', type: 'error' });
            }
        } catch (error) {
            showToast({ message: 'An error occurred', type: 'error' });
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
                        const hasRated = item.hasRated;

                        const openWhatsApp = () => {
                            if (!worker?.phone) {
                                showToast({ message: 'No WhatsApp number provided by worker', type: 'error' });
                                return;
                            }
                            const msg = encodeURIComponent(`Hi ${worker.fullName}, this is regarding your application for the catering gig on Cater Connect!`);
                            window.open(`https://wa.me/${worker.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
                        };

                        return (
                            <div key={app.id} className="relative glass p-5 rounded-2xl border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left: Worker Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                                            <User size={24} className="text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-base tracking-tight mb-1">{worker?.fullName || 'Anonymous Worker'}</h4>

                                            {/* Star Rating - Prominent */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <StarRating rating={Number(worker?.averageRating || 0)} size={14} />
                                                <span className="text-xs text-white/40">({worker?.ratingCount || 0} reviews)</span>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${app.status === 'COMPLETED' ? 'bg-purple-500/20 text-purple-400' :
                                                        app.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                                            app.status === 'STARTED' ? 'bg-blue-500/20 text-blue-400' :
                                                                app.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                                    'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                                {hasRated && app.status === 'COMPLETED' && (
                                                    <span className="text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider bg-white/5 text-white/60">
                                                        RATED ✓
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex flex-col gap-2 items-end">
                                        {isPro && app.status !== 'REJECTED' && (
                                            <button
                                                onClick={openWhatsApp}
                                                className="py-2 px-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-green-500/20 text-xs font-black uppercase tracking-widest"
                                            >
                                                <MessageCircle size={14} />
                                                Hire
                                            </button>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {app.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={async () => {
                                                            setApplications(prev => prev.map(p => p.application.id === app.id ? { ...p, application: { ...p.application, status: 'ACCEPTED' } } : p));
                                                            await handleStatus(app.id, 'ACCEPTED');
                                                        }}
                                                        className="p-2 bg-green-500/10 text-green-400 rounded-full hover:bg-green-500/20 hover:scale-110 transition-all"
                                                        title="Accept"
                                                    >
                                                        <Check size={16} strokeWidth={3} />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            setApplications(prev => prev.map(p => p.application.id === app.id ? { ...p, application: { ...p.application, status: 'REJECTED' } } : p));
                                                            await handleStatus(app.id, 'REJECTED');
                                                        }}
                                                        className="p-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 hover:scale-110 transition-all"
                                                        title="Reject"
                                                    >
                                                        <X size={16} strokeWidth={3} />
                                                    </button>
                                                </>
                                            )}

                                            {app.status === 'ACCEPTED' && (
                                                <button
                                                    onClick={async () => {
                                                        setApplications(prev => prev.map(p => p.application.id === app.id ? { ...p, application: { ...p.application, status: 'STARTED' } } : p));
                                                        await handleStatus(app.id, 'STARTED');
                                                    }}
                                                    className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-500/30 transition-all"
                                                >
                                                    Start Job
                                                </button>
                                            )}

                                            {app.status === 'STARTED' && (
                                                <button
                                                    onClick={async () => {
                                                        setApplications(prev => prev.map(p => p.application.id === app.id ? { ...p, application: { ...p.application, status: 'COMPLETED' } } : p));
                                                        await handleStatus(app.id, 'COMPLETED');
                                                    }}
                                                    className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-purple-500/30 transition-all"
                                                >
                                                    Complete
                                                </button>
                                            )}

                                            {app.status === 'COMPLETED' && (
                                                !hasRated ? (
                                                    <button
                                                        onClick={() => setRatingModal({
                                                            show: true,
                                                            jobId,
                                                            workerId: app.workerId,
                                                            workerName: worker?.fullName || 'Worker'
                                                        })}
                                                        className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-yellow-500/30 transition-all"
                                                    >
                                                        Rate Worker
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={async () => {
                                                            const existingRating = await getUserRating(jobId, app.workerId);
                                                            if (existingRating) {
                                                                setViewRatingModal({
                                                                    workerName: worker?.fullName || 'Worker',
                                                                    rating: existingRating.rating,
                                                                    review: existingRating.review || ''
                                                                });
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 bg-white/5 text-white/40 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
                                                    >
                                                        View Rating
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Rejected Overlay */}
                                {app.status === 'REJECTED' && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl pointer-events-none">
                                        <div className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-xs font-black uppercase tracking-widest border border-red-500/30 transform -rotate-12 shadow-lg">
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

            {showProModal && (
                <ProUpgradeModal onClose={() => setShowProModal(false)} />
            )}

            {viewRatingModal && (
                <ViewRatingModal
                    ratedUserName={viewRatingModal.workerName}
                    rating={viewRatingModal.rating}
                    review={viewRatingModal.review}
                    onClose={() => setViewRatingModal(null)}
                />
            )}
        </div>
    );
}
