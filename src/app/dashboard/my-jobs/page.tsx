import { getOwnerJobs } from '@/actions/job';
import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BottomNav } from '@/components/layout/BottomNav';
import { Briefcase, Clock, MapPin, Users } from 'lucide-react';

export default async function MyJobsPage() {
    const result = await getCurrentUser();
    if (!result || !result.dbUser) {
        redirect('/auth/login');
    }

    const user = result.dbUser;
    if (user.role !== 'OWNER') {
        redirect('/dashboard');
    }

    const ownerJobs = await getOwnerJobs();

    return (
        <div className="p-4 pb-24 safe-top">
            <header className="mb-8">
                <h1 className="text-2xl font-bold">My Postings</h1>
                <p className="text-white/40 text-sm">Manage your active catering gigs</p>
            </header>

            <div className="space-y-4">
                {ownerJobs.length === 0 ? (
                    <div className="glass p-12 text-center space-y-4 rounded-3xl">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                            <Briefcase size={32} />
                        </div>
                        <p className="text-white/40">You haven't posted any jobs yet.</p>
                    </div>
                ) : (
                    ownerJobs.map((job) => (
                        <div key={job.id} className="glass p-6 rounded-3xl space-y-4 border-white/5 hover:border-white/10 transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{job.title}</h3>
                                    <span className="text-xs uppercase tracking-widest text-primary font-bold">{job.category}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold">${job.pay}</div>
                                    <div className="text-[10px] text-white/40">PER HOUR</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-xs text-white/60">
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin size={14} className="text-secondary" />
                                    <span>{job.location}</span>
                                </div>
                                {job.isEmergency && (
                                    <div className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                                        EMERGENCY
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5 flex gap-2">
                                <Link
                                    href={`/dashboard#job-${job.id}`}
                                    className="flex-1 py-3.5 rounded-2xl bg-white/5 text-xs font-black italic uppercase tracking-widest text-center hover:bg-white/10 transition-all border border-white/5"
                                >
                                    Edit Posting
                                </Link>
                                <Link
                                    href={`/dashboard#job-${job.id}`}
                                    className="flex-1 py-3.5 rounded-2xl bg-primary text-white text-xs font-black italic uppercase tracking-widest text-center hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                >
                                    View Applicants
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <BottomNav role="OWNER" />
        </div>
    );
}
