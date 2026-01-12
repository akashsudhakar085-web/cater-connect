'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';
import { User, Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { showToast } from '@/lib/toast';

interface AvatarUploadProps {
    uid: string;
    url: string | null;
    onUploadComplete: (url: string) => void;
}

export default function AvatarUpload({ uid, url, onUploadComplete }: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${uid}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setAvatarUrl(data.publicUrl);
            onUploadComplete(data.publicUrl);

        } catch (error) {
            console.error('Error uploading avatar:', error);
            showToast({ message: 'Error uploading avatar!', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1">
                    <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden relative">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt="Avatar"
                                width={96}
                                height={96}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <User size={48} className="text-white/20" />
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white" />
                        </div>
                    </div>
                </div>

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                        <Loader2 size={24} className="text-primary animate-spin" />
                    </div>
                )}
            </div>

            <input
                type="file"
                id="single"
                accept="image/*"
                onChange={uploadAvatar}
                ref={fileInputRef}
                className="hidden"
                disabled={uploading}
            />

            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
                Tap to change
            </p>
        </div>
    );
}
