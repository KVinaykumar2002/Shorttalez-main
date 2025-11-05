import React from 'react';
import { UserFeed } from '@/components/UserFeed';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/lib/translations';
import { useSEOTranslation } from '@/lib/seoTranslations';

const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation('feed');
  
  // Update SEO meta tags for feed page
  useSEOTranslation('feed');

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-4">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t('Conversation lo join avvandi!')}</CardTitle>
              <CardDescription className="text-base">
                {t('Meeku nacchina creators ni follow cheyadaniki login avvandi, mee thoughts share cheskondi.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/auth" className="block">
                <Button className="w-full" size="lg">
                  <LogIn className="w-5 h-5 mr-2" />
                  {t('Login avvandi')}
                </Button>
              </Link>
              <Link to="/auth" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  <UserPlus className="w-5 h-5 mr-2" />
                  {t('Signup cheskondi')}
                </Button>
              </Link>
              <div className="text-center">
                <Link to="/home">
                  <Button variant="ghost" className="text-sm">
                    {t('Episodes chudataniki continue avvandi')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/8 to-secondary/8 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-2xl p-6 mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              {t('Mee Social Feed')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('Meeku follow ayyina creators nundi amazing content and trending posts chudandi')}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{t('Live Feed')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{t('Following & Suggestions')}</span>
            </div>
          </div>
        </div>
        
        <UserFeed showCreatePost={true} />
      </div>
    </div>
  );
};

export default FeedPage;