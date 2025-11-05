import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  video_url: string;
  migrated_to_cloudflare: boolean;
  cloudflare_video_id?: string;
}

interface MigrationResult {
  episodeId: string;
  title: string;
  status: 'success' | 'failed';
  videoId?: string;
  error?: string;
}

const MigrationPage: React.FC = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [migrationResults, setMigrationResults] = useState<MigrationResult[]>([]);

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('id, title, video_url, migrated_to_cloudflare, cloudflare_video_id')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEpisodes(data || []);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      toast.error('Failed to fetch episodes');
    } finally {
      setLoading(false);
    }
  };

  const migrateSingleEpisode = async (episode: Episode) => {
    try {
      setMigrating(true);
      
      const { data, error } = await supabase.functions.invoke('migrate-to-cloudflare', {
        body: {
          episodeId: episode.id,
          videoUrl: episode.video_url,
          title: episode.title,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Successfully migrated "${episode.title}"`);
        fetchEpisodes(); // Refresh the list
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error(`Failed to migrate "${episode.title}": ${error.message}`);
    } finally {
      setMigrating(false);
    }
  };

  const batchMigrate = async (limit: number = 10) => {
    try {
      setMigrating(true);
      setProgress(0);
      setMigrationResults([]);

      const { data, error } = await supabase.functions.invoke('batch-migrate-cloudflare', {
        body: {
          limit,
          onlyGoogleDrive: true,
        },
      });

      if (error) throw error;

      if (data.success) {
        setMigrationResults(data.results);
        setProgress(100);
        toast.success(`Batch migration complete: ${data.migrated} succeeded, ${data.failed} failed`);
        fetchEpisodes(); // Refresh the list
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Batch migration error:', error);
      toast.error(`Batch migration failed: ${error.message}`);
    } finally {
      setMigrating(false);
    }
  };

  const nonMigratedEpisodes = episodes.filter(ep => !ep.migrated_to_cloudflare);
  const migratedEpisodes = episodes.filter(ep => ep.migrated_to_cloudflare);
  const googleDriveEpisodes = nonMigratedEpisodes.filter(ep => 
    ep.video_url.includes('drive.google.com')
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cloudflare Stream Migration</h1>
        <p className="text-muted-foreground">
          Migrate your videos from Google Drive to Cloudflare Stream for better performance and reliability.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Episodes</p>
                <p className="text-2xl font-bold">{episodes.length}</p>
              </div>
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Migrated</p>
                <p className="text-2xl font-bold text-green-600">{migratedEpisodes.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{nonMigratedEpisodes.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Google Drive</p>
                <p className="text-2xl font-bold text-blue-600">{googleDriveEpisodes.length}</p>
              </div>
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Migration Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Batch Migration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => batchMigrate(5)}
                disabled={migrating || googleDriveEpisodes.length === 0}
                variant="outline"
              >
                {migrating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                Migrate 5 Episodes
              </Button>
              <Button
                onClick={() => batchMigrate(10)}
                disabled={migrating || googleDriveEpisodes.length === 0}
                variant="outline"
              >
                {migrating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                Migrate 10 Episodes
              </Button>
              <Button
                onClick={() => batchMigrate(25)}
                disabled={migrating || googleDriveEpisodes.length === 0}
              >
                {migrating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                Migrate 25 Episodes
              </Button>
            </div>

            {migrating && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Migration in progress... This may take several minutes.
                </p>
              </div>
            )}

            {migrationResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recent Migration Results:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {migrationResults.map((result, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {result.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span>{result.title}</span>
                      {result.error && (
                        <span className="text-red-500 text-xs">({result.error})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Episodes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Non-Migrated Episodes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pending Migration
              <Badge variant="secondary">{nonMigratedEpisodes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {nonMigratedEpisodes.map((episode) => (
                <div key={episode.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{episode.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {episode.video_url.includes('drive.google.com') ? (
                        <Badge variant="outline" className="text-xs">Google Drive</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Other</Badge>
                      )}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => migrateSingleEpisode(episode)}
                    disabled={migrating}
                    variant="outline"
                  >
                    {migrating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Migrate'}
                  </Button>
                </div>
              ))}
              {nonMigratedEpisodes.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  All episodes have been migrated! 🎉
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Migrated Episodes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Migrated to Cloudflare
              <Badge variant="default" className="bg-green-500">{migratedEpisodes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {migratedEpisodes.map((episode) => (
                <div key={episode.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{episode.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      <Badge variant="default" className="text-xs bg-green-500">
                        Cloudflare Stream
                      </Badge>
                      {episode.cloudflare_video_id && (
                        <span className="ml-2 text-xs font-mono">
                          {episode.cloudflare_video_id}
                        </span>
                      )}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ))}
              {migratedEpisodes.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No episodes migrated yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MigrationPage;