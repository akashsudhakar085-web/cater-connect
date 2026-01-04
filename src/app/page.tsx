'use client';

import Link from 'next/link';
import { ChefHat, Briefcase, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function Home() {
  const { user, loading } = useAuth();
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      {/* Hero Section */}
      <header className="p-8 pb-12 pt-20 text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/5">
          <Zap size={14} fill="currentColor" />
          The Future of Catering
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight flex flex-col gap-2">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Cater Connect</span>
          <span className="text-white/90">Gigs at your fingertips.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
          The ultimate platform connecting premium catering talent with top-tier owners. Real-time, reliable, and mobile-first.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href={user ? "/dashboard" : "/auth/signup"}
            className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all text-center"
          >
            {loading ? 'Loading...' : user ? 'Go to Dashboard' : 'Get Started Now'}
          </Link>
          <button className="px-8 py-4 glass text-white font-bold rounded-2xl hover:bg-white/10 active:scale-95 transition-all text-center">
            How it Works
          </button>
        </div>
      </header>

      {/* Feature Grid */}
      <main className="px-6 py-12 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {[
          { icon: Zap, title: "Real-time Sync", desc: "No more refreshes. See applications and status changes as they happen." },
          { icon: ShieldCheck, title: "Secure Auth", desc: "Role-based security ensuring your data stays yours." },
          { icon: ChefHat, title: "Premium Gigs", desc: "Access the best catering jobs or find top-tier talent instantly." }
        ].map((f, i) => (
          <div key={i} className="glass p-8 rounded-3xl space-y-4 hover:border-white/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-all">
              <f.icon size={24} />
            </div>
            <h3 className="text-xl font-bold">{f.title}</h3>
            <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </main>

      <footer className="mt-auto p-8 text-center text-white/20 text-xs uppercase tracking-widest border-t border-white/5">
        &copy; 2026 Cater Connect &bull; Built for Excellence
      </footer>
    </div>
  );
}
