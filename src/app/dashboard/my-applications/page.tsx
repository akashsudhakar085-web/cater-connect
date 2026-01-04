import { getWorkerApplications } from '@/actions/application';
import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BottomNav } from '@/components/layout/BottomNav';
import { Briefcase, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function MyApplicationsPage() {
    const result = await getCurrentUser();
    if (!result || !result.dbUser) {
        redirect('/auth/login');
    }

    const user = result.dbUser;
    if (user.role !== 'WORKER') {
        redirect('/dashboard');
    }

    const applications = await getWorkerApplications();

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return "bg-green-500/20 text-green-400 border-green-500/20";
            case 'REJECTED': return "bg-red-500/20 text-red-400 border-red-500/20";
            default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return <CheckCircle2 size={14} />;
            case 'REJECTED': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="p-4 pb-24 safe-top">
            <header className="mb-8">
                <h1 className="text-2xl font-bold">My Applications</h1>
                <p className="text-white/40 text-sm">Track your gig status</p>
            </header>

            <div className="space-y-4">
                {applications.length === 0 ? (
                    <div className="glass p-12 text-center space-y-4 rounded-3xl">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                            <Briefcase size={32} />
                        </div>
                        <p className="text-white/40">You haven't applied to any jobs yet.</p>
                    </div>
                ) : (
                    applications.map(({ application, job }) => (
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
                                    <div className="text-xl font-bold">${job.pay}</div>
                                    <div className="text-[10px] text-white/40">PER HOUR</div>
                                </div>
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
                    ))
                )}
            </div>

            <BottomNav role="WORKER" />
        </div>
    );
}
