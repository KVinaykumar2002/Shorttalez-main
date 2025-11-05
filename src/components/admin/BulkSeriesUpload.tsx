import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Video, Loader2, Plus, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface EpisodeData {
  title: string;
  url: string;
  description?: string;
}

interface SeriesTemplate {
  id: string;
  title: string;
  description: string;
  genre: string;
  language: string;
  episodes: EpisodeData[];
}

export const BulkSeriesUpload: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [uploadResults, setUploadResults] = useState<Array<{ episode: string; status: 'success' | 'error'; message: string }>>([]);

  const [selectedSeriesId, setSelectedSeriesId] = useState('miss-unlucky');
  
  const [seriesTemplates] = useState<SeriesTemplate[]>([
    {
      id: 'miss-unlucky',
      title: 'Miss Unlucky',
      description: 'A captivating series about Miss Unlucky and her adventures',
      genre: 'Drama',
      language: 'te',
      episodes: [
        { title: 'Miss Unlucky - Episode 1', url: 'https://vimeo.com/1122205920' },
        { title: 'Miss Unlucky - Episode 2', url: 'https://vimeo.com/1122206066' },
        { title: 'Miss Unlucky - Episode 3', url: 'https://vimeo.com/1122206110' },
        { title: 'Miss Unlucky - Episode 4', url: 'https://vimeo.com/1122206032' },
        { title: 'Miss Unlucky - Episode 5', url: 'https://vimeo.com/1122205979' },
        { title: 'Miss Unlucky - Episode 6', url: 'https://vimeo.com/1122205883' },
        { title: 'Miss Unlucky - Episode 7', url: 'https://vimeo.com/1122205815' },
        { title: 'Miss Unlucky - Episode 8', url: 'https://vimeo.com/1122205771' },
        { title: 'Miss Unlucky - Episode 9', url: 'https://vimeo.com/1122205708' }
      ]
    },
    {
      id: 'auto-johny-s2',
      title: 'Auto Johny S 2',
      description: 'The exciting continuation of Auto Johny\'s adventures in season 2',
      genre: 'Action',
      language: 'te',
      episodes: [
        { title: 'Auto Johny S 2 - Episode 1', url: 'https://vimeo.com/1122203320' },
        { title: 'Auto Johny S 2 - Episode 2', url: 'https://vimeo.com/1122203284' },
        { title: 'Auto Johny S 2 - Episode 3', url: 'https://vimeo.com/1122203381' },
        { title: 'Auto Johny S 2 - Episode 4', url: 'https://vimeo.com/1122203355' },
        { title: 'Auto Johny S 2 - Episode 5', url: 'https://vimeo.com/1122203232' },
        { title: 'Auto Johny S 2 - Episode 6', url: 'https://vimeo.com/1122203188' },
        { title: 'Auto Johny S 2 - Episode 7', url: 'https://vimeo.com/1122203147' },
        { title: 'Auto Johny S 2 - Episode 8', url: 'https://vimeo.com/1122203106' },
        { title: 'Auto Johny S 2 - Episode 9', url: 'https://vimeo.com/1122203065' },
        { title: 'Auto Johny S 2 - Episode 10', url: 'https://vimeo.com/1122202998' }
      ]
    },
    {
      id: '2-hours-romance',
      title: '2 Hours Romance',
      description: 'A romantic series capturing love stories in just 2 hours',
      genre: 'Romance',
      language: 'te',
      episodes: [
        { title: '2 Hours Romance - Episode 1', url: 'https://vimeo.com/1122204757' },
        { title: '2 Hours Romance - Episode 2', url: 'https://vimeo.com/1122204839' },
        { title: '2 Hours Romance - Episode 3', url: 'https://vimeo.com/1122204806' },
        { title: '2 Hours Romance - Episode 4', url: 'https://vimeo.com/1122204698' },
        { title: '2 Hours Romance - Episode 5', url: 'https://vimeo.com/1122204649' },
        { title: '2 Hours Romance - Episode 6', url: 'https://vimeo.com/1122204612' },
        { title: '2 Hours Romance - Episode 7', url: 'https://vimeo.com/1122204556' },
        { title: '2 Hours Romance - Episode 8', url: 'https://vimeo.com/1122204500' },
        { title: '2 Hours Romance - Episode 9', url: 'https://vimeo.com/1122204465' },
        { title: '2 Hours Romance - Episode 10', url: 'https://vimeo.com/1122204326' }
      ]
    }
  ]);

  const selectedSeries = seriesTemplates.find(s => s.id === selectedSeriesId) || seriesTemplates[0];
  const [seriesData, setSeriesData] = useState({
    title: selectedSeries.title,
    description: selectedSeries.description,
    genre: selectedSeries.genre,
    language: selectedSeries.language
  });

  const validateVideoUrl = (url: string) => {
    return url.includes('vimeo.com') || url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Update series data when template changes
  React.useEffect(() => {
    const selected = seriesTemplates.find(s => s.id === selectedSeriesId) || seriesTemplates[0];
    setSeriesData({
      title: selected.title,
      description: selected.description,
      genre: selected.genre,
      language: selected.language
    });
  }, [selectedSeriesId, seriesTemplates]);

  const handleBulkUpload = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload series",
        variant: "destructive"
      });
      return;
    }

    if (!seriesData.title.trim()) {
      toast({
        title: "Missing series title",
        description: "Please enter a series title",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setProgress(0);
    setUploadResults([]);
    const results: Array<{ episode: string; status: 'success' | 'error'; message: string }> = [];

    try {
      // Step 1: Check/Create creator profile
      setCurrentStep('Setting up creator profile...');
      setProgress(5);

      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (creatorError) throw creatorError;

      let creatorId = creatorData?.id;

      if (!creatorId) {
        const { data: newCreator, error: createCreatorError } = await supabase
          .from('creators')
          .insert({
            user_id: user.id,
            bio: 'Content creator'
          })
          .select('id')
          .maybeSingle();

        if (createCreatorError) throw createCreatorError;
        creatorId = newCreator?.id;
      }

      if (!creatorId) throw new Error('Failed to create or get creator profile');

      // Step 2: Create series
      setCurrentStep('Creating series...');
      setProgress(10);

      const { data: newSeries, error: seriesError } = await supabase
        .from('series')
        .insert({
          creator_id: creatorId,
          title: seriesData.title.trim(),
          description: seriesData.description.trim() || null,
          genre: seriesData.genre.trim() || null,
          language: seriesData.language || 'te',
          status: 'published'
        })
        .select('id')
        .maybeSingle();

      if (seriesError) throw seriesError;
      if (!newSeries) throw new Error('Failed to create series');

      // Step 3: Upload episodes
      setCurrentStep('Uploading episodes...');
      const episodes = selectedSeries.episodes;
      
      for (let i = 0; i < episodes.length; i++) {
        const episode = episodes[i];
        const episodeProgress = 10 + ((i + 1) / episodes.length) * 80;
        setProgress(episodeProgress);
        setCurrentStep(`Uploading episode ${i + 1} of ${episodes.length}...`);

        try {
          if (!validateVideoUrl(episode.url)) {
            throw new Error('Invalid video URL');
          }

            const { error: episodeError } = await supabase
              .from('episodes')
              .insert({
                series_id: newSeries.id,
                title: episode.title,
                description: episode.description || `Episode ${i + 1} of ${selectedSeries.title} series`,
                video_url: episode.url,
                episode_number: i + 1,
                status: 'approved', // Auto-approve since this is bulk admin upload
                duration: 0 // Will be updated later if needed
              });

          if (episodeError) throw episodeError;

          results.push({
            episode: episode.title,
            status: 'success',
            message: 'Uploaded successfully'
          });

        } catch (error) {
          console.error(`Error uploading episode ${i + 1}:`, error);
          results.push({
            episode: episode.title,
            status: 'error',
            message: error instanceof Error ? error.message : 'Upload failed'
          });
        }
      }

      // Step 4: Update series episode count
      setCurrentStep('Finalizing series...');
      setProgress(95);

      const successfulEpisodes = results.filter(r => r.status === 'success').length;
      
      await supabase
        .from('series')
        .update({ 
          episode_count: successfulEpisodes,
          updated_at: new Date().toISOString()
        })
        .eq('id', newSeries.id);

      setProgress(100);
      setCurrentStep('Upload complete!');

      toast({
        title: "Bulk upload completed!",
        description: `Series "${seriesData.title}" created with ${successfulEpisodes} episodes`,
      });

    } catch (error) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during bulk upload",
        variant: "destructive"
      });
    } finally {
      setUploadResults(results);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please sign in to upload series</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Series Upload
          </CardTitle>
          <p className="text-muted-foreground">
            Upload multiple episodes for a series at once
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Series Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Select Series Template</Label>
            <Select
              value={selectedSeriesId}
              onValueChange={setSelectedSeriesId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a series template" />
              </SelectTrigger>
              <SelectContent>
                {seriesTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.title} ({template.episodes.length} episodes)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Series Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Series Title</Label>
              <Input
                id="title"
                value={seriesData.title}
                onChange={(e) => setSeriesData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter series title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select
                value={seriesData.genre}
                onValueChange={(value) => setSeriesData(prev => ({ ...prev, genre: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Drama">Drama</SelectItem>
                  <SelectItem value="Comedy">Comedy</SelectItem>
                  <SelectItem value="Romance">Romance</SelectItem>
                  <SelectItem value="Thriller">Thriller</SelectItem>
                  <SelectItem value="Action">Action</SelectItem>
                  <SelectItem value="Horror">Horror</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={seriesData.description}
              onChange={(e) => setSeriesData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the series..."
              rows={3}
            />
          </div>

          {/* Episodes Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Episodes to Upload ({selectedSeries.episodes.length})</h3>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
              {selectedSeries.episodes.map((episode, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    <span className="font-medium">{episode.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{episode.url}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{currentStep}</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Upload Results */}
          {uploadResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Results</h3>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-4 space-y-2">
                {uploadResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="font-medium">{result.episode}</span>
                    <div className="flex items-center gap-2">
                      {result.status === 'success' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {result.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleBulkUpload}
            disabled={loading || !seriesData.title.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading Series...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Series ({selectedSeries.episodes.length} episodes)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};