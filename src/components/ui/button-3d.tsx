import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import './button-3d.css';

interface Button3DProps {
  children?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  color?: string;
  brightness?: number;
  soundEnabled?: boolean;
}

export const Button3D: React.FC<Button3DProps> = ({
  children = 'Go',
  onClick,
  href,
  className,
  size = 'md',
  disabled = false,
  color = 'black',
  brightness = 1,
  soundEnabled = true,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [downSound, setDownSound] = useState<HTMLAudioElement | null>(null);
  const [upSound, setUpSound] = useState<HTMLAudioElement | null>(null);

  // Size configurations
  const sizeConfig = {
    sm: { dimension: '120px', fontSize: '12px' },
    md: { dimension: '200px', fontSize: '20px' },
    lg: { dimension: '280px', fontSize: '28px' },
  };

  useEffect(() => {
    // Initialize audio (only in browser and when sound is enabled)
    if (typeof window !== 'undefined' && soundEnabled) {
      try {
        const down = new Audio('/assets/3d-button/key-down.mp3');
        const up = new Audio('/assets/3d-button/key-up.mp3');
        
        down.preload = 'auto';
        up.preload = 'auto';
        
        // Set volume to ensure audibility
        down.volume = 0.5;
        up.volume = 0.5;
        
        // Handle audio loading errors
        down.onerror = () => console.warn('Failed to load key-down sound');
        up.onerror = () => console.warn('Failed to load key-up sound');
        
        setDownSound(down);
        setUpSound(up);
      } catch (error) {
        console.warn('Audio initialization failed:', error);
      }
    }
  }, [soundEnabled]);

  const playSound = (audio: HTMLAudioElement | null) => {
    if (!audio || !soundEnabled) return;
    
    try {
      audio.currentTime = 0;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Don't log error if it's just due to user interaction requirements
          if (error.name !== 'NotAllowedError') {
            console.warn('Audio playback failed:', error);
          }
        });
      }
    } catch (error) {
      console.warn('Audio playback error:', error);
    }
  };

  const handleMouseDown = () => {
    if (disabled || isPressed) return;
    setIsPressed(true);
    playSound(downSound);
  };

  const handleMouseUp = () => {
    if (disabled || !isPressed) return;
    setIsPressed(false);
    playSound(upSound);
  };

  const handleClick = () => {
    if (disabled) return;
    
    if (href) {
      setTimeout(() => {
        window.open(href, '_blank');
      }, 300);
    } else if (onClick) {
      setTimeout(() => {
        onClick();
      }, 300);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isPressed) return;
    e.preventDefault();
    setIsPressed(true);
    playSound(downSound);
  };

  const handleTouchEnd = () => {
    if (disabled || !isPressed) return;
    setIsPressed(false);
    playSound(upSound);
  };

  // Reset button state when window loses focus and add global mouseup listener
  useEffect(() => {
    const handleBlur = () => {
      if (isPressed) {
        setIsPressed(false);
        playSound(upSound);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isPressed) {
        setIsPressed(false);
        playSound(upSound);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isPressed) {
        setIsPressed(false);
        playSound(upSound);
      }
    };

    // Global mouseup listener to catch mouseup outside button
    document.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPressed, upSound]);

  const buttonStyle = {
    '--dimension': sizeConfig[size].dimension,
    '--color': color,
    '--brightness': brightness,
  } as React.CSSProperties;

  return (
    <div
      ref={buttonRef}
      className={cn(
        'frame-3d',
        isPressed && 'frame-3d--active',
        disabled && 'frame-3d--disabled',
        className
      )}
      style={buttonStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={handleClick}
    >
      <img 
        className="frame-3d__base" 
        src="/assets/3d-button/base.svg" 
        alt="button base"
        draggable={false}
      />
      <img 
        className="frame-3d__key" 
        src="/assets/3d-button/key.svg" 
        alt="button key"
        draggable={false}
      />
      <img 
        className="frame-3d__cover" 
        src="/assets/3d-button/cover.svg" 
        alt="button cover"
        draggable={false}
      />
      <span className="frame-3d__text" style={{ fontSize: sizeConfig[size].fontSize }}>
        {children}
      </span>
    </div>
  );
}; 