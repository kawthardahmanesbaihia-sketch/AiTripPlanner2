'use client';

import Image from 'next/image';
import { PexelsPhoto } from '@/lib/pexels-service';
import { StarRating } from './star-rating';

interface ImageGalleryCardProps {
  photo: PexelsPhoto;
  rating: number;
  onRatingChange: (rating: number) => void;
}

export function ImageGalleryCard({
  photo,
  rating,
  onRatingChange,
}: ImageGalleryCardProps) {
  return (
    <div className="flex flex-col gap-2 overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full overflow-hidden bg-gray-200">
        <Image
          src={photo.src.medium}
          alt={photo.alt || 'Travel destination'}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-col gap-2 p-3">
        <StarRating rating={rating} onRatingChange={onRatingChange} />
        <p className="text-xs text-gray-500">Photo by {photo.photographer}</p>
      </div>
    </div>
  );
}
