import Link from 'next/link';
import { ChefHat, MapPin, DollarSign, Clock, Search, LogIn, ArrowRight } from 'lucide-react';
import { getPublicJobs, getPublicWorkers } from '@/actions/public';
import { createClient } from '@/lib/supabase-server';

export default async function Home() {
  // Check if logged in (to show Dashboard button instead of Login)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const jobs = await getPublicJobs();
  const workers = await getPublicWorkers();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col pb-24">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between glass sticky top-0 z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="font-black italic tracking-tighter text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          CATER CONNECT
        </div>
        {user ? (
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/20 transition-all"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-white/5 text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <LogIn size={14} />
            Login
          </Link>
        )}
      </header>

      {/* Hero / Intro */}
      <div className="px-6 py-10 space-y-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
          Browse <span className="text-primary">Opportunities</span>
        </h1>
        <p className="text-white/40 text-sm max-w-xs">
          Explore active catering gigs and top-tier talent. Login to view full details and connecting contact info.
        </p>
      </div>

      {/* Public Feed */}
      <main className="px-4 space-y-10">
        {/* Jobs Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <BriefcaseIcon size={16} className="text-orange-400" />
            <h2 className="text-sm font-black uppercase tracking-widest text-orange-400">Latest Gigs</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="glass p-5 rounded-2xl border-white/5 relative overflow-hidden group hover:border-orange-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-orange-400 transition-colors">{job.title}</h3>
                      <p className="text-xs text-secondary font-bold uppercase tracking-widest mt-1">{job.category}</p>
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs font-black">
                      ₹{job.pay}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-white/40 font-medium">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-xs text-white/60 line-clamp-2">{job.description}</p>
                </div>

                {/* Overlay for Login Prompt */}
                <Link href="/auth/signup" className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                  <div className="px-4 py-2 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-full scale-90 group-hover:scale-100 transition-transform shadow-xl">
                    Login to Apply
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Workers Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <ChefHat size={16} className="text-pink-400" />
            <h2 className="text-sm font-black uppercase tracking-widest text-pink-400">Top Talent</h2>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {workers.map((worker) => (
              <div key={worker.id} className="glass p-4 rounded-2xl border-white/5 text-center space-y-3 hover:border-pink-500/30 transition-all group relative">
                <div className="w-16 h-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl overflow-hidden relative">
                  {worker.avatarUrl ? (
                    <img src={worker.avatarUrl} alt={worker.fullName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{worker.fullName?.[0] || '?'}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold truncate">{worker.fullName}</h3>
                  <p className="text-[10px] text-pink-400 font-bold uppercase tracking-wide">{worker.serviceRole || 'Worker'}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] font-medium text-white/40">
                  <span>{worker.baseLocation || 'India'}</span>
                  {worker.dailyRate && (
                    <span className="text-green-400">₹{worker.dailyRate}/day</span>
                  )}
                </div>

                <Link href="/auth/signup" className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                  <div className="px-4 py-2 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-full scale-90 group-hover:scale-100 transition-transform shadow-xl">
                    Login to Hire
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom CTA */}
      {!user && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent z-40">
          <Link
            href="/auth/signup"
            className="btn-primary w-full py-4 text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 group"
          >
            <span>Create Free Account</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      <HowItWorksTrigger />
    </div>
  );
}

import { HowItWorksTrigger } from '@/components/common/HowItWorksTrigger';

function BriefcaseIcon({ size, className }: { size?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}
