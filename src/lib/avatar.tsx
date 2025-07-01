/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
    /** The user's full name (e.g. "Jane Doe") */
    fullName?: string;
    /** Diameter in pixels (defaults to 40) */
    sizePx?: number;
    /** Optional image URL */
    imageUrl?: string;
    /** Optional CSS className override */
    className?: string;
}

/**
 * Extracts initials from a full name.
 *
 * - If there are two or more words, returns the first letter of
 *   the first word + first letter of the last word (e.g. "Jane Doe" → "JD").
 * - If only one word, returns the first two letters (e.g. "Madonna" → "MA").
 * - Converts to uppercase.
 *
 * @param fullName - The user's full name
 * @returns A 1–2 character string of initials
 */
export function getInitials(fullName: string): string {
    if (!fullName) return "U";
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
        const first = parts[0][0];
        const last = parts[parts.length - 1][0];
        return (first + last).toUpperCase();
    }
    // Single word: take first two letters (or just one if that's all there is)
    return fullName.substring(0, 2).toUpperCase();
}

/**
 * A simple avatar component that displays user initials
 * on a green-to-yellow gradient background using shadcn/ui Avatar.
 *
 * @example
 * <UserAvatar fullName="Jane Doe" sizePx={48} />
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  fullName = "User",
  sizePx = 40,
  imageUrl,
  className = "",
}) => {
  const initials = getInitials(fullName);

  return (
    <Avatar 
      className={`${className}`}
      style={{ width: sizePx, height: sizePx }}
    >
      <AvatarImage src={imageUrl} alt={fullName} />
      <AvatarFallback 
        className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold border-2 border-primary/20"
        title={fullName}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;