'use client';

import { X, Star } from 'lucide-react';
import { StarRating } from '@/components/common/StarRating';

interface ViewRatingModalProps {
    ratedUserName: string;
    rating: number;
    review: string;
    onClose: () => void;
}

export function ViewRatingModal({ ratedUserName, rating, review, onClose }: ViewRatingModalProps) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm glass rounded-2xl p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto text-yellow-400">
                        <Star size={32} fill="currentColor" />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold">Your Rating for {ratedUserName}</h3>
                        <p className="text-sm text-white/40">You rated this worker</p>
                    </div>

                    <div className="flex justify-center py-4">
                        <StarRating rating={rating} size={32} />
                    </div>

                    {review && (
                        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-left">
                            <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Your Review</p>
                            <p className="text-white/90">{review}</p>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="btn-primary w-full py-3"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
