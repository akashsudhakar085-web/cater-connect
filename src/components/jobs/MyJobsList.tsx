'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Clock, MapPin, X, Trash2 } from 'lucide-react';
import { ApplicationManager } from '@/components/dashboard/ApplicationManager';
import { deleteJob } from '@/actions/job';
import { showToast } from '@/lib/toast';

interface Job {
    id: string;
    title: string;
    category: string;
    pay: number | string;
    location: string;
    description: string | null;
    createdAt: Date;
    status: string;
    isEmergency: boolean;
}

export function MyJobsList({ jobs, isPro }: { jobs: Job[], isPro: boolean }) {
    const [selectedJob, setSelectedJob] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteJob(id);
            if (result.success) {
                showToast({ message: result.message || 'Job deleted', type: 'success' });
                if (selectedJob === id) setSelectedJob(null);
            } else {
                showToast({ message: result.message || 'Failed to delete job', type: 'error' });
            }
        } catch (error) {
            showToast({ message: 'An error occurred', type: 'error' });
        }
    };

    if (jobs.length === 0) {
        return (
            <div className="glass p-12 text-center space-y-4 rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                    <Briefcase size={32} />
                </div>
                <p className="text-white/40">You haven't posted any jobs yet.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {jobs.map((job) => (
                    <div key={job.id} className="glass p-6 rounded-3xl space-y-4 border-white/5 hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{job.title}</h3>
                                <span className="text-xs uppercase tracking-widest text-primary font-bold">{job.category}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold">₹{job.pay}</div>
                                <div className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    {job.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(job.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${job.status === 'OPEN' ? 'bg-green-500/20 text-green-400' :
                                    job.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-white/10 text-white/40'
                                    }`}>
                                    {job.status}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete this job post?')) {
                                            handleDelete(job.id);
                                        }
                                    }}
                                    className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                    title="Delete Job"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {job.isEmergency && (
                            <div className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                                EMERGENCY
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/5 flex gap-2">
                            <button
                                onClick={() => setSelectedJob(job.id)}
                                className="flex-1 py-3.5 rounded-2xl bg-primary text-white text-xs font-black italic uppercase tracking-widest text-center hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                            >
                                View Applicants
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* View Applicants Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedJob(null)} />
                    <div className="relative glass-dark border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="relative z-10 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Applicants</h2>
                                <button onClick={() => setSelectedJob(null)} className="p-2 text-white/40 hover:bg-white/5 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                <ApplicationManager jobId={selectedJob} isPro={isPro} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
