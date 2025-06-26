import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  FileText,
  Search,
  Tag,
  Folder,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield
} from 'lucide-react';

// Import the landing page image
import landingImage from '@/assets/images/landingpage.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: 'Rich Text Editing',
      description: 'Write with Markdown, code syntax highlighting, and todo lists'
    },
    {
      icon: Search,
      title: 'Powerful Search',
      description: 'Find your notes instantly with intelligent search and filtering'
    },
    {
      icon: Tag,
      title: 'Smart Organization',
      description: 'Organize with tags, workspaces, and status tracking'
    },
    {
      icon: Folder,
      title: 'Multiple Workspaces',
      description: 'Separate your personal, work, and project notes'
    },
    {
      icon: Star,
      title: 'Quick Access',
      description: 'Star important notes for instant access'
    },
    {
      icon: Zap,
      title: 'Export & Import',
      description: 'Export to PDF, Markdown, or JSON. Import your existing notes'
    }
  ];

  const benefits = [
    'Auto-save functionality',
    'Keyboard shortcuts',
    'Dark/Light theme',
    'Font customization',
    'Offline capable'
  ];

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
                Open App
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                src="/src/assets/images/landingpage.png"
                alt="eNote Dashboard"
                className="w-full h-auto rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>
        </div>
      </section>



    </div>
  );
};