import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image, Video, Smile, X, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { securityManager } from '@/utils/securityEnhancements';
import { useTranslation } from '@/lib/translations';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation('feed');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user!.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: t("Authentication kavali"),
        description: t("Post create cheyadaniki login avvandi."),
        variant: "destructive",
      });
      return;
    }

    // Security validations
    const securityCheck = await securityManager.validateAuthState();
    if (!securityCheck.valid) {
      toast({
        title: t("Security Error"),
        description: t("Authentication validation failed. Please sign in again."),
        variant: "destructive",
      });
      return;
    }

    // Rate limiting
    const rateLimitAllowed = await securityManager.checkRateLimit('create_post', 5, 300000); // 5 posts per 5 minutes
    if (!rateLimitAllowed) {
      toast({
        title: t("Rate Limit Exceeded"),
        description: t("Please wait before creating another post."),
        variant: "destructive",
      });
      return;
    }

    if (!content.trim() && !selectedImage) {
      toast({
        title: t("Content kavali"),
        description: t("Post lo koncham content leda image add cheskondi."),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let mediaUrl = null;
      let mediaType = null;

      if (selectedImage) {
        // Validate file upload
        const fileValidation = securityManager.validateFileUpload(selectedImage);
        if (!fileValidation.valid) {
          throw new Error(fileValidation.error);
        }
        
        mediaUrl = await uploadImage(selectedImage);
        mediaType = 'image';
      }

      // Sanitize content
      const sanitizedContent = content.trim() ? securityManager.sanitizeInput(content.trim()) : null;

      const { data: newPost, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: sanitizedContent,
          media_url: mediaUrl,
          media_type: mediaType,
          post_type: 'original'
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      console.log('Post created successfully:', newPost);
      
      // Log successful post creation
      await securityManager.logSecurityEvent(
        'post_created',
        'info',
        'User created a new post successfully'
      );

      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: t("Post ayyindhi!"),
        description: t("Mee post successfully share ayyindhi."),
      });
      
      // Call the callback to refresh the feed
      onPostCreated?.();
    } catch (error: any) {
      console.error('Error creating post:', error);
      
      // Log security event for failed post creation
      await securityManager.logSecurityEvent(
        'post_creation_failed',
        'warning',
        'Post creation failed',
        { error: error.message }
      );
      
      toast({
        title: t("Error"),
        description: error.message || t("Failed to create post. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 border-primary/20">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-primary/20">
              <AvatarImage src={user.user_metadata?.avatar_url || null} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white font-bold">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder={t("Mee thoughts, experiences, leda amazing moments share cheskondi...")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-none p-0 text-lg placeholder:text-muted-foreground/70 focus-visible:ring-0 bg-transparent"
                maxLength={500}
              />
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-full max-h-64 rounded-xl object-cover border border-border/50"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 w-8 h-8 p-0 rounded-full"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center justify-center border-t border-border/30 pt-3 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all duration-200"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="w-5 h-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-all duration-200"
                    disabled
                  >
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button
                    type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  disabled
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium transition-colors flex items-center h-10 ${
                    content.length > 450 
                      ? 'text-destructive' 
                      : content.length > 400 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`}>
                    {500 - content.length}
                  </span>
                  <Button
                    type="submit"
                    disabled={(!content.trim() && !selectedImage) || isLoading}
                    className="px-6 h-10 whitespace-nowrap flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 animate-pulse" />
                        {t('Share chesthunnam...')}
                      </div>
                    ) : (
                      t('Share cheskondi')
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};