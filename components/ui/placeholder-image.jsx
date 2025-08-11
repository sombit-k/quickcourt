"use client";

import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

const PlaceholderImage = ({ 
  src, 
  alt, 
  className = "", 
  placeholderClassName = "",
  width = "100%",
  height = "100%"
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Check if src is a placeholder URL or empty
  const isPlaceholder = !src || 
    src.includes('placeholder') || 
    src.includes('via.placeholder') || 
    src === '/api/placeholder/400/300' ||
    imageError;

  if (isPlaceholder) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${placeholderClassName} ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {!imageLoaded && (
        <div 
          className={`absolute inset-0 bg-gray-200 flex items-center justify-center ${placeholderClassName}`}
        >
          <div className="text-center text-gray-400">
            <ImageIcon className="w-8 h-8 mx-auto mb-1 animate-pulse" />
            <p className="text-xs">Loading...</p>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

export default PlaceholderImage;
