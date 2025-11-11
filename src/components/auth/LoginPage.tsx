import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center mb-4">
          <img 
            src="/favicon.svg" 
            alt="eNote Logo" 
            className="w-16 h-16"
          />
        </div>
        <h1 className="text-2xl font-bold">
          Welcome to eNote
        </h1>
        <p className="text-gray-600">
          Log in or sign up to get started.
        </p>
        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            variant="outline"
            className="w-full h-12 rounded-xl px-4 bg-[#f5f5f5] hover:bg-[#e5e5e5] text-base"
            size="lg"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="mr-2 h-6 w-6" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48">
                  <defs>
                    <path id="a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"></path>
                  </defs>
                  <clipPath id="b">
                    <use xlinkHref="#a" overflow="visible"></use>
                  </clipPath>
                  <path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z"></path>
                  <path clipPath="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z"></path>
                  <path clipPath="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z"></path>
                  <path clipPath="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z"></path>
                </svg>
                Sign in with Google
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 