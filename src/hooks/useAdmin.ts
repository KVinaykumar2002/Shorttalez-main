import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsModerator(false);
      setLoading(false);
      return;
    }

    const checkAdminStatus = async () => {
      try {
        // Check if user is admin
        const { data: adminCheck } = await supabase
          .rpc('has_current_role', { _role: 'admin' });
        
        // Check if user is moderator
        const { data: moderatorCheck } = await supabase
          .rpc('has_current_role', { _role: 'moderator' });

        setIsAdmin(adminCheck || false);
        setIsModerator(moderatorCheck || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setIsModerator(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const bootstrapAdmin = async () => {
    try {
      const { data } = await supabase.rpc('bootstrap_admin');
      const result = data as any;
      if (result?.success) {
        setIsAdmin(true);
        return { success: true, message: result.message };
      }
      return { success: false, message: result?.message || 'Failed to bootstrap admin' };
    } catch (error) {
      console.error('Error bootstrapping admin:', error);
      return { success: false, message: 'Error bootstrapping admin' };
    }
  };

  return {
    isAdmin,
    isModerator,
    isStaff: isAdmin || isModerator,
    loading,
    bootstrapAdmin
  };
};

export const useAdminStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      // Fetch user counts
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch series counts
      const { count: seriesCount } = await supabase
        .from('series')
        .select('*', { count: 'exact', head: true });

      // Fetch episode counts
      const { count: episodeCount } = await supabase
        .from('episodes')
        .select('*', { count: 'exact', head: true });

      // Fetch pending episodes
      const { count: pendingEpisodes } = await supabase
        .from('episodes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        userCount: userCount || 0,
        seriesCount: seriesCount || 0,
        episodeCount: episodeCount || 0,
        pendingEpisodes: pendingEpisodes || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  return { stats, loading, refetch: fetchAdminStats };
};