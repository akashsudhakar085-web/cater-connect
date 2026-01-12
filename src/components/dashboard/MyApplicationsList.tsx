'use client';

import Link from 'next/link';
import { Briefcase, CheckCircle2, Clock, XCircle, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { requestTimeExtension, markJobDoneRequest } from '@/actions/application';
import { showToast } from '@/lib/toast';
import { useState } from 'react';
import { RatingModal } from '@/components/jobs/RatingModal';

interface ApplicationItem {
    application: {
        id: string;
        status: string;
        createdAt: Date;
        jobId: string;
    };
    job: {
        id: string;
        title: string;
        category: string;
        pay: string;
        ownerId: string;
    };
    // Include owner details for rating if needed, but for now we assume we rate ownerId
}

export function MyApplicationsList({ initialApplications, user }: { initialApplications: any[], user: any }) {
    const [ratingModal, setRatingModal] = useState<{ show: boolean, jobId: string, ownerId: string } | null>(null);

    const handleExtension = async (appId: string) => {
        try {
            await requestTimeExtension(appId);
            showToast({ message: 'Extension requested sent to Owner', type: 'success' });
        } catch (error) {
            showToast({ message: 'Failed to request extension', type: 'error' });
        }
    };

    const handleMarkDone = async (appId: string) => {
        try {
            await markJobDoneRequest(appId);
            showToast({ message: 'Notified Owner that job is done', type: 'success' });
        } catch (error) {
            showToast({ message: 'Failed to mark done', type: 'error' });
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return "bg-green-500/20 text-green-400 border-green-500/20";
            case 'STARTED': return "bg-blue-500/20 text-blue-400 border-blue-500/20";
            case 'COMPLETED': return "bg-purple-500/20 text-purple-400 border-purple-500/20";
            case 'REJECTED': return "bg-red-500/20 text-red-400 border-red-500/20";
            default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return <CheckCircle2 size={14} />;
            case 'STARTED': return <Clock size={14} />; // Maybe play icon?
            case 'COMPLETED': return <CheckCircle2 size={14} />;
            case 'REJECTED': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    if (initialApplications.length === 0) {
        return (
            <div className="glass p-12 text-center space-y-4 rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                    <Briefcase size={32} />
                </div>
                <p className="text-white/40">You haven't applied to any jobs yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {initialApplications.map(({ application, job }) => (
                <div key={application.id} className="glass p-6 rounded-3xl space-y-4 border-white/5 hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">{job.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{job.category}</span>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1",
                                    getStatusStyles(application.status)
                                )}>
                                    {getStatusIcon(application.status)}
                                    {application.status}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold">₹{job.pay}</div>
                            <div className="text-[10px] text-white/40">PER DAY</div>
                        </div>
                    </div>

                    {/* Actions based on Status */}
                    <div className="flex gap-2 pt-2">
                        {['ACCEPTED', 'STARTED'].includes(application.status) && (
                            <button
                                onClick={() => handleExtension(application.id)}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
                            >
                                Request Extension
                            </button>
                        )}
                        {application.status === 'STARTED' && (
                            <button
                                onClick={() => handleMarkDone(application.id)}
                                className="px-4 py-2 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                            >
                                Mark Done
                            </button>
                        )}
                        {application.status === 'COMPLETED' && (
                            <button
                                onClick={() => setRatingModal({ show: true, jobId: job.id, ownerId: job.ownerId })}
                                className="px-4 py-2 rounded-xl bg-yellow-500 text-black text-xs font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
                            >
                                Rate Owner
                            </button>
                        )}
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest">
                            Applied {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                        <Link href="/dashboard" className="text-xs font-bold text-primary hover:underline">
                            Refresh Intel
                        </Link>
                    </div>
                </div>
            ))}

            {ratingModal && (
                <RatingModal
                    jobId={ratingModal.jobId}
                    ratedUserId={ratingModal.ownerId}
                    ratedUserName="Owner" // Ideally pass actual name
                    onClose={() => setRatingModal(null)}
                    onSuccess={() => setRatingModal(null)}
                />
            )}
        </div>
    );
}
