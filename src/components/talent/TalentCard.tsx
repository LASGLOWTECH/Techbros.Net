import { Link } from "react-router-dom";
import { MapPin, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FreelancerWithProfile, AvailabilityStatus } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface TalentCardProps {
  talent: FreelancerWithProfile;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  showBookmark?: boolean;
}

const availabilityColors: Record<AvailabilityStatus, string> = {
  available: "bg-success/10 text-success border-success/20",
  busy: "bg-warning/10 text-warning border-warning/20",
  unavailable: "bg-muted text-muted-foreground border-muted",
};

const availabilityLabels: Record<AvailabilityStatus, string> = {
  available: "Available",
  busy: "Busy",
  unavailable: "Unavailable",
};

export function TalentCard({ talent, isBookmarked, onBookmark, showBookmark }: TalentCardProps) {
  const initials = talent.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const profilePath = talent.slug ? `/talent/${talent.slug}` : `/talent/${talent.user_id}`;

  return (
    <div className="group relative rounded-xl border border-white/10 shadow-card card-hover overflow-hidden" style={{ background: 'hsl(220 41% 14%)' }}>
      {/* Portfolio Preview */}
      {talent.portfolio_images && talent.portfolio_images.length > 0 && (
        <div className="aspect-video bg-muted overflow-hidden">
          <img
            src={talent.portfolio_images[0]}
            alt={`${talent.full_name}'s work`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-background shadow-md">
            <AvatarImage src={talent.avatar_url || undefined} alt={talent.full_name} />
            <AvatarFallback className="gradient-hero text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {talent.full_name}
              </h3>
              {showBookmark && onBookmark && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onBookmark();
                  }}
                  className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              )}
            </div>
            {talent.role_title && (
              <p className="text-sm text-muted-foreground truncate">
                {talent.role_title}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {talent.bio && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {talent.bio}
          </p>
        )}

        {/* Skills */}
        {talent.skills && talent.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {talent.skills.slice(0, 4).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs font-medium"
              >
                {skill}
              </Badge>
            ))}
            {talent.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{talent.skills.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {talent.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {talent.location}
              </div>
            )}
            <Badge
              variant="outline"
              className={cn("text-xs", availabilityColors[talent.availability])}
            >
              {availabilityLabels[talent.availability]}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link to={profilePath} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              View Profile
            </Button>
          </Link>
          {talent.project_link && (
            <a
              href={talent.project_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
