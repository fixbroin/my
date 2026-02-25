
'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortfolioItem } from '@/app/admin/settings/actions/portfolio-actions';

interface PortfolioMediaProps {
  item: PortfolioItem;
}

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function PortfolioMedia({ item }: PortfolioMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const youTubeVideoId = item.mediaType === 'video' && item.mediaUrl ? getYouTubeVideoId(item.mediaUrl) : null;

  const handleFullscreen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if ((video as any).mozRequestFullScreen) { /* Firefox */
      (video as any).mozRequestFullScreen();
    } else if ((video as any).webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      (video as any).webkitRequestFullscreen();
    } else if ((video as any).msRequestFullscreen) { /* IE/Edge */
      (video as any).msRequestFullscreen();
    }
  };
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onFullscreenChange = () => {
      if (document.fullscreenElement === video) {
        video.muted = false;
        video.controls = true;
        video.setAttribute('controlsList', 'nodownload');
      } else {
        video.muted = true;
        video.controls = false;
        video.removeAttribute('controlsList');
      }
    };
    
    document.addEventListener('fullscreenchange', onFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };

  }, []);

  return (
    <div className="relative h-full w-full bg-muted">
       {item.mediaType === 'video' ? (
        youTubeVideoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youTubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youTubeVideoId}`}
            title={item.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          ></iframe>
        ) : (
          <>
            <video
              ref={videoRef}
              src={item.mediaUrl}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              autoPlay
              loop
              muted
              playsInline
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-2 right-2 h-8 w-8 opacity-70 transition-opacity group-hover:opacity-100"
              onClick={handleFullscreen}
              aria-label="Play video in fullscreen with sound"
            >
              <Expand className="h-4 w-4" />
            </Button>
          </>
        )
      ) : (
        <Image
          src={item.mediaUrl}
          alt={item.title}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="portfolio item"
        />
      )}
    </div>
  );
}
