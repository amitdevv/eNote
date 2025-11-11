import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGitHubStar = () => {
    window.open('https://github.com/amitdevv/eNote', '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Responsive Header - Centered */}
      <div className="sticky top-0 z-50 pt-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <header className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
            <div className="px-4 sm:px-6 py-2">
              <div className="flex justify-between items-center">
                {/* Logo - Responsive */}
                <div className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <img 
                      src="/favicon.svg" 
                      alt="eNote Logo" 
                      className="w-10 h-10 sm:w-12 sm:h-12"
                    />
                    <span className="text-xl sm:text-2xl font-normal text-gray-900">eNote</span>
                  </div>
                </div>

                {/* Action Buttons - Mobile Optimized */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* GitHub Link */}
                  <button
                    onClick={handleGitHubStar}
                    className="text-gray-900 hover:underline transition-colors"
                    aria-label="GitHub"
                  >
                    GitHub
                  </button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/notes')}
                    className="px-5 sm:px-6 py-2.5 rounded-lg sm:py-3 text-base sm:text-lg bg-black hover:bg-[#171717] text-white"
                  >
                    Try eNote
                  </Button>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-4 sm:pt-6 pb-8 sm:pb-12 lg:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Content Container */}
          <div className="px-6 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10">
              {/* Main Heading - Centered */}
              <div className="text-center mb-10 sm:mb-14 lg:mb-16">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-normal text-gray-900 mb-1">
                  Your <span className="italic" style={{ fontStyle: 'italic', fontFamily: 'Playfair Display, serif' }}>second brain</span>.
                </h1>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-normal text-gray-900">
                  for notes, tasks
                </h1>
              </div>

              {/* Hero Image - Centered */}
              <div className="flex justify-center mb-4 ">
                <div className="relative w-full max-w-4xl mx-auto">
                  <div className="relative overflow-hidden">
                    <img
                      src="/assets/images/lightmodelanding.png"
                      alt="eNote Dashboard"
                      className="w-full h-auto"
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
                    {/* Gradient overlay for lower fade effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Subtitle - Below Image */}
              <div className="text-center mb-8">
                <p className="text-base sm:text-lg lg:text-2xl font-normal text-gray-600">
                  eNote for everything
                </p>
              </div>

              {/* Feature Icons - Bottom Section */}
              <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16">
                {/* Docs */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="w-full h-full text-gray-900">
                      <path d="M164,128a4,4,0,0,1-4,4H96a4,4,0,0,1,0-8h64A4,4,0,0,1,164,128Zm-4,28H96a4,4,0,0,0,0,8h64a4,4,0,0,0,0-8ZM212,40V200a28,28,0,0,1-28,28H72a28,28,0,0,1-28-28V40a4,4,0,0,1,4-4H76V24a4,4,0,0,1,8,0V36h40V24a4,4,0,0,1,8,0V36h40V24a4,4,0,0,1,8,0V36h28A4,4,0,0,1,212,40Zm-8,4H180V56a4,4,0,0,1-8,0V44H132V56a4,4,0,0,1-8,0V44H84V56a4,4,0,0,1-8,0V44H52V200a20,20,0,0,0,20,20H184a20,20,0,0,0,20-20Z"></path>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-700">Docs</span>
                </div>

                {/* Tasks */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="w-full h-full text-gray-900">
                      <path d="M170.83,101.17a4,4,0,0,1,0,5.66l-56,56a4,4,0,0,1-5.66,0l-24-24a4,4,0,0,1,5.66-5.66L112,154.34l53.17-53.17A4,4,0,0,1,170.83,101.17ZM220,48V208a12,12,0,0,1-12,12H48a12,12,0,0,1-12-12V48A12,12,0,0,1,48,36H208A12,12,0,0,1,220,48Zm-8,0a4,4,0,0,0-4-4H48a4,4,0,0,0-4,4V208a4,4,0,0,0,4,4H208a4,4,0,0,0,4-4Z"></path>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-700">Tasks</span>
                </div>

                {/* Whiteboards */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="w-full h-full text-gray-900">
                      <path d="M251,157.32c-1.32-1.46-24.47-26.63-61.79-40.43-1.26-18.56-7.78-35.45-18.66-48.13C156.62,52.56,136.38,44,112,44,62.51,44,30.1,88.58,28.74,90.48a4,4,0,0,0,6.51,4.65C35.56,94.7,66.68,52,112,52c22,0,40.11,7.6,52.45,22,9.11,10.61,14.81,24.62,16.46,40.13A137.84,137.84,0,0,0,140.6,108c-25.1,0-46.09,6.48-60.69,18.75C67.26,137.39,60,152.15,60,167.25a43.64,43.64,0,0,0,12.69,31.22C81.59,207.32,94,212,108.6,212c51.63,0,79.87-44.08,80.78-86.32,34.07,13.58,55.36,36.67,55.65,37a4,4,0,1,0,5.94-5.36Zm-88.4,21.47c-9.37,11.5-26.34,25.21-54,25.21C80.71,204,68,185,68,167.25,68,142.57,90.72,116,140.6,116a129.23,129.23,0,0,1,40.8,6.77v.81C181.4,144,174.54,164.1,162.57,178.79Z"></path>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-700">Whiteboards</span>
                </div>

                {/* Daily Notes */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="w-full h-full text-gray-900">
                      <path d="M224.49,76.2,179.8,31.51a12,12,0,0,0-17,0L133.17,61.17h0L39.52,154.83A11.9,11.9,0,0,0,36,163.31V208a12,12,0,0,0,12,12H92.69a12,12,0,0,0,8.48-3.51L224.48,93.17a12,12,0,0,0,0-17Zm-129,134.63A4,4,0,0,1,92.69,212H48a4,4,0,0,1-4-4V163.31a4,4,0,0,1,1.17-2.83L136,69.65,186.34,120ZM218.83,87.51,192,114.34,141.66,64l26.82-26.83a4,4,0,0,1,5.66,0l44.69,44.68a4,4,0,0,1,0,5.66Z"></path>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-700">Daily Notes</span>
                </div>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
};