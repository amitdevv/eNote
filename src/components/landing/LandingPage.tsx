import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Button3D } from '@/components/ui/button-3d';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/contexts/ThemeContext';
import { fetchRealUserCount, setupLiveUserCount, fetchUserCountWithUpdates } from '@/config/stats';
import {
  Users,
  Star,
  ExternalLink
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [userCount, setUserCount] = useState<number>(42); // Start with fallback
  const [loading, setLoading] = useState(true);

  // Fetch real user count and set up live updates (background functionality)
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let periodicCleanup: (() => void) | null = null;

    const initializeUserCount = async () => {
      try {
        // Get initial count
        const initialCount = await fetchRealUserCount();
        setUserCount(initialCount);
        setLoading(false);

        // Set up real-time updates (if supported) - silent background updates
        try {
          unsubscribe = setupLiveUserCount((newCount) => {
            setUserCount(newCount);
          });
        } catch (realtimeError) {
          // Fallback to periodic updates every 2 minutes
          periodicCleanup = fetchUserCountWithUpdates((newCount) => {
            setUserCount(newCount);
          }, 2);
        }
      } catch (error) {
        console.error('Failed to load user count:', error);
        setLoading(false);
      }
    };

    initializeUserCount();

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (periodicCleanup) {
        periodicCleanup();
      }
    };
  }, []);

  const handleGitHubStar = () => {
    window.open('https://github.com/amitdevv/eNote', '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#171717] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Responsive Header */}
      <header className=" transition-colors duration-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo - Responsive */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <img 
                  src="/favicon.svg" 
                  alt="eNote Logo" 
                  className="w-7 h-7 sm:w-8 sm:h-8"
                />
                <span className="text-lg sm:text-xl font-normal text-gray-900 dark:text-gray-100" style={{ fontFamily: 'Inconsolata, monospace' }}>eNote</span>
              </div>
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex items-center space-x-   sm:space-x-4">
              <ThemeToggle size="sm" className="sm:size-default" />
              <Button
                variant="outline"
                onClick={() => navigate('/notes')}
                size="sm"
                className="text-gray-600 dark:text-gray-300 dark:bg-[#333333] px-3 sm:px-4 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Open App</span>
                <span className="sm:hidden">App</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Stats Bar */}
      <div className=" py-2 sm:py-3">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Mobile Layout (Stacked) */}
          <div className="flex flex-col space-y-2 sm:hidden">
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {loading ? '...' : userCount}
                </span> 
                <span className="ml-1">
                  {userCount === 1 ? 'user' : 'users'}
                </span>
              </span>
            </div>
            
            <button
              onClick={handleGitHubStar}
              className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group py-1"
            >
              <Star className="w-4 h-4 text-[#009541] group-hover:text-[#009541] transition-colors" />
              <span className="font-medium text-sm">Star on GitHub</span>
              <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Desktop/Tablet Layout (Horizontal) */}
          <div className="hidden sm:flex items-center justify-center space-x-6 md:space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {loading ? '...' : userCount}
                </span> 
                <span className="ml-1">
                  {userCount === 1 ? 'user' : 'users'}
                </span>
              </span>
            </div>
            
            
            <button
              onClick={handleGitHubStar}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
            >
              <Star className="w-4 h-4 text-[#009541] group-hover:text-[#009541] transition-colors" />
              <span className="font-medium">Star on GitHub</span>
              <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Text Content - Mobile First */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Responsive Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-gray-900 dark:text-gray-100 leading-tight mb-4 sm:mb-6" style={{ fontFamily: 'Fira Code, monospace' }}>
                Organize your <span className="text-[#009541]">notes</span> manage your <span className="text-[#009541]">tasks</span>
              </h1>

              {/* Responsive Subtitle */}
              <p className="text-lg sm:text-xl font-normal text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Press the <span className="text-[#009541] font-normal">Start</span> button below to begin             </p>

              {/* Mobile-Optimized CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8 justify-center lg:justify-start">
                <div className="flex justify-center lg:justify-start">
                  <Button3D
                    onClick={() => navigate('/notes')}
                    size="md"
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    Start
                  </Button3D>
                </div>
              </div>

              {/* Mobile-friendly features list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span>Free to use</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span>Rich text editor</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span>Cloud sync</span>
                </div>
              </div>
            </div>

            {/* Image - Mobile Optimized with Theme Support */}
            <div className="relative order-1 lg:order-2">
              <div className="mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                <img
                  src={theme === 'dark' ? '/assets/images/darkmodelanding.png' : '/assets/images/lightmodelanding.png'}
                  alt="eNote Dashboard"
                  className="w-full h-auto shadow-md"
                  onError={(e) => {
                    // Fallback to the original image if theme-specific image doesn't load
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = '/assets/images/landingpage.png';
                    target.onerror = () => {
                      // Final fallback if original image also doesn't load
                      target.style.display = 'none';
                    };
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};