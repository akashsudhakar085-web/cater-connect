'use client';

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { createJob } from '@/actions/job';
import { ProUpgradeModal } from './ProUpgradeModal';
import { showToast } from '@/lib/toast';

export function CreateJobModal({ user, onClose }: { user: any, onClose: () => void }) {
    const [title, setTitle] = useState('');
    const [pay, setPay] = useState('');
    const [category, setCategory] = useState('Catering');
    const [location, setLocation] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showCities, setShowCities] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const categories = [
        'Catering', 'DJ', 'House Management', 'House Shifting',
        'Plumbing', 'Electrician', 'Decoration', 'Kitchen', 'Cleaning'
    ];

    const cities = [
        'Palani', 'Pazhamudircholai', 'Chennai', 'Coimbatore', 'Madurai',
        'Trichy', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi',
        'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Virudhunagar',
        'Pollachi', 'Karur', 'Ooty', 'Kodaikanal'
    ];

    const filteredCities = cities.filter(c =>
        c.toLowerCase().includes(location.toLowerCase())
    ).slice(0, 5);

    const handleEmergencyToggle = (checked: boolean) => {
        if (checked && user.tier === 'FREE') {
            setShowUpgradeModal(true);
            return;
        }
        setIsEmergency(checked);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!title || !location || !pay) {
            showToast({ message: 'Please fill in all fields: Title, Location, and Pay.', type: 'warning' });
            return;
        }

        const payAmount = parseFloat(pay);
        if (payAmount < 300) {
            showToast({ message: 'Daily pay must be at least ₹300.', type: 'warning' });
            return;
        }

        setLoading(true);
        try {
            await createJob({
                title,
                pay: parseFloat(pay),
                category,
                location,
                isEmergency,
            });
            onClose();
        } catch (error) {
            console.error(error);
            showToast({ message: 'Failed to create job. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="glass p-8 rounded-[2.5rem] w-full max-w-md relative space-y-6 shadow-2xl border-white/10 overflow-visible">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Post Mission</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Gig Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-field w-full py-4 px-5"
                            placeholder="e.g. Lead Server for Event"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Daily Pay (₹)</label>
                            <input
                                type="number"
                                required
                                min="300"
                                value={pay}
                                onChange={(e) => setPay(e.target.value)}
                                className="input-field w-full py-4 px-5"
                                placeholder="300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Service Type</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="input-field w-full py-4 px-4 bg-[#0f172a] font-bold"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Location (City)</label>
                        <input
                            type="text"
                            required
                            value={location}
                            onFocus={() => setShowCities(true)}
                            onChange={(e) => {
                                location.length === 0 && setShowCities(true);
                                setLocation(e.target.value);
                            }}
                            className="input-field w-full py-4 px-5"
                            placeholder="e.g. Palani"
                        />
                        {showCities && location.length > 0 && filteredCities.length > 0 && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-2 glass-dark rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                {filteredCities.map(city => (
                                    <button
                                        key={city}
                                        type="button"
                                        onClick={() => {
                                            setLocation(city);
                                            setShowCities(false);
                                        }}
                                        className="w-full text-left px-5 py-3 hover:bg-primary/20 text-sm font-bold transition-all border-b border-white/5 last:border-none"
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${isEmergency ? 'border-red-500 bg-red-500/10' : 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10'}`}>
                        <input
                            type="checkbox"
                            checked={isEmergency}
                            onChange={(e) => handleEmergencyToggle(e.target.checked)}
                            className="w-5 h-5 accent-red-500"
                        />
                        <div className="flex items-center gap-2 text-red-400">
                            <AlertCircle size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Mark as Emergency</span>
                        </div>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-5 text-sm font-black italic uppercase tracking-[0.2em] shadow-2xl shadow-primary/20"
                    >
                        {loading ? 'INITIALIZING...' : 'Deploy Gig'}
                    </button>
                </form>

                {showUpgradeModal && <ProUpgradeModal onClose={() => setShowUpgradeModal(false)} />}
            </div>
        </div>
    );
}
