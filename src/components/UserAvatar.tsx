import React, { useState } from 'react';

export function isPhotoAvatar(avatar?: string | null): boolean {
  if (!avatar) return false;
  const trimmed = avatar.trim();
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/')
  );
}

interface UserAvatarProps {
  avatar?: string | null;
  name?: string;
  className?: string;
  fallbackEmoji?: string;
  imageClassName?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name,
  className = 'w-10 h-10 rounded-2xl',
  fallbackEmoji = '👨‍💻',
  imageClassName = 'w-full h-full object-cover',
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const isPhoto = isPhotoAvatar(avatar) && !imageError;

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center select-none shrink-0 ${className}`}
    >
      {isPhoto ? (
        <img
          src={avatar!}
          alt={name || 'User Profile Photo'}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className={`rounded-inherit ${imageClassName}`}
        />
      ) : (
        <span className="leading-none text-center flex items-center justify-center">
          {avatar && !imageError ? avatar : fallbackEmoji}
        </span>
      )}
    </div>
  );
};
