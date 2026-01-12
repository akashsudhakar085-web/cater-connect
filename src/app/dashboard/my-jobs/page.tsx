import { getOwnerJobs } from '@/actions/job';
import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { MyJobsList } from '@/components/jobs/MyJobsList';

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

            <MyJobsList jobs={ownerJobs} />

            <BottomNav role="OWNER" />
        </div>
    );
}
