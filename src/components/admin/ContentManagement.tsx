import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Search, 
  Check, 
  X, 
  Eye,
  Clock,
  Play,
  MoreVertical,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Episode {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  likes: number;
  created_at: string;
  series_id: string;
  series?: {
    title: string;
    creator_id: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  episode_id: string;
  user_id: string;
  profiles?: {
    username: string;
  };
  episodes?: {
    title: string;
  };
}

export const ContentManagement: React.FC = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('episodes');
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // Fetch episodes with series info
      const { data: episodesData, error: episodesError } = await supabase
        .from('episodes')
        .select(`
          *,
          series:series_id (title, creator_id)
        `)
        .order('created_at', { ascending: false });

      if (episodesError) throw episodesError;

      // Fetch recent comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (username),
          episodes:episode_id (title)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (commentsError) throw commentsError;

      setEpisodes((episodesData as any) || []);
      setComments(commentsData || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEpisodeStatus = async (episodeId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('episodes')
        .update({ status })
        .eq('id', episodeId);

      if (error) throw error;

      setEpisodes(prev => prev.map(ep => 
        ep.id === episodeId ? { ...ep, status: status as any } : ep
      ));

      toast({
        title: "Success",
        description: `Episode ${status} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update episode status",
        variant: "destructive"
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive"
      });
    }
  };

  const filteredEpisodes = episodes.filter(episode =>
    episode.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    episode.series?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComments = comments.filter(comment =>
    comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock },
      approved: { variant: 'default' as const, icon: Check },
      rejected: { variant: 'destructive' as const, icon: X }
    };
    const config = variants[status as keyof typeof variants] || { variant: 'outline' as const, icon: Eye };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status || 'unknown'}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Content Management
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchContent} variant="outline" size="sm">
            <Video className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="episodes" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Episodes ({episodes.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="episodes">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Loading episodes...</div>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[180px]">Title</TableHead>
                        <TableHead className="min-w-[120px] hidden sm:table-cell">Series</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px] hidden md:table-cell">Stats</TableHead>
                        <TableHead className="min-w-[100px] hidden lg:table-cell">Created</TableHead>
                        <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {filteredEpisodes.map((episode) => (
                      <TableRow key={episode.id}>
                        <TableCell>
                          <div className="font-medium truncate">
                            {episode.title}
                          </div>
                          {episode.description && (
                            <div className="text-sm text-muted-foreground truncate mt-1">
                              {episode.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-sm text-muted-foreground truncate">
                            {episode.series?.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(episode.status)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span className="hidden lg:inline">{episode.views}</span>
                              <span className="lg:hidden">{episode.views > 999 ? `${Math.floor(episode.views/1000)}k` : episode.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Play className="w-4 h-4" />
                              <span className="hidden lg:inline">{episode.likes}</span>
                              <span className="lg:hidden">{episode.likes > 999 ? `${Math.floor(episode.likes/1000)}k` : episode.likes}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-sm text-muted-foreground">
                            {new Date(episode.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover shadow-lg">
                              <DropdownMenuItem 
                                onClick={() => updateEpisodeStatus(episode.id, 'approved')}
                                disabled={episode.status === 'approved'}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateEpisodeStatus(episode.id, 'rejected')}
                                disabled={episode.status === 'rejected'}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateEpisodeStatus(episode.id, 'pending')}
                                disabled={episode.status === 'pending'}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Mark Pending
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Loading comments...</div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Comment</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Episode</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell>
                          <div className="max-w-[300px]">
                            <p className="text-sm break-words">{comment.content}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            @{comment.profiles?.username}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground max-w-[150px] truncate">
                            {comment.episodes?.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteComment(comment.id)}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};