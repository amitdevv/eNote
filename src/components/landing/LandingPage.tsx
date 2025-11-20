import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const heroImagesRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const handleGitHubStar = () => {
    window.open('https://github.com/amitdevv/eNote', '_blank');
  };

  useEffect(() => {
    // Load Google Sans Font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Add Google Sans (Product Sans) style
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500;700&display=swap');
      * { font-family: 'Product Sans', 'Inter', sans-serif !important; }
    `;
    document.head.appendChild(style);

    // Header animation on load
    setTimeout(() => setHeaderVisible(true), 100);

    // Observer for hero images
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observer for features
    const featuresObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFeaturesVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (heroImagesRef.current) {
      heroObserver.observe(heroImagesRef.current);
    }

    if (featuresRef.current) {
      featuresObserver.observe(featuresRef.current);
    }

    return () => {
      if (heroImagesRef.current) {
        heroObserver.unobserve(heroImagesRef.current);
      }
      if (featuresRef.current) {
        featuresObserver.unobserve(featuresRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen overflow-hidden text-gray-900" style={{ fontFamily: 'Product Sans, Inter, sans-serif', backgroundColor: '#a6c5e4' }}>
      {/* Responsive Header - Centered */}
      <div
        className="sticky top-0 z-50 pt-4 px-4 sm:px-6 lg:px-8"
        style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
        }}
      >
        <div className="max-w-2xl mx-auto">
          <header>
            <div className="px-4 sm:px-6 py-3">
              <div className="flex justify-between items-center">
                {/* Logo - Responsive */}
                <div className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <span
                      className="text-2xl sm:text-3xl font-semibold text-gray-900 cursor-pointer"
                      style={{ fontFamily: 'Product Sans, Inter, sans-serif', letterSpacing: '-0.02em' }}
                    >
                      eNote
                    </span>
                  </div>
                </div>

                {/* Action Buttons - Mobile Optimized */}
                <div className="flex items-center space-x-3 sm:space-x-5">
                  {/* GitHub Link */}
                  <button
                    onClick={handleGitHubStar}
                    className="text-gray-900 font-medium hover:underline"
                    style={{ fontFamily: 'Product Sans, Inter, sans-serif' }}
                    aria-label="GitHub"
                  >
                    GitHub
                  </button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/notes')}
                    className="rounded-lg text-base sm:text-lg bg-gray-900 hover:bg-gray-800 text-white border-0 font-medium transition-colors"
                    style={{ fontFamily: 'Product Sans, Inter, sans-serif', paddingTop: '11px', paddingBottom: '11px', paddingLeft: '20px', paddingRight: '20px' }}
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
      <section className="pt-2 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Content Container */}
          <div className="px-6 sm:px-8 lg:px-12 py-2 relative">
            {/* Main Heading - Centered */}
            <div
              className="text-center mb-4 mt-8"
              style={{
                opacity: headerVisible ? 1 : 0,
                transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s'
              }}
            >
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium text-gray-900 mb-2 leading-tight"
                style={{ fontFamily: 'Product Sans, Inter, sans-serif', letterSpacing: '-0.03em' }}
              >
                Your <span
                  className="italic font-medium text-gray-900"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  second brain
                </span>.
              </h1>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium text-gray-900 leading-tight"
                style={{ fontFamily: 'Product Sans, Inter, sans-serif', letterSpacing: '-0.03em' }}
              >
                for notes, tasks
              </h1>
            </div>

            {/* Hero Images - Background Layout */}
            <div
              ref={heroImagesRef}
              className="absolute top-32 left-0 right-0 flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-10 px-6 sm:px-8 lg:px-12 pointer-events-none"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 1s ease-out, transform 1s ease-out',
                zIndex: 0
              }}
            >
              {/* Left Image */}
              <div
                className="w-full lg:w-auto lg:max-w-xs"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-30px)',
                  transition: 'opacity 1s ease-out 0.2s, transform 1s ease-out 0.2s'
                }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src="/assets/images/heroimages/left.webp"
                    alt="eNote Left Hero"
                    className="w-full h-auto"
                  />
                  {/* Gradient overlay for fade effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-2/5 pointer-events-none" style={{ background: 'linear-gradient(to top, #a6c5e4, rgba(166, 197, 228, 0.7), transparent)' }}></div>
                </div>
              </div>

              {/* Right Image */}
              <div
                className="w-full lg:w-auto lg:max-w-xs"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(30px)',
                  transition: 'opacity 1s ease-out 0.2s, transform 1s ease-out 0.2s'
                }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src="/assets/images/heroimages/right.webp"
                    alt="eNote Right Hero"
                    className="w-full h-auto"
                  />
                  {/* Gradient overlay for fade effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-2/5 pointer-events-none" style={{ background: 'linear-gradient(to top, #a6c5e4, rgba(166, 197, 228, 0.7), transparent)' }}></div>
                </div>
              </div>
            </div>


            {/* Content Section with Blur Background */}
            <div className="flex justify-center">
              <div className="backdrop-blur-sm bg-white/10 lg:backdrop-blur-none lg:bg-transparent rounded-2xl py-3 px-4 relative inline-block" style={{ zIndex: 10 }}>
                {/* Subtitle - Below Heading with minimal gap */}
                <div
                  className="text-center mb-3"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s'
                  }}
                >
                  <p
                    className="text-lg sm:text-xl lg:text-3xl font-medium text-gray-700"
                    style={{ fontFamily: 'Product Sans, Inter, sans-serif', letterSpacing: '-0.01em' }}
                  >
                    eNote for everything
                  </p>
                </div>

                {/* Feature Icons - Bottom Section */}
                <div
                  ref={featuresRef}
                  className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-14 lg:gap-20 px-2"
                >
                  {/* Docs */}
                  <div
                    className="flex flex-col items-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-110 cursor-pointer"
                    style={{
                      opacity: featuresVisible ? 1 : 0,
                      transform: featuresVisible ? 'translateY(0)' : 'translateY(20px)',
                      transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s'
                    }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center transition-transform duration-300 hover:rotate-12">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="w-full h-full text-gray-900">
                        <path d="M164,128a4,4,0,0,1-4,4H96a4,4,0,0,1,0-8h64A4,4,0,0,1,164,128Zm-4,28H96a4,4,0,0,0,0,8h64a4,4,0,0,0,0-8ZM212,40V200a28,28,0,0,1-28,28H72a28,28,0,0,1-28-28V40a4,4,0,0,1,4-4H76V24a4,4,0,0,1,8,0V36h40V24a4,4,0,0,1,8,0V36h40V24a4,4,0,0,1,8,0V36h28A4,4,0,0,1,212,40Zm-8,4H180V56a4,4,0,0,1-8,0V44H132V56a4,4,0,0,1-8,0V44H84V56a4,4,0,0,1-8,0V44H52V200a20,20,0,0,0,20,20H184a20,20,0,0,0,20-20Z"></path>
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-800" style={{ fontFamily: 'Product Sans, Inter, sans-serif' }}>Docs</span>
                  </div>

                  {/* Tasks */}
                  <div
                    className="flex flex-col items-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-110 cursor-pointer"
                    style={{
                      opacity: featuresVisible ? 1 : 0,
                      transform: featuresVisible ? 'translateY(0)' : 'translateY(20px)',
                      transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s'
                    }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center transition-transform duration-300 hover:rotate-12">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="w-full h-full text-gray-900">
                        <path d="M170.83,101.17a4,4,0,0,1,0,5.66l-56,56a4,4,0,0,1-5.66,0l-24-24a4,4,0,0,1,5.66-5.66L112,154.34l53.17-53.17A4,4,0,0,1,170.83,101.17ZM220,48V208a12,12,0,0,1-12,12H48a12,12,0,0,1-12-12V48A12,12,0,0,1,48,36H208A12,12,0,0,1,220,48Zm-8,0a4,4,0,0,0-4-4H48a4,4,0,0,0-4,4V208a4,4,0,0,0,4,4H208a4,4,0,0,0,4-4Z"></path>
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-800" style={{ fontFamily: 'Product Sans, Inter, sans-serif' }}>Tasks</span>
                  </div>

                  {/* Whiteboards */}
                  <div
                    className="flex flex-col items-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-110 cursor-pointer"
                    style={{
                      opacity: featuresVisible ? 1 : 0,
                      transform: featuresVisible ? 'translateY(0)' : 'translateY(20px)',
                      transition: 'opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s'
                    }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center transition-transform duration-300 hover:rotate-12">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="w-full h-full text-gray-900">
                        <path d="M251,157.32c-1.32-1.46-24.47-26.63-61.79-40.43-1.26-18.56-7.78-35.45-18.66-48.13C156.62,52.56,136.38,44,112,44,62.51,44,30.1,88.58,28.74,90.48a4,4,0,0,0,6.51,4.65C35.56,94.7,66.68,52,112,52c22,0,40.11,7.6,52.45,22,9.11,10.61,14.81,24.62,16.46,40.13A137.84,137.84,0,0,0,140.6,108c-25.1,0-46.09,6.48-60.69,18.75C67.26,137.39,60,152.15,60,167.25a43.64,43.64,0,0,0,12.69,31.22C81.59,207.32,94,212,108.6,212c51.63,0,79.87-44.08,80.78-86.32,34.07,13.58,55.36,36.67,55.65,37a4,4,0,1,0,5.94-5.36Zm-88.4,21.47c-9.37,11.5-26.34,25.21-54,25.21C80.71,204,68,185,68,167.25,68,142.57,90.72,116,140.6,116a129.23,129.23,0,0,1,40.8,6.77v.81C181.4,144,174.54,164.1,162.57,178.79Z"></path>
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-800" style={{ fontFamily: 'Product Sans, Inter, sans-serif' }}>Whiteboards</span>
                  </div>

                  {/* Daily Notes */}
                  <div
                    className="flex flex-col items-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-110 cursor-pointer"
                    style={{
                      opacity: featuresVisible ? 1 : 0,
                      transform: featuresVisible ? 'translateY(0)' : 'translateY(20px)',
                      transition: 'opacity 0.6s ease-out 0.4s, transform 0.6s ease-out 0.4s'
                    }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center transition-transform duration-300 hover:rotate-12">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="w-full h-full text-gray-900">
                        <path d="M224.49,76.2,179.8,31.51a12,12,0,0,0-17,0L133.17,61.17h0L39.52,154.83A11.9,11.9,0,0,0,36,163.31V208a12,12,0,0,0,12,12H92.69a12,12,0,0,0,8.48-3.51L224.48,93.17a12,12,0,0,0,0-17Zm-129,134.63A4,4,0,0,1,92.69,212H48a4,4,0,0,1-4-4V163.31a4,4,0,0,1,1.17-2.83L136,69.65,186.34,120ZM218.83,87.51,192,114.34,141.66,64l26.82-26.83a4,4,0,0,1,5.66,0l44.69,44.68a4,4,0,0,1,0,5.66Z"></path>
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-800" style={{ fontFamily: 'Product Sans, Inter, sans-serif' }}>Daily Notes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};