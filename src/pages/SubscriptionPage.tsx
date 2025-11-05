import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, Star, Sparkles, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShortTalezLogo } from '@/components/ShortTalezLogo';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      // For now, just show success message - later this will be functional
      alert('Subscription feature coming soon! 🚀');
    }, 2000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#001a33' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-sm border-b border-white/10" style={{ backgroundColor: 'rgba(0, 26, 51, 0.9)' }}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/home')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <ShortTalezLogo size="sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Crown className="w-16 h-16 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-pink-400 animate-bounce" />
            </div>
          </div>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Unlock Premium Content
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Get exclusive access to premium series and unlimited entertainment for an incredible introductory price!
          </p>
        </div>

        {/* Pricing Card */}
        <div className="flex justify-center mb-8">
          <Card className="w-full max-w-md bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-yellow-400/50 shadow-2xl relative overflow-hidden">
            {/* Premium Badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3" />
                PREMIUM
              </div>
            </div>

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-white text-2xl font-bold mb-2">
                Premium Subscription
              </CardTitle>
              <CardDescription className="text-white/70">
                Limited Time Offer
              </CardDescription>
              
              {/* Price Section */}
              <div className="mt-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-white/50 text-xl line-through">₹299</span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    99% OFF
                  </span>
                </div>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-yellow-400">₹1</span>
                  <span className="text-white/70 text-lg ml-2">/month</span>
                </div>
                <p className="text-pink-400 text-sm mt-2 font-semibold">
                  🔥 First Month Only - Then ₹299/month
                </p>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Features List */}
              <div className="space-y-3 mb-6">
                {[
                  'Unlimited access to ALL premium series',
                  'Watch "I\'m not virgin" complete series',
                  'Exclusive "Miss Unlucky" episodes',
                  'Ad-free streaming experience',
                  'High-quality video playback',
                  'Early access to new releases',
                  'Cancel anytime'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Subscribe Button */}
              <Button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Start ₹1 Trial Now
                  </div>
                )}
              </Button>

              {/* Terms */}
              <p className="text-white/50 text-xs text-center mt-4 leading-relaxed">
                * Trial valid for new subscribers only. Auto-renews at ₹299/month after trial period. 
                Cancel anytime from your account settings.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Premium Series Preview */}
        <div className="mt-12">
          <h2 className="font-montserrat text-2xl font-semibold text-center mb-8 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
            Premium Series You'll Get Access To
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Miss Unlucky */}
            <Card className="bg-white/5 border border-white/10 hover:border-pink-400/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Miss Unlucky</h3>
                    <p className="text-white/60 text-sm">Complete Series • 9 Episodes</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="text-yellow-400 text-xs">Premium</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* I'm not virgin */}
            <Card className="bg-white/5 border border-white/10 hover:border-pink-400/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">I'm not virgin</h3>
                    <p className="text-white/60 text-sm">Complete Series • Hot Content</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="text-yellow-400 text-xs">Premium</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;