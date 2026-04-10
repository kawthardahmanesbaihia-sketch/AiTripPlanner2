'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  interactive?: boolean;
}

export function StarRating({ rating, onRatingChange, interactive = true }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRatingChange(star)}
          disabled={!interactive}
          className={`transition-all ${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
          aria-label={`Rate ${star} stars`}
        >
          <Star
            size={20}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
