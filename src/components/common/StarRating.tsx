import { Star } from 'lucide-react';

export function StarRating({ rating, size = 16 }: { rating: number, size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={`${star <= Math.round(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-white/20'
                        }`}
                />
            ))}
        </div>
    );
}

export function EditableStarRating({ rating, setRating, size = 24 }: { rating: number, setRating: (r: number) => void, size?: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                >
                    <Star
                        size={size}
                        className={`${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-white/20 hover:text-white/40'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}
