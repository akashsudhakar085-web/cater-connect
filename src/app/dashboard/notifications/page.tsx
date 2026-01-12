import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { NotificationList } from '@/components/dashboard/NotificationList';

export default async function NotificationsPage() {
    const result = await getCurrentUser();
    if (!result || !result.dbUser) {
        redirect('/auth/login');
    }

    const user = result.dbUser;

    return (
        <div className="p-4 pb-24 safe-top">
            <header className="mb-8 pl-1">
                <div className="text-[10px] font-black tracking-[0.2em] text-primary uppercase mb-1">Signal Stream</div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none whitespace-nowrap">ALERTS & INTEL</h1>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed mt-1">System-wide catering logistics monitor</p>
            </header>

            <NotificationList userId={user.id} />

            <BottomNav role={user.role} />
        </div>
    );
}
