import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Image, RefreshCw, CheckCircle, XCircle, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAllEpisodeThumbnails, generateEpisodeThumbnail, type ThumbnailGenerationResult } from '@/utils/thumbnailGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Episode {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  episode_number: number;
}

export function ThumbnailGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ThumbnailGenerationResult[]>([]);
  const { toast } = useToast();

  // Fetch episodes to show current thumbnail status
  const { data: episodes, refetch: refetchEpisodes } = useQuery({
    queryKey: ['episodes-thumbnails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('episodes')
        .select('id, title, video_url, thumbnail_url, episode_number')
        .eq('status', 'approved')
        .order('episode_number', { ascending: true });

      if (error) throw error;
      return data as Episode[];
    }
  });

  const handleGenerateAllThumbnails = async () => {
    setIsGenerating(true);
    setResults([]);

    try {
      toast({
        title: "Starting thumbnail generation",
        description: "Processing all episodes...",
      });

      const result = await generateAllEpisodeThumbnails();
      setResults(result.results);

      const successCount = result.results.filter(r => r.success).length;
      const errorCount = result.results.filter(r => !r.success).length;

      toast({
        title: "Thumbnail generation completed",
        description: `${successCount} successful, ${errorCount} failed`,
        variant: successCount === result.results.length ? "default" : "destructive"
      });

      // Refresh the episodes list
      refetchEpisodes();

    } catch (error) {
      console.error('Error generating thumbnails:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate thumbnails",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSingleThumbnail = async (episodeId: string) => {
    try {
      toast({
        title: "Generating thumbnail",
        description: "Processing episode...",
      });

      const result = await generateEpisodeThumbnail(episodeId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Thumbnail generated for "${result.episodeTitle}"`,
        });
        refetchEpisodes();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate thumbnail",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate thumbnail",
        variant: "destructive"
      });
    }
  };

  const episodesWithThumbnails = episodes?.filter(ep => ep.thumbnail_url) || [];
  const episodesWithoutThumbnails = episodes?.filter(ep => !ep.thumbnail_url) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Episode Thumbnail Generator
          </CardTitle>
          <CardDescription>
            Generate thumbnails for episodes by capturing frames from Vimeo videos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleGenerateAllThumbnails}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Image className="h-4 w-4" />
              )}
              Generate All Thumbnails
            </Button>
          </div>

          {episodes && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Episodes with Thumbnails ({episodesWithThumbnails.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {episodesWithThumbnails.map((episode) => (
                    <div key={episode.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">E{episode.episode_number}</Badge>
                        <span className="text-sm truncate">{episode.title}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateSingleThumbnail(episode.id)}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Regenerate
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Episodes without Thumbnails ({episodesWithoutThumbnails.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {episodesWithoutThumbnails.map((episode) => (
                    <div key={episode.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">E{episode.episode_number}</Badge>
                        <span className="text-sm truncate">{episode.title}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateSingleThumbnail(episode.id)}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Generate
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Generation Results:</p>
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>{result.episodeTitle}: {result.success ? 'Success' : result.error}</span>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}