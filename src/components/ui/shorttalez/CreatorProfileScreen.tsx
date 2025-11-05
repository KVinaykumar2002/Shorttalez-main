import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Share, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface CreatorProfileScreenProps {
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isVerified: boolean;
    bio: string;
    likes: number;
    followers: number;
    following: number;
  };
  videos: Array<{
    id: string;
    thumbnail: string;
    views: string;
    title: string;
  }>;
}

export default function CreatorProfileScreen({ creator, videos }: CreatorProfileScreenProps) {
  const formatCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  const mockVideos = [
    { id: '1', thumbnail: 'https://picsum.photos/200/300?random=1', views: '2.5M', title: 'Amazing Dance' },
    { id: '2', thumbnail: 'https://picsum.photos/200/300?random=2', views: '8.1M', title: 'Fire Performance' },
    { id: '3', thumbnail: 'https://picsum.photos/200/300?random=3', views: '1.6M', title: 'Street Art' },
    { id: '4', thumbnail: 'https://picsum.photos/200/300?random=4', views: '956K', title: 'Urban Life' },
    { id: '5', thumbnail: 'https://picsum.photos/200/300?random=5', views: '3.2M', title: 'Night Vibes' },
    { id: '6', thumbnail: 'https://picsum.photos/200/300?random=6', views: '674K', title: 'Creative Art' },
  ];

  return (
    <div className="h-screen cheelee-gradient overflow-y-auto">
      {/* Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30">
        <h1 className="text-white text-2xl font-bold text-center">
          Create<br />top content
        </h1>
      </div>

      <div className="pt-24 px-4">
        {/* Profile Section */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-6 mx-4 mb-6 border border-white/10">
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-3 border-white/30">
                <AvatarImage src={creator.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl">
                  {creator.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white font-bold text-xl">
                    FIRE_IN_YOUR_EYES
                  </h2>
                  {creator.isVerified && (
                    <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                  <Button
                    size="sm" 
                    className="bg-transparent border border-white/30 text-white hover:bg-white/10 rounded-full p-2"
                  >
                    <Edit size={16} />
                  </Button>
                </div>
                <p className="text-white/80 text-sm">Lilu Geitman</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-transparent text-white hover:bg-white/10 p-2"
              >
                <Share size={18} />
              </Button>
              <Button
                size="sm"
                className="bg-transparent text-white hover:bg-white/10 p-2"
              >
                <MoreHorizontal size={18} />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">80.3k</div>
              <div className="text-white/60 text-sm">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">31.3k</div>
              <div className="text-white/60 text-sm">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">2.234</div>
              <div className="text-white/60 text-sm">Following</div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-white/90 text-center text-sm leading-relaxed mb-4">
            Inspire you to live a beautiful life. Dancing, travelling, the most beautiful places... 
            <span className="text-cyan-400">more</span>
          </p>
        </div>

        {/* Videos Grid */}
        <div className="px-4">
          <div className="grid grid-cols-3 gap-1">
            {mockVideos.map((video, index) => (
              <motion.div
                key={video.id}
                className="relative aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                
                {/* View Count */}
                <div className="absolute bottom-2 left-2">
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                    <div className="w-3 h-3 bg-white rounded-sm flex items-center justify-center">
                      <div className="w-0 h-0 border-l-2 border-l-black border-y-1 border-y-transparent"></div>
                    </div>
                    <span className="text-white text-xs font-bold">
                      {video.views}
                    </span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}