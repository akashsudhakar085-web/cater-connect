'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Briefcase, Search, Phone, MessageCircle, Star, MapPin } from 'lucide-react';
import { CreateJobModal } from './CreateJobModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getOwnerJobs } from '@/actions/job';
import { getAvailableWorkers } from '@/actions/user';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import Image from 'next/image';
import { ProUpgradeModal } from './ProUpgradeModal';
import { StarRating } from '@/components/common/StarRating';

export function OwnerDashboard({ user }: { user: any }) {
    const [showModal, setShowModal] = useState(false);
    const [filterCity, setFilterCity] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterRate, setFilterRate] = useState(''); // Max daily rate
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const supabase = createClient();
    const queryClient = useQueryClient();

    const { data: jobs } = useQuery({
        queryKey: ['owner-jobs'],
        queryFn: async () => await getOwnerJobs(),
    });

    const { data: workers, isLoading: workersLoading } = useQuery({
        queryKey: ['available-workers'],
        queryFn: async () => await getAvailableWorkers(),
    });

    useEffect(() => {
        const channel = supabase
            .channel('dashboard:updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
                queryClient.invalidateQueries({ queryKey: ['owner-jobs'] });
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
                queryClient.invalidateQueries({ queryKey: ['available-workers'] });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [queryClient, supabase]);

    const filteredWorkers = workers?.filter((worker: any) => {
        if (filterCity && !worker.base_location?.toLowerCase().includes(filterCity.toLowerCase())) return false;
        if (filterRole && !worker.service_role?.toLowerCase().includes(filterRole.toLowerCase())) return false;
        if (filterRate && worker.daily_rate > parseFloat(filterRate)) return false;
        return true;
    });

    const handleContactClick = (e: React.MouseEvent) => {
        if (user.tier === 'FREE') {
            e.preventDefault();
            setShowUpgradeModal(true);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Headquarters</p>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">COMMAND</h1>
                    <div className="flex items-center gap-2">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-yellow-500">5.00</span>
                        <span className="text-[10px] text-white/40 uppercase font-bold">1 Reviews</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={32} />
                </button>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="glass p-5 rounded-[2rem] items-start flex flex-col gap-1 border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                    <Briefcase className="text-primary/60 mb-2" size={20} />
                    <span className="text-3xl font-black italic tracking-tighter">{jobs?.length || 0}</span>
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Active Ops</span>
                </div>
                <div className="glass p-5 rounded-[2rem] items-start flex flex-col gap-1 border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all" />
                    <Users className="text-secondary/60 mb-2" size={20} />
                    <span className="text-3xl font-black italic tracking-tighter">{workers?.length || 0}</span>
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Available Crew</span>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/20">Recruitment Feed</h2>

                {/* Filters */}
                <div className="glass p-4 rounded-3xl space-y-3 border-white/5">
                    <div className="flex items-center gap-2 mb-2 text-white/40">
                        <Users size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Filter Crew</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                            <input
                                type="text"
                                placeholder="Filter by City..."
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
                                className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-9 pr-4 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Role (e.g. Chef)..."
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                    </div>
                    <input
                        type="number"
                        placeholder="Max Daily Rate (₹)..."
                        value={filterRate}
                        onChange={(e) => setFilterRate(e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                </div>

                {/* Worker List */}
                <div className="space-y-4">
                    {workersLoading ? (
                        <div className="text-center text-white/20 py-10">Loading crew...</div>
                    ) : filteredWorkers?.length === 0 ? (
                        <div className="text-center text-white/20 py-10">No crew found matching filters.</div>
                    ) : (
                        filteredWorkers?.map((worker: any) => (
                            <div key={worker.id} className="glass p-5 rounded-[2rem] border-white/5 relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
                                            {worker.avatar_url ? (
                                                <Image
                                                    src={worker.avatar_url}
                                                    alt={worker.full_name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            ) : (
                                                <Users size={20} className="text-white/40" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black italic uppercase tracking-tighter leading-none mb-1">
                                                {worker.full_name || 'Unknown'}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                    {worker.service_role || 'General Staff'}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                                                    <StarRating rating={Number(worker.average_rating || 0)} size={10} />
                                                    <span className="ml-0.5 text-white/60">({worker.rating_count || 0})</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/30">
                                                <MapPin size={10} />
                                                {worker.base_location || 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {worker.daily_rate ? (
                                            <>
                                                <div className="text-xl font-black italic tracking-tighter text-green-400">₹{worker.daily_rate}</div>
                                                <div className="text-[8px] text-white/20 font-bold uppercase tracking-widest">PER DAY</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-xl font-black italic tracking-tighter text-white/20">₹N/A</div>
                                                <div className="text-[8px] text-white/20 font-bold uppercase tracking-widest">PER DAY</div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                    <Link href={`/dashboard/chat?user=${worker.id}`} className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                                        <MessageCircle size={14} /> Message / Hire
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            if (user.tier === 'FREE') {
                                                handleContactClick(e);
                                            } else {
                                                window.location.href = `tel:${worker.phone}`;
                                            }
                                        }}
                                        className="flex-1 py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-colors"
                                    >
                                        <Phone size={14} /> Call
                                    </button>
                                    <a
                                        href={worker.whatsapp_contact ? `https://wa.me/${worker.whatsapp_contact.replace(/\D/g, '')}` : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={handleContactClick}
                                        className={`flex-1 py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] transition-colors ${!worker.whatsapp_contact ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-500'}`}
                                    >
                                        <MessageCircle size={14} /> WhatsApp
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && <CreateJobModal user={user} onClose={() => setShowModal(false)} />}
            {showUpgradeModal && <ProUpgradeModal onClose={() => setShowUpgradeModal(false)} />}
        </div>
    );
}
