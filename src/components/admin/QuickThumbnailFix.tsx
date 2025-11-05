import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Image, RefreshCw, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { generateAllEpisodeThumbnails, generateThumbnailsForEpisodes } from '@/utils/thumbnailGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const QuickThumbnailFix: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSelected, setIsGeneratingSelected] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  // Fetch episodes without thumbnails
  const { data: episodesWithoutThumbnails, refetch } = useQuery({
    queryKey: ['episodes-without-thumbnails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('episodes')
        .select('id, title, episode_number')
        .eq('status', 'approved')
        .is('thumbnail_url', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    setResults(null);

    try {
      toast({
        title: '🚀 Starting thumbnail generation',
        description: 'Generating thumbnails for all episodes without them...',
      });

      const result = await generateAllEpisodeThumbnails();
      
      setResults(result);
      
      const successCount = result.results?.filter(r => r.success).length || 0;
      const totalCount = result.results?.length || 0;
      
      toast({
        title: '🎉 Thumbnail generation completed',
        description: `Successfully generated ${successCount}/${totalCount} thumbnails`,
        variant: successCount === totalCount ? 'default' : 'destructive',
      });

      // Refresh the episodes list
      refetch();

    } catch (error) {
      console.error('Error generating thumbnails:', error);
      toast({
        title: '❌ Generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFirst4 = async () => {
    if (!episodesWithoutThumbnails || episodesWithoutThumbnails.length === 0) {
      toast({
        title: 'No episodes found',
        description: 'All episodes already have thumbnails!',
      });
      return;
    }

    setIsGeneratingSelected(true);
    setResults(null);

    try {
      const first4Episodes = episodesWithoutThumbnails.slice(0, 4);
      const episodeIds = first4Episodes.map(ep => ep.id);

      toast({
        title: '🎯 Generating 4 thumbnails',
        description: `Processing ${first4Episodes.length} episodes...`,
      });

      const result = await generateThumbnailsForEpisodes(episodeIds);
      
      setResults(result);
      
      const successCount = result.results?.filter(r => r.success).length || 0;
      const totalCount = result.results?.length || 0;
      
      toast({
        title: '🎉 4 Thumbnails generated',
        description: `Successfully generated ${successCount}/${totalCount} thumbnails`,
        variant: successCount === totalCount ? 'default' : 'destructive',
      });

      // Refresh the episodes list
      refetch();

    } catch (error) {
      console.error('Error generating thumbnails:', error);
      toast({
        title: '❌ Generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingSelected(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Quick Thumbnail Fix
        </CardTitle>
        <CardDescription>
          Generate thumbnails for all episodes that are missing them
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {episodesWithoutThumbnails && episodesWithoutThumbnails.length > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Episodes without thumbnails</p>
                <p className="text-xs text-muted-foreground">
                  {episodesWithoutThumbnails.length} episodes need thumbnails
                </p>
              </div>
              <Badge variant="secondary">{episodesWithoutThumbnails.length}</Badge>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            onClick={handleGenerateFirst4}
            disabled={isGeneratingSelected || !episodesWithoutThumbnails?.length}
            variant="default"
            className="flex items-center gap-2"
          >
            <Zap className={`w-4 h-4 ${isGeneratingSelected ? 'animate-pulse' : ''}`} />
            {isGeneratingSelected ? 'Generating 4...' : 'Generate 4 Thumbnails'}
          </Button>

          <Button 
            onClick={handleGenerateAll}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating All...' : 'Generate All Missing'}
          </Button>
        </div>

        {results && (
          <div className="space-y-2">
            <h4 className="font-medium">Generation Results:</h4>
            <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
              {results.results?.map((result: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="flex-1">{result.episodeTitle}</span>
                  <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              )) || []}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};