'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { EditableStarRating } from '@/components/common/StarRating';
import { submitRating } from '@/actions/rating';
import { showToast } from '@/lib/toast';

interface RatingModalProps {
    jobId: string;
    ratedUserId: string;
    ratedUserName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function RatingModal({ jobId, ratedUserId, ratedUserName, onClose, onSuccess }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            showToast({ message: 'Please select a star rating', type: 'error' });
            return;
        }
        setSubmitting(true);
        try {
            await submitRating(jobId, ratedUserId, rating, review);
            showToast({ message: 'Rating submitted!', type: 'success' });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            showToast({ message: error.message, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

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
                        <h3 className="text-xl font-bold">Rate {ratedUserName}</h3>
                        <p className="text-sm text-white/40">How was your experience working together?</p>
                    </div>

                    <div className="flex justify-center py-4">
                        <EditableStarRating rating={rating} setRating={setRating} size={32} />
                    </div>

                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Write a brief review (optional)..."
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-white/20 resize-none"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary w-full py-3"
                    >
                        {submitting ? 'Submitting...' : 'Submit Rating'}
                    </button>
                </div>
            </div>
        </div>
    );
}
