"use client";

import { useRef, useState } from "react";
import { Play, Pause, MapPin, BriefcaseBusiness, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { CandidateCardData } from "@/lib/types";
import { MAX_VIDEO_PITCH_SECONDS } from "@/lib/upload";

/**
 * Card slide 1 is the seeker's profile photo; tapping the right half (or the
 * "Play pitch" pill) advances to slide 2, a <= 20s elevator-pitch video.
 * Tapping the left half on slide 2 goes back to the photo. The skills
 * overlay text stays visible on both slides. Dragging the card (handled by
 * the parent SwipeDeck) still works regardless of which slide is showing.
 */
export function DualSlideCard({ candidate }: { candidate: CandidateCardData }) {
  const [slide, setSlide] = useState<0 | 1>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function goToSlide(next: 0 | 1) {
    if (next === slide) return;
    setSlide(next);
    if (next === 0) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }

  function handleTapZone(e: React.MouseEvent<HTMLDivElement>) {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const tappedRight = e.clientX - left > width / 2;
    goToSlide(tappedRight ? 1 : 0);
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  // Hard safety net: cut playback at MAX_VIDEO_PITCH_SECONDS even if a video
  // file slipped past upload-time validation.
  function handleTimeUpdate() {
    const video = videoRef.current;
    if (video && video.currentTime >= MAX_VIDEO_PITCH_SECONDS) {
      video.pause();
      setIsPlaying(false);
    }
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-navy-900 shadow-card">
      {/* Slide progress indicator */}
      <div className="absolute left-4 right-4 top-4 z-20 flex gap-1.5">
        {[0, 1].map((i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
            <div className={`h-full bg-gold-400 transition-all duration-200 ${slide >= i ? "w-full" : "w-0"}`} />
          </div>
        ))}
      </div>

      <div className="relative flex-1">
        {slide === 0 ? (
          candidate.profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.profilePhotoUrl}
              alt={`${candidate.fullName}'s profile photo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-navy-800 text-navy-400">
              <ImageIcon size={48} aria-hidden="true" />
            </div>
          )
        ) : candidate.videoPitchUrl ? (
          <div className="relative h-full w-full">
            <video
              ref={videoRef}
              src={candidate.videoPitchUrl}
              className="h-full w-full object-cover"
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
            <button
              type="button"
              aria-label={isPlaying ? "Pause pitch video" : "Play pitch video"}
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center"
            >
              {!isPlaying && (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-navy-900">
                  <Play size={28} aria-hidden="true" fill="currentColor" />
                </span>
              )}
            </button>
            {isPlaying && (
              <button
                type="button"
                aria-label="Pause pitch video"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="absolute bottom-4 right-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 text-navy-900"
              >
                <Pause size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-navy-800 text-navy-400">
            <VideoIcon size={48} aria-hidden="true" />
            <p className="text-sm">No pitch video yet</p>
          </div>
        )}

        {/* Invisible left/right tap zones for slide navigation */}
        <div className="absolute inset-0 z-10 flex" onClick={handleTapZone} role="presentation">
          <div className="h-full w-1/2 cursor-pointer" aria-hidden="true" />
          <div className="h-full w-1/2 cursor-pointer" aria-hidden="true" />
        </div>
      </div>

      {/* Bottom overlay: name, headline, skills */}
      <div className="relative z-20 bg-gradient-to-t from-navy-950 via-navy-950/90 to-transparent px-6 pb-6 pt-10">
        <h2 className="font-display text-2xl font-bold text-white">{candidate.fullName}</h2>
        {candidate.headline && <p className="text-[15px] text-navy-100">{candidate.headline}</p>}
        <p className="mt-1 flex items-center gap-3 text-sm text-navy-200">
          <span className="flex items-center gap-1">
            <BriefcaseBusiness size={14} aria-hidden="true" />
            {candidate.yearsExp} {candidate.yearsExp === 1 ? "year" : "years"}
          </span>
          {candidate.location && (
            <span className="flex items-center gap-1">
              <MapPin size={14} aria-hidden="true" />
              {candidate.location}
            </span>
          )}
        </p>
        {candidate.skillsDescription && (
          <p className="mt-2 text-[15px] leading-relaxed text-white">{candidate.skillsDescription}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {candidate.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
