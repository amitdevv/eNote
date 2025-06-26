import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { fetchRealUserCount } from '@/config/stats';
import {
  FileText,
  Users,
  Star
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState<number>(42); // Start with fallback
  const [loading, setLoading] = useState(true);

  // Fetch real user count on component mount
  useEffect(() => {
    const loadRealUserCount = async () => {
      try {
        const realCount = await fetchRealUserCount();
        setUserCount(realCount);
      } catch (error) {
        console.error('Failed to load real user count:', error);
        // Keep fallback number
      } finally {
        setLoading(false);
      }
    };

    loadRealUserCount();
  }, []);

  const handleGitHubStar = () => {
    // Replace with your actual GitHub repository URL
    window.open('https://github.com/amitdevv/eNote', '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#171717] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white dark:text-black" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">eNote</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={() => navigate('/notes')}
                className="text-gray-600 dark:text-gray-300  dark:bg-[#333333]"
              >
                Try eNote Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Real Stats Bar - User Count + GitHub Star */}
      <div className="  py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 text-sm">
            {/* Real User Count from Database */}
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
            
            {/* Separator */}
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
            
            {/* GitHub Star Call-to-Action */}
            <button
              onClick={handleGitHubStar}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
            >
              <Star className="w-4 h-4 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
              <span className="font-medium">Star on GitHub</span>
              </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-normal text-gray-900 dark:text-gray-100 leading-tight mb-6">
                <span className="bg-gradient-to-r from-green-200 to-green-400 dark:bg-[#333333] px-2 py-1 rounded font-normal text-black dark:text-[#009541]">Organize</span> your{' '}
                <span className="bg-gradient-to-r from-green-200 to-green-400 dark:bg-[#333333] px-2 py-1 rounded font-normal text-black dark:text-[#009541]">notes</span>{' '}
                manage your{' '}
                <span className="bg-gradient-to-r from-green-200 to-green-400 dark:bg-[#333333] px-2 py-1 rounded font-normal text-black dark:text-[#009541]">tasks</span>
              </h1>

              <p className="text-xl font-normal text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                A powerful note-taking app with rich text editing, smart organization,
                and seamless synchronization across all your devices.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  variant="outline"
                  onClick={() => navigate('/notes')}
                  className=" text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333333]"
                >
                  Open App
                </Button>
              </div>
            </div>

            <div className="relative">
              <img
                src="/assets/images/landingpage.png"
                alt="eNote Dashboard"
                className="w-full h-auto rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};