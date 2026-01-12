'use client';

import { X, Briefcase, UserCheck, Star, DollarSign, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HowItWorksModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: <Briefcase className="text-secondary" size={32} />,
            title: "Post a Gig",
            desc: "Owners post catering jobs with details like role, pay, and location."
        },
        {
            icon: <UserCheck className="text-primary" size={32} />,
            title: "Hire Talent",
            desc: "Workers apply. Owners review profiles and accept the best fit."
        },
        {
            icon: <Star className="text-yellow-500" size={32} />,
            title: "Get Rated",
            desc: "After the job, build trust by rating each other 5 stars."
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className="relative glass-dark border border-white/10 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">How It Works</h2>
                        <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6 relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-white/10" />

                        {steps.map((s, i) => (
                            <div key={i} className="relative flex gap-4 items-start group">
                                <div className={`relative z-10 w-8 h-8 rounded-full border-2 border-[#0f172a] flex items-center justify-center shrink-0 ${i <= step ? 'bg-white text-black' : 'bg-white/10 text-white/40'}`}>
                                    <span className="text-xs font-bold">{i + 1}</span>
                                </div>
                                <div className="space-y-1 pt-1">
                                    <div className="flex items-center gap-2">
                                        {s.icon}
                                        <h3 className="font-bold text-lg leading-none">{s.title}</h3>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed font-medium">
                                        {s.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-black uppercase tracking-widest text-xs shadow-lg hover:opacity-90 transition-opacity"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
}
