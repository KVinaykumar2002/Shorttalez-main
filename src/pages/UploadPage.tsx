import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MovieThemedLoadingScreen } from '@/components/MovieThemedLoadingScreen';
import { useToast } from '@/hooks/use-toast';
import { Upload, Video, Image, Loader2, Plus, ArrowLeft } from 'lucide-react';

interface Series {
  id: string;
  title: string;
  episode_count: number;
}

const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [series, setSeries] = useState<Series[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [creatingSeriesLoading, setCreatingSeriesLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    seriesId: '',
    duration: 0
  });

  const [newSeriesData, setNewSeriesData] = useState({
    title: '',
    description: '',
    genre: ''
  });

  useEffect(() => {
    fetchUserSeries();
  }, []);

  const fetchUserSeries = async () => {
    if (!user) return;

    // First ensure user has a creator profile
    const { data: creatorData, error: creatorError } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creatorError) {
      console.error('Error fetching creator:', creatorError);
      return;
    }

    if (!creatorData) {
      // Create creator profile if it doesn't exist
      const { error: createCreatorError } = await supabase
        .from('creators')
        .insert({
          user_id: user.id,
          bio: ''
        });

      if (createCreatorError) {
        console.error('Error creating creator:', createCreatorError);
        return;
      }
    }

    const { data, error } = await supabase
      .from('series')
      .select('id, title, episode_count')
      .eq('creator_id', creatorData?.id)
      .order('title');

    if (error) {
      console.error('Error fetching series:', error);
      return;
    }

    setSeries(data || []);
  };

  const validateVideoUrl = (url: string) => {
    if (!url) return false;
    
    // YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) return true;
    
    // Instagram URLs
    if (url.includes('instagram.com')) return true;
    
    // Google Drive URLs
    if (url.includes('drive.google.com')) return true;
    
    // Vimeo URLs
    if (url.includes('vimeo.com')) return true;
    
    // pCloud URLs
    if (url.includes('pcloud.link') || url.includes('pcloud.com')) return true;
    
    // Direct video file URLs
    if (url.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i)) return true;
    
    // Generic URL validation
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getVideoTitle = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Extract title from URL path
      const segments = pathname.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      
      // Remove file extension and replace dashes/underscores with spaces
      return lastSegment
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    } catch {
      return 'Video Episode';
    }
  };

  const createNewSeries = async () => {
    if (!user || !newSeriesData.title.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please enter a series title",
        variant: "destructive"
      });
      return;
    }

    setCreatingSeriesLoading(true);

    try {
      // First check if user has a creator profile
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (creatorError) {
        throw creatorError;
      }

      let creatorId = creatorData?.id;

      // Create creator profile if it doesn't exist
      if (!creatorId) {
        const { data: newCreator, error: createCreatorError } = await supabase
          .from('creators')
          .insert({
            user_id: user.id,
            bio: ''
          })
          .select('id')
          .maybeSingle();

        if (createCreatorError) throw createCreatorError;
        creatorId = newCreator.id;
      }

      // Create the new series
      const { data: newSeries, error: seriesError } = await supabase
        .from('series')
        .insert({
          creator_id: creatorId,
          title: newSeriesData.title.trim(),
          description: newSeriesData.description.trim() || null,
          genre: newSeriesData.genre.trim() || null,
          status: 'draft'
        })
        .select('id, title, episode_count')
        .maybeSingle();

      if (seriesError) throw seriesError;

      // Add to series list and select it
      const updatedSeries = [...series, newSeries];
      setSeries(updatedSeries);
      setFormData(prev => ({ ...prev, seriesId: newSeries.id }));

      // Reset form and close dialog
      setNewSeriesData({ title: '', description: '', genre: '' });
      setShowCreateSeries(false);

      toast({
        title: "Series created!",
        description: `"${newSeries.title}" has been created and selected`
      });

    } catch (error) {
      console.error('Error creating series:', error);
      toast({
        title: "Failed to create series",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setCreatingSeriesLoading(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        
        // Get video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          setFormData(prev => ({ ...prev, duration: Math.round(video.duration) }));
        };
        video.src = URL.createObjectURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a video file",
          variant: "destructive"
        });
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setThumbnailFile(file);
      } else {
        toast({
          title: "Invalid file type", 
          description: "Please select an image file",
          variant: "destructive"
        });
      }
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.seriesId) {
      toast({
        title: "Missing required fields",
        description: "Please select a series",
        variant: "destructive"
      });
      return;
    }

    // Validate either file or URL is provided
    if (uploadMethod === 'file' && !videoFile) {
      toast({
        title: "Missing video file",
        description: "Please select a video file",
        variant: "destructive"
      });
      return;
    }

    if (uploadMethod === 'url' && !validateVideoUrl(videoUrl)) {
      toast({
        title: "Invalid video URL",
        description: "Please enter a valid video URL",
        variant: "destructive"
      });
      return;
    }

    // Use video filename as title if no title provided
    const episodeTitle = formData.title.trim() || 
      (uploadMethod === 'file' && videoFile ? videoFile.name.replace(/\.[^/.]+$/, '') : getVideoTitle(videoUrl));

    setLoading(true);
    setUploadProgress(0);

    try {
      // Get the next episode number for this series
      const selectedSeries = series.find(s => s.id === formData.seriesId);
      const episodeNumber = (selectedSeries?.episode_count || 0) + 1;

      let finalVideoUrl = '';
      let thumbnailUrl = null;

      if (uploadMethod === 'file' && videoFile) {
        // Upload video file
        const videoPath = `${user.id}/${formData.seriesId}/${Date.now()}_${videoFile.name}`;
        setUploadProgress(25);
        
        await uploadFile(videoFile, 'videos', videoPath);
        setUploadProgress(50);

        // Get video URL
        const { data: videoData } = supabase.storage
          .from('videos')
          .getPublicUrl(videoPath);
        
        finalVideoUrl = videoData.publicUrl;

        // Upload thumbnail if provided
        if (thumbnailFile) {
          const thumbnailPath = `${user.id}/${formData.seriesId}/${Date.now()}_${thumbnailFile.name}`;
          await uploadFile(thumbnailFile, 'thumbnails', thumbnailPath);
          
          const { data: thumbnailData } = supabase.storage
            .from('thumbnails')
            .getPublicUrl(thumbnailPath);
          
          thumbnailUrl = thumbnailData.publicUrl;
        }
      } else {
        // Use provided URL
        finalVideoUrl = videoUrl;
        setUploadProgress(50);

        // Upload thumbnail if provided for URL method
        if (thumbnailFile) {
          const thumbnailPath = `${user.id}/${formData.seriesId}/${Date.now()}_${thumbnailFile.name}`;
          await uploadFile(thumbnailFile, 'thumbnails', thumbnailPath);
          
          const { data: thumbnailData } = supabase.storage
            .from('thumbnails')
            .getPublicUrl(thumbnailPath);
          
          thumbnailUrl = thumbnailData.publicUrl;
        }
      }

      setUploadProgress(75);

      // Create episode record
      const { error: insertError } = await supabase
        .from('episodes')
        .insert({
          series_id: formData.seriesId,
          title: episodeTitle,
          description: formData.description,
          video_url: finalVideoUrl,
          thumbnail_url: thumbnailUrl,
          duration: formData.duration,
          episode_number: episodeNumber,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Update series episode count
      await supabase
        .from('series')
        .update({ 
          episode_count: episodeNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.seriesId);

      setUploadProgress(100);

      toast({
        title: "Upload successful!",
        description: "Your episode has been uploaded and is pending approval"
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        seriesId: '',
        duration: 0
      });
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoUrl('');
      setUploadProgress(0);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please sign in to upload videos</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="absolute -top-4 left-0 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="pt-8">
        <h1 className="text-3xl font-bold text-gradient-primary">Upload Episode</h1>
        <p className="text-muted-foreground mt-2">
          Upload a new episode to one of your series
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Episode Details
          </CardTitle>
          <CardDescription>
            Fill in the episode information and select your video file
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Episode Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter episode title (optional - will use filename if empty)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your episode..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="series">Series *</Label>
                <Dialog open={showCreateSeries} onOpenChange={setShowCreateSeries}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Series
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Series</DialogTitle>
                      <DialogDescription>
                        Create a new series to organize your episodes
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newSeriesTitle">Series Title *</Label>
                        <Input
                          id="newSeriesTitle"
                          value={newSeriesData.title}
                          onChange={(e) => setNewSeriesData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter series title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newSeriesDescription">Description</Label>
                        <Textarea
                          id="newSeriesDescription"
                          value={newSeriesData.description}
                          onChange={(e) => setNewSeriesData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your series..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newSeriesGenre">Genre</Label>
                        <Input
                          id="newSeriesGenre"
                          value={newSeriesData.genre}
                          onChange={(e) => setNewSeriesData(prev => ({ ...prev, genre: e.target.value }))}
                          placeholder="e.g., Comedy, Drama, Educational"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateSeries(false)}
                          disabled={creatingSeriesLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={createNewSeries}
                          disabled={creatingSeriesLoading || !newSeriesData.title.trim()}
                        >
                          {creatingSeriesLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Create Series
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Select 
                value={formData.seriesId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, seriesId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a series" />
                </SelectTrigger>
                <SelectContent>
                  {series.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title} (Episode {(s.episode_count || 0) + 1})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Video Source *</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="file-upload"
                      name="upload-method"
                      value="file"
                      checked={uploadMethod === 'file'}
                      onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                      className="w-4 h-4 text-primary"
                    />
                    <Label htmlFor="file-upload" className="text-sm font-normal">Upload File</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="url-input"
                      name="upload-method"
                      value="url"
                      checked={uploadMethod === 'url'}
                      onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                      className="w-4 h-4 text-primary"
                    />
                    <Label htmlFor="url-input" className="text-sm font-normal">Video URL</Label>
                  </div>
                </div>
              </div>

              {uploadMethod === 'file' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="video">Video File *</Label>
                    <div className="relative">
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        required={uploadMethod === 'file'}
                      />
                      {videoFile && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Video className="h-4 w-4" />
                          {videoFile.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
                    <div className="relative">
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                      />
                      {thumbnailFile && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Image className="h-4 w-4" />
                          {thumbnailFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL *</Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://u.pcloud.link/publink/show?code=YOUR_CODE or Google Drive link"
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      <strong>Supported:</strong> pCloud, Google Drive, YouTube, Vimeo, and direct video URLs. <br />
                      <strong>pCloud:</strong> Use public share links (pcloud.link format).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
                    <div className="relative">
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                      />
                      {thumbnailFile && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Image className="h-4 w-4" />
                          {thumbnailFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Episode
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {series.length === 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              You need to create a series first before uploading episodes. 
              Please create a series from your dashboard.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadPage;