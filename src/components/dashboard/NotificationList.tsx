'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { getNotifications, markAsRead } from '@/actions/notification';
import { Bell, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function NotificationList({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const supabase = createClient();

    const fetchNotifications = async () => {
        const data = await getNotifications();
        setNotifications(data);
    };

    useEffect(() => {
        fetchNotifications();

        const channel = supabase
            .channel(`notifications:${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload: any) => {
                setNotifications(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    if (notifications.length === 0) {
        return (
            <div className="glass p-12 text-center space-y-4 rounded-3xl border-white/5">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                    <Bell size={32} />
                </div>
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">All clear on the radar</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className={`glass p-5 rounded-3xl border transition-all ${notif.isRead ? 'border-white/5' : 'border-primary/20 bg-primary/5'
                        }`}
                >
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-bold leading-tight">{notif.message}</p>
                            <div className="flex items-center gap-1 text-[10px] text-white/30 uppercase font-black tracking-tighter">
                                <Clock size={10} />
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        {!notif.isRead && (
                            <button
                                onClick={() => markAsRead(notif.id)}
                                className="text-[10px] font-black text-primary uppercase hover:underline"
                            >
                                Mark Read
                            </button>
                        )}
                    </div>
                    {notif.link && (
                        <Link
                            href={notif.link}
                            className="mt-4 flex items-center justify-between p-3 bg-white/5 rounded-2xl group hover:bg-white/10 transition-all"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Check Intel</span>
                            <ArrowRight size={14} className="text-primary group-hover:translate-x-1 transition-all" />
                        </Link>
                    )}
                </div>
            ))}
        </div>
    );
}
