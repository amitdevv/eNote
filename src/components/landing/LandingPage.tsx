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
                className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
              <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-bold text-black dark:text-green-400">Organize</span> your{' '}
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-bold text-black dark:text-green-400">notes</span>,{' '}
                manage your{' '}
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-bold text-black dark:text-green-400">tasks</span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                A powerful note-taking app with rich text editing, smart organization, 
                and seamless synchronization across all your devices.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/notes')}
                  className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-semibold transition-colors duration-200"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  View Features
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Privacy focused</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>No signup required</span>
                </div>
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

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-[#1a1a1a] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              From simple text notes to complex project management, eNote adapts to your workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Built for productivity
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Every feature is designed to help you capture, organize, and find your information faster.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Join thousands of users who trust eNote with their ideas and projects.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/notes')}
                className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-semibold transition-colors duration-200"
              >
                Start Taking Notes
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white dark:text-black" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">eNote</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              © 2024 eNote. Made with ❤️ for productivity enthusiasts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};