'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav = ({ role }: { role: 'OWNER' | 'WORKER' }) => {
    const pathname = usePathname();

    const navItems = [
        { label: 'Feed', icon: Home, href: '/dashboard' },
        { label: 'Gigs', icon: Briefcase, href: role === 'OWNER' ? '/dashboard/my-jobs' : '/dashboard/my-applications' },
        { label: 'Alerts', icon: Bell, href: '/dashboard/notifications' },
        { label: 'Profile', icon: User, href: '/dashboard/profile' },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all",
                        pathname === item.href ? "text-primary" : "text-white/40 hover:text-white/60"
                    )}
                >
                    <item.icon size={20} />
                    <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                    {pathname === item.href && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                    )}
                </Link>
            ))}
        </nav>
    );
};
