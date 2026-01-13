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
                // Reload applications
                const apps = await getApplicationsForJob(jobId);
                setApplications(apps);
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
                <div className="flex flex-col gap-3">
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
                            <div key={app.id} className="group relative flex items-center justify-between p-4 bg-[#18181B] border border-white/5 rounded-2xl hover:bg-[#202025] transition-all">
                                {/* Left: Worker Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                                        {worker?.avatarUrl ? (
                                            <img src={worker.avatarUrl} alt={worker.fullName} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-white/60" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-base">{worker?.fullName || 'Anonymous'}</span>
                                            <div className="flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px] text-yellow-500 font-bold border border-yellow-500/20">
                                                <span>★</span>
                                                <span>{Number(worker?.averageRating || 0).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="mt-1">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${app.status === 'COMPLETED' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    app.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        app.status === 'STARTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                            app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-3">
                                    {/* Action Buttons */}
                                    {app.status === 'PENDING' ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={async () => {
                                                    setApplications(prev => prev.map(p => p.application.id === app.id ? { ...p, application: { ...p.application, status: 'REJECTED' } } : p));
                                                    await handleStatus(app.id, 'REJECTED');
                                                }}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                title="Reject"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    setApplications(prev => prev.map(p => p.application.id === app.id ? { ...p, application: { ...p.application, status: 'ACCEPTED' } } : p));
                                                    await handleStatus(app.id, 'ACCEPTED');
                                                }}
                                                className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Communication Buttons (Pro Only Gate Logic is in Parent) */}
                                            {isPro && app.status !== 'REJECTED' && (
                                                <div className="flex items-center gap-2 mr-2">
                                                    <button
                                                        onClick={() => window.location.href = `tel:${worker?.phone}`}
                                                        className="w-8 h-8 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all border border-white/5"
                                                        title="Call"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                                    </button>
                                                    <button
                                                        onClick={openWhatsApp}
                                                        className="w-8 h-8 rounded-full bg-white/5 text-white/60 hover:text-green-400 hover:bg-green-500/10 flex items-center justify-center transition-all border border-white/5"
                                                        title="WhatsApp"
                                                    >
                                                        <MessageCircle size={14} />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Primary Status Action */}
                                            {app.status === 'ACCEPTED' && (
                                                <button
                                                    onClick={async () => {
                                                        setApplications(prev => prev.map(p => p.application.id === app.id ? { ...p, application: { ...p.application, status: 'STARTED' } } : p));
                                                        await handleStatus(app.id, 'STARTED');
                                                    }}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all"
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
                                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-purple-500 shadow-lg shadow-purple-600/20 transition-all"
                                                >
                                                    Mark Done
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
                                                        className="px-6 py-2 bg-yellow-500 text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all"
                                                    >
                                                        Rate
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
                                                        className="px-6 py-2 bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/20 border border-white/5 transition-all"
                                                    >
                                                        Rated ✓
                                                    </button>
                                                )
                                            )}
                                        </>
                                    )}
                                </div>
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
