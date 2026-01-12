import { getWorkerApplications } from '@/actions/application';
import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BottomNav } from '@/components/layout/BottomNav';
import { Briefcase, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { MyApplicationsList } from '@/components/dashboard/MyApplicationsList';
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
                <MyApplicationsList initialApplications={applications} user={user} />
            </div>

            <BottomNav role="WORKER" />
        </div>
    );
}
