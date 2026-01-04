'use client';

import { useState } from 'react';
import { User, Phone, Briefcase, Save } from 'lucide-react';

export default function ProfilePage() {
    const [phone, setPhone] = useState('');
    const [skills, setSkills] = useState('');

    return (
        <div className="p-4 space-y-8">
            <header>
                <h1 className="text-2xl font-bold">Edit Profile</h1>
                <p className="text-white/40 text-sm">Keep your professional details up to date</p>
            </header>

            <div className="glass p-6 rounded-2xl space-y-6">
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1">
                        <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden">
                            <User size={48} className="text-white/20" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">
                            <Phone size={14} /> WhatsApp / Phone
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="input-field w-full"
                            placeholder="+1 234 567 890"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">
                            <Briefcase size={14} /> Skills & Experience
                        </label>
                        <textarea
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="input-field w-full h-32 resize-none"
                            placeholder="Tell us about your catering experience..."
                        />
                    </div>
                </div>

                <button className="btn-primary w-full py-4 flex items-center justify-center gap-2 font-bold shadow-xl shadow-primary/20">
                    <Save size={20} /> Save Changes
                </button>
            </div>

            <div className="glass p-6 rounded-2xl border-red-500/20">
                <button
                    onClick={async () => {
                        const { createClient } = await import('@/lib/supabase-client');
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        window.location.href = '/auth/login';
                    }}
                    className="text-red-400 font-bold w-full text-center"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
