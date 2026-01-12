import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { WorkerDashboard } from '@/components/dashboard/WorkerDashboard';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import Link from 'next/link';

export default async function DashboardPage() {
    const result = await getCurrentUser();

    if (!result) {
        redirect('/auth/login');
    }

    const { dbUser } = result;

    // If no DB record or missing role/name/phone, go to onboarding
    if (!dbUser || !dbUser.role || !dbUser.fullName || !dbUser.phone) {
        redirect('/onboarding');
    }

    const user = dbUser;
    const role = user.role as 'OWNER' | 'WORKER';

    return (
        <div className="p-4 safe-top">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Hello, {user.fullName?.split(' ')[0] || 'User'} 👋</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-white/40 text-sm">Welcome back to Cater Connect</p>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${role === 'OWNER' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                            {role}
                        </span>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold">
                    <Link href="/dashboard/profile" className="w-full h-full flex items-center justify-center">
                        {user.fullName?.[0] || '?'}
                    </Link>
                </div>
            </header>

            {role === 'WORKER' ? <WorkerDashboard user={user} /> : <OwnerDashboard user={user} />}

            <BottomNav role={role} />
        </div>
    );
}
