'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Briefcase, Save, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import AvatarUpload from '@/components/profile/AvatarUpload';
import { useRouter } from 'next/navigation';
import { ReferralTracker } from '@/components/profile/ReferralTracker';
import { showToast } from '@/lib/toast';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [phone, setPhone] = useState('');
    const [serviceRole, setServiceRole] = useState('');
    const [baseLocation, setBaseLocation] = useState('');
    const [dailyRate, setDailyRate] = useState('');
    const [whatsappContact, setWhatsappContact] = useState('');

    // Referral Data State
    const [referralCode, setReferralCode] = useState('');
    const [referralCount, setReferralCount] = useState(0);
    const [proExpiresAt, setProExpiresAt] = useState<string | null>(null);

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [showCities, setShowCities] = useState(false);

    const cities = [
        'Palani', 'Pazhamudircholai', 'Chennai', 'Coimbatore', 'Madurai',
        'Trichy', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi',
        'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Virudhunagar',
        'Pollachi', 'Karur', 'Ooty', 'Kodaikanal'
    ];

    const filteredCities = cities.filter(c =>
        c.toLowerCase().includes(baseLocation.toLowerCase())
    ).slice(0, 5);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/auth/login');
                    return;
                }
                setUser(user);

                const { data: profile, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setPhone(profile.phone || '');
                    setServiceRole(profile.service_role || '');
                    setBaseLocation(profile.base_location || '');
                    setDailyRate(profile.daily_rate || '');
                    setWhatsappContact(profile.whatsapp_contact || '');
                    setAvatarUrl(profile.avatar_url);

                    // Populate Referral Data
                    setReferralCode(profile.referral_code || '');
                    setReferralCount(profile.referral_count || 0);
                    setProExpiresAt(profile.pro_expires_at || null);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, [router, supabase]);

    const handleAvatarUpdate = async (url: string) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('users')
                .update({ avatar_url: url })
                .eq('id', user.id);

            if (error) throw error;
            setAvatarUrl(url);
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        // Validation
        if (!serviceRole || !baseLocation || !dailyRate || !whatsappContact) {
            showToast({ message: 'Please fill in all mandatory fields: Role, Location, Rate, and Contact.', type: 'warning' });
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    phone: phone, // Keeping phone as fallback
                    service_role: serviceRole,
                    base_location: baseLocation,
                    daily_rate: dailyRate ? parseFloat(dailyRate) : null,
                    whatsapp_contact: whatsappContact
                })
                .eq('id', user.id);

            if (error) throw error;
            showToast({ message: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast({ message: 'Failed to update profile. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="p-4 space-y-8">
            <header>
                <h1 className="text-2xl font-bold">My Service Listing</h1>
                <p className="text-white/40 text-sm">Register your availability and rates for Owners to see.</p>
            </header>

            <div className="glass p-6 rounded-2xl space-y-6">
                <div className="flex justify-center">
                    <AvatarUpload
                        uid={user?.id}
                        url={avatarUrl}
                        onUploadComplete={handleAvatarUpdate}
                    />
                </div>

                {/* Live Referral Tracker */}
                <ReferralTracker
                    referralCode={referralCode}
                    referralCount={referralCount}
                    proExpiresAt={proExpiresAt}
                />

                <div className="space-y-4">
                    {/* Service Role */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">
                            <Briefcase size={14} /> Service Role <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={serviceRole}
                            onChange={(e) => setServiceRole(e.target.value)}
                            className="input-field w-full"
                            placeholder="e.g. Master Chef, Bartender"
                        />
                    </div>

                    {/* Base Location */}
                    <div className="space-y-2 relative">
                        <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">
                            Base Location <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={baseLocation}
                            onChange={(e) => setBaseLocation(e.target.value)}
                            onFocus={() => setShowCities(true)}
                            className="input-field w-full"
                            placeholder="Select or type your city..."
                        />
                        {showCities && baseLocation.length > 0 && filteredCities.length > 0 && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-2 glass-dark rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-h-48 overflow-y-auto">
                                {filteredCities.map(city => (
                                    <button
                                        key={city}
                                        type="button"
                                        onClick={() => {
                                            setBaseLocation(city);
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

                    {/* Daily Rate */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">
                            Daily Rate (Per Day) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">₹</span>
                            <input
                                type="number"
                                value={dailyRate}
                                onChange={(e) => setDailyRate(e.target.value)}
                                className="input-field w-full pl-8 text-green-400 font-bold"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* WhatsApp Contact */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">
                            <Phone size={14} /> WhatsApp Contact <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={whatsappContact}
                            onChange={(e) => setWhatsappContact(e.target.value)}
                            className="input-field w-full"
                            placeholder="+1 234 567 890"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 font-bold shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {saving ? 'Updating Listings...' : 'Update Listings'}
                </button>

                <button
                    onClick={() => router.push('/dashboard/subscription')}
                    className="w-full py-4 flex items-center justify-center gap-2 font-bold border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                >
                    Manage Subscription
                </button>
            </div>

            <div className="glass p-6 rounded-2xl border-red-500/20">
                <button
                    onClick={async () => {
                        try {
                            setLoading(true);
                            await supabase.auth.signOut();
                            window.location.href = '/auth/login'; // Hard redirect to ensure clear state
                        } catch (e) {
                            console.error('Sign out error:', e);
                            window.location.href = '/auth/login';
                        }
                    }}
                    className="text-red-400 font-bold w-full text-center"
                >
                    {loading ? 'Signing Out...' : 'Sign Out'}
                </button>
            </div>
        </div>
    );
}
