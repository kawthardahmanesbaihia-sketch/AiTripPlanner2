type PexelsPhoto = {
  id: number;
  src: {
    large: string;
    medium: string;
  };
  photographer: string;
};

type PexelsResponse = {
  photos: PexelsPhoto[];
};

export async function fetchPexelsImages(query: string) {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10`,
    {
      headers: {
        Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY as string,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch images from Pexels");
  }

  const data: PexelsResponse = await res.json();

  return data.photos.map((photo) => ({
    id: photo.id,
    image: photo.src.large,
    photographer: photo.photographer,
  }));
}