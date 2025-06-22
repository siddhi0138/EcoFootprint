import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Users, 
  Globe, 
  TreePine,
  Droplets,
  Wind,
  Share2,
  Trophy,
  Target,
  TrendingUp
} from 'lucide-react';

import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot, collection, query } from 'firebase/firestore';

interface UserImpactStats {
  treesPlanted: number;
  waterSaved: number;
  carbonOffset: number;
  communitiesHelped: number;
  // Add any other user-specific impact stats here
}

interface GlobalImpactStats {
  totalUsers: number;
  treesPlanted: number;
  waterSaved: number;
  carbonOffset: number;
  communitiesHelped: number;
}

const SocialImpactHub = () => {
  const { user } = useAuth();
  const [selectedCause, setSelectedCause] = useState('forest');
  const [userImpactStats, setUserImpactStats] = useState<UserImpactStats | null>(null);
  const [globalImpactStats, setGlobalImpactStats] = useState<GlobalImpactStats>({ totalUsers: 0, treesPlanted: 0, waterSaved: 0, carbonOffset: 0, communitiesHelped: 0 });

  // Mock achievements based on user stats (will be calculated from Firebase data)
  const causes = [
    {
      id: 'forest',
      name: 'Forest Restoration',
      icon: TreePine,
      description: 'Plant trees and restore degraded forests worldwide',
      progress: 78,
      goal: 100000,
      current: 78432,
      impact: 'Every scan = 1 tree planted',
      color: 'bg-green-500'
    },
    {
      id: 'water',
      name: 'Clean Water Access',
      icon: Droplets,
      description: 'Provide clean water access to communities in need',
      progress: 65,
      goal: 50000,
      current: 32500,
      impact: 'Every 10 scans = 1 day of clean water',
      color: 'bg-blue-500'
    },
    {
      id: 'air',
      name: 'Air Quality Improvement',
      icon: Wind,
      description: 'Support projects that improve air quality in cities',
      progress: 42,
      goal: 25000,
      current: 10500,
      impact: 'Every 5 scans = 1kg CO₂ offset',
      color: 'bg-purple-500'
    }
  ];

  // Fetch user-specific impact stats
  useEffect(() => {
    if (!user) {
      setUserImpactStats(null);
      return;
    }

    const userImpactRef = doc(db, 'users', user.uid, 'impactStats', 'summary');
    const unsubscribeUserImpact = onSnapshot(userImpactRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserImpactStats(docSnap.data() as UserImpactStats);
      } else {
        setUserImpactStats({ treesPlanted: 0, waterSaved: 0, carbonOffset: 0, communitiesHelped: 0 });
      }
    }, (error) => {
      console.error("Error fetching user impact stats:", error);
      setUserImpactStats({ treesPlanted: 0, waterSaved: 0, carbonOffset: 0, communitiesHelped: 0 }); // Fallback
    });

    // Fetch global impact stats (assuming a 'globalImpact' document/collection)
    const globalImpactRef = doc(db, 'global', 'impact'); // Example path
    const unsubscribeGlobalImpact = onSnapshot(globalImpactRef, (docSnap) => {
      if (docSnap.exists()) {
        setGlobalImpactStats(docSnap.data() as GlobalImpactStats);
      } else {
        setGlobalImpactStats({ totalUsers: 0, treesPlanted: 0, waterSaved: 0, carbonOffset: 0, communitiesHelped: 0 });
      }
    }, (error) => {
      console.error("Error fetching global impact stats:", error);
    });

    return () => {
      unsubscribeUserImpact();
      unsubscribeGlobalImpact();
    };
  }, [user]);

  const achievements = [
    {
      title: 'Tree Planter',
      description: 'Planted 100+ trees',
      icon: TreePine,
      unlocked: true,
      rarity: 'common'
    },
    {
      title: 'Carbon Hero',
      description: 'Offset 50kg+ CO₂',
      icon: Wind,
      unlocked: userImpactStats ? userImpactStats.carbonOffset >= 50 : false,
      rarity: 'epic'
    },
     {
      title: 'Water Guardian',
      description: 'Saved 1000L+ water',
      icon: Droplets,
      unlocked: userImpactStats ? userImpactStats.waterSaved >= 1000 : false,
      rarity: 'rare'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <Heart className="w-6 h-6" />
            <span>Social Impact Hub</span>
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
              Community Driven
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Global Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 rounded-xl p-4 text-center">
              {globalImpactStats ? (
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              ) : <Skeleton className="w-6 h-6 mx-auto mb-2 bg-gray-300" />}
              <div className="text-2xl font-bold text-gray-800">
                {globalImpactStats ? globalImpactStats.totalUsers.toLocaleString() : <Skeleton className="w-16 h-6 mx-auto bg-gray-300" />}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 text-center">
              {globalImpactStats ? (
                <TreePine className="w-6 h-6 mx-auto mb-2 text-green-600" />
              ) : <Skeleton className="w-6 h-6 mx-auto mb-2 bg-gray-300" />}
              <div className="text-2xl font-bold text-gray-800">
                {globalImpactStats ? globalImpactStats.treesPlanted.toLocaleString() : <Skeleton className="w-16 h-6 mx-auto bg-gray-300" />}
              </div>
              <div className="text-sm text-gray-600">Trees Planted</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 text-center">
              {globalImpactStats ? (
                <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              ) : <Skeleton className="w-6 h-6 mx-auto mb-2 bg-gray-300" />}
              <div className="text-2xl font-bold text-gray-800">
                {globalImpactStats ? `${Math.round(globalImpactStats.waterSaved / 1000)}K` : <Skeleton className="w-16 h-6 mx-auto bg-gray-300" />}
                </div>
              <div className="text-sm text-gray-600">Liters Saved</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 text-center">
              {globalImpactStats ? (
                <Wind className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              ) : <Skeleton className="w-6 h-6 mx-auto mb-2 bg-gray-300" />}
              <div className="text-2xl font-bold text-gray-800">{globalImpactStats ? globalImpactStats.carbonOffset.toLocaleString() : <Skeleton className="w-16 h-6 mx-auto bg-gray-300" />}</div>
              <div className="text-sm text-gray-600">kg CO₂ Offset</div>
            </div>
          </div>

          {/* Active Causes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Support a Cause</h3>
            {causes.map((cause) => (
              <div key={cause.id} className="bg-white/80 rounded-xl p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${cause.color} rounded-xl flex items-center justify-center`}>
                      <cause.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{cause.name}</h4>
                      <p className="text-sm text-gray-600">{cause.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {cause.progress}% Complete
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{cause.current.toLocaleString()} / {cause.goal.toLocaleString()}</span>
                    <span className="text-green-600 font-medium">{cause.impact}</span>
                  </div>
                  <Progress value={cause.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                  <Button size="sm" className={`${cause.color} hover:opacity-90 text-white`}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Impact
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Your Achievements */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Impact Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                 <div
                    key={index}
                    className={`bg-white/80 rounded-xl p-4 border ${achievement.unlocked ? 'border-green-200' : 'border-gray-200'} ${
                      !achievement.unlocked && (!user ? 'opacity-30' : 'opacity-60') // Further reduce opacity if not logged in
                    }`}
                  >
                   {!user && (
                      <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center">
                         <span className="text-white font-bold text-sm">Log in to see</span>
                      </div>
                   )}


                  <div className="flex items-center space-x-3 mb-2">
                    <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <h4 className="font-medium text-gray-800">{achievement.title}</h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  <Badge variant={achievement.unlocked ? "default" : "secondary"} className="text-xs">
                    {user ? (achievement.unlocked ? 'Unlocked' : 'Locked') : 'Locked'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialImpactHub;
