import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MovieThemedLoadingScreen } from '@/components/MovieThemedLoadingScreen';
import { Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/translations';
import { useSEOTranslation } from '@/lib/seoTranslations';
import { createPortal } from 'react-dom';

const AuthPage: React.FC = () => {
  const { user, signIn, signUp, loading, initialized } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // Track client-side rendering
  const { t } = useTranslation('auth');

  // Update SEO meta tags for auth page
  useSEOTranslation('auth');

  // Handle navigation after auth is initialized
  useEffect(() => {
    if (initialized && user) {
      console.log('User authenticated on auth page, navigating to home');
      navigate('/home', { replace: true });
    }
  }, [user, initialized, navigate]);

  // Ensure portal renders only on client side
  useEffect(() => {
    setIsClient(true); // Set client-side flag after mount
  }, []);

  if (loading || !initialized) {
    return <MovieThemedLoadingScreen message={t('Preparing your authentication...')} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (isSignUp) {
        const userData = {
          username: formData.username,
          display_name: formData.displayName,
        };
        result = await signUp(formData.email, formData.password, userData);
      } else {
        result = await signIn(formData.email, formData.password);
      }

      // If sign in successful, navigation will happen via useEffect
      if (!result.error && !isSignUp) {
        // Wait a moment for auth state to update, then navigate
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 100);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Back button component
  const BackButton = () =>
    isClient &&
    createPortal(
      <Button
        variant="default"
        onClick={() => navigate('/')}
        className="!fixed !top-10 !left-4 z-[10000] h-10 px-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg border border-purple-400/40 hover:opacity-90"
        aria-label={t('Back to home')}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium hidden sm:inline">{t('Back')}</span>
      </Button>,
      document.body
    );

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 relative bg-gradient-to-br from-background via-primary/10 to-background">
      {/* Back Button */}
      <BackButton />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute top-40 -right-4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <Card className="w-full max-w-md relative z-10 bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
        <CardHeader className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6 pt-6 sm:pt-8">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 animate-pulse" />
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Short Talez
            </CardTitle>
          </div>

          {/* Telugu Series Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-purple-400/30">
              <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                {t('Watch Telugu Short Series')}
              </span>
            </div>
            <CardDescription className="text-sm sm:text-base px-2 text-gray-300">
              {t('MiniOTT for Everyone - Join millions creating and watching mini-series')}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <Tabs value={isSignUp ? 'signup' : 'signin'} onValueChange={(value) => setIsSignUp(value === 'signup')}>
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-white/5">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-300 text-xs sm:text-sm"
              >
                {t('Login cheskondi')}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-300 text-xs sm:text-sm"
              >
                {t('Signup cheskondi')}
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TabsContent value="signin" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-gray-200">{t('Email')}</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder={t('mee@email.com')}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-gray-200">{t('Password')}</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('••••••••')}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-200">{t('Username')}</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder={t('mee username')}
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-gray-200">{t('Display Name')}</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      placeholder={t('Mee Peru')}
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-200">{t('Email')}</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder={t('mee@email.com')}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-200">{t('Password')}</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('••••••••')}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    {isSignUp ? t('Account create chestunnam...') : t('Login avthunnam...')}
                  </div>
                ) : (
                  isSignUp ? t('Account create cheskondi') : t('Login avvandi')
                )}
              </Button>
            </form>
          </Tabs>

          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-400 px-2">
            <p>{t('Continue chesthunnapudu, maadi Terms of Service and Privacy Policy ki agree avuthunnaru')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;