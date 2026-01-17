import React, { useState } from 'react';

interface CardImageProps {
  cardName: string;
  type: 'thumbnail' | 'image';
  className?: string;
  alt?: string;
}

export const CardImage: React.FC<CardImageProps> = ({ cardName, type, className, alt }) => {
  const [hasError, setHasError] = useState(false);

  // In a real scenario, this points to local files as requested.
  // For this demo, if the file fails (because they don't exist in this environment), 
  // we fall back to a placeholder service.
  const path = type === 'thumbnail' ? `thumbnail/${cardName}.jpg` : `image/${cardName}.jpg`;

  const handleError = () => {
    setHasError(true);
  };

  // Generate a consistent placeholder based on name length/chars
  const seed = cardName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const placeholderUrl = `https://picsum.photos/seed/${seed}/${type === 'thumbnail' ? '200/280' : '600/840'}`;

  return (
    <img
      src={hasError ? placeholderUrl : path}
      alt={alt || cardName}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};