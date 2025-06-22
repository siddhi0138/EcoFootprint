
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  Gift, 
  Trophy,
  Star, 
  Coins,
  Target,
  Calendar,
  Users,
  Leaf,
  Crown
} from 'lucide-react';

import { doc, onSnapshot, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

interface UserRewardsData {
  totalPoints: number;
  level: number;
  unlockedAchievements: number[];
  redeemedRewards: number[];
  // Add other relevant stats like totalScans, co2Saved if needed for achievements/challenges
}

const RewardsSystem = () => {
  const { userStats } = useUserData();
  const { user } = useAuth();
  const [userRewards, setUserRewards] = useState<UserRewardsData>({
    totalPoints: 0,
    level: 1,
    unlockedAchievements: [],
    redeemedRewards: [],
  });

  // Mocked user stats for achievement/challenge progress (replace with actual data fetching if available)
  const [mockUserStats, setMockUserStats] = useState({ 
    totalScans: 15, // Example data
    co2Saved: 8, // Example data (in kg)
    currentWeekScans: 4, // Example data
  });
  const nextRewardThreshold = 1000;

  const achievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first scan',
      points: 50,
      unlocked: mockUserStats.totalScans >= 1,
      icon: Target,
      color: 'bg-emerald-500'
    },
    {
      id: 2,
      name: 'Eco Explorer',
      description: 'Scan 15 products',
      points: 100,
      unlocked: mockUserStats.totalScans >= 15,
      progress: Math.min((mockUserStats.totalScans / 15) * 100, 100),
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      id: 3,
      name: 'Carbon Tracker',
      description: 'Track 8kg of CO₂',
      points: 200,
      unlocked: mockUserStats.co2Saved >= 8,
      progress: Math.min((mockUserStats.co2Saved / 8) * 100, 100),
      icon: Leaf,
      color: 'bg-green-500'
    },
    {
      id: 4,
      name: 'Sustainability Champion',
      description: 'Reach 500 points',
      points: 500,
      unlocked: userRewards.totalPoints >= 500,
      progress: Math.min((userRewards.totalPoints / 500) * 100, 100),
      icon: Crown,
      color: 'bg-purple-500'
    }
  ];

  // Filter achievements to check for unlocked based on current userRewards
  const unlockedAchievements = achievements.filter(a => userRewards.unlockedAchievements.includes(a.id));

  const rewards = [
    {
      id: 1,
      name: '5% Off Eco Products',
      cost: 100,
      description: 'Discount on sustainable marketplace',
      type: 'discount',
      icon: Gift,
      available: true
    },
    {
      id: 2,
      name: 'Plant a Tree',
      cost: 250,
      description: 'We plant a tree in your name',
      type: 'impact',
      icon: Leaf,
      available: true
    },
    {
      id: 3,
      name: 'Premium Features',
      cost: 500,
      description: '1 month of advanced analytics',
      type: 'feature',
      icon: Star,
      available: true
    },
    {
      id: 4,
      name: 'Eco Consultation',
      cost: 1000,
      description: '30-min sustainability expert call',
      type: 'service',
      icon: Users,
      available: userRewards.totalPoints >= 1000 // Check availability based on Firebase points
    }
  ];

  const dailyChallenges = [
    {
      task: 'Scan 3 eco-friendly products',
      progress: Math.min(mockUserStats.currentWeekScans, 3),
      total: 3,
      points: 50,
      completed: mockUserStats.currentWeekScans >= 3
    },
    {
      task: 'Track carbon emission',
      progress: mockUserStats.co2Saved > 0 ? 1 : 0,
      total: 1,
      points: 25,
      completed: mockUserStats.co2Saved > 0
    },
    {
      task: 'Earn 100 points',
      progress: Math.min(userRewards.totalPoints, 100), // Check progress based on Firebase points
      total: 100,
      points: 30,
      completed: userRewards.totalPoints >= 100 // Check completion based on Firebase points
    }
  ];

  // Fetch user's rewards data from Firebase
  useEffect(() => {
    if (!user) {
      setUserRewards({ 
        totalPoints: 0,
        level: 1,
        unlockedAchievements: [],
        redeemedRewards: [],
      });
      return;
    }

    const userRewardsRef = doc(db, 'users', user.uid, 'rewards', 'data');
    const unsubscribeRewards = onSnapshot(userRewardsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserRewardsData;
        setUserRewards(data);
      } else {
        // Initialize if no data exists
        setDoc(userRewardsRef, {
          totalPoints: 0,
          level: 1,
          unlockedAchievements: [],
          redeemedRewards: [],
        }).catch(error => console.error("Error initializing user rewards data:", error));
      }
    }, (error) => {
      console.error('Error fetching user rewards data:', error);
    });

    return () => unsubscribeRewards();
  }, [user]);

  const handleRedeemReward = async (reward: typeof rewards[0]) => {
    if (!user) return;

    const userRewardsRef = doc(db, 'users', user.uid, 'rewards', 'data');

    // Check if user has enough points and reward is available and not already redeemed
    if (userRewards.totalPoints >= reward.cost && reward.available && !userRewards.redeemedRewards.includes(reward.id)) {
      await updateDoc(userRewardsRef, {
        totalPoints: increment(-reward.cost),
        redeemedRewards: arrayUnion(reward.id),
      });
      console.log(`Redeemed: ${reward.name}`);
      // Here you could add toast notification or other feedback
    }
  };

  const getUnlockedAchievements = () => achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{userRewards.totalPoints.toLocaleString()} Points</h2>
              <p className="text-emerald-100">Level {userRewards.level} • {unlockedAchievements.length} achievements unlocked</p>
            </div>
            <div className="flex items-center space-x-2">
              <Coins className="w-8 h-8" />
              <Trophy className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to premium rewards</span>
              <span>{Math.max(nextRewardThreshold - userRewards.totalPoints, 0)} points to go</span>
            </div>
            <Progress
              value={Math.min((userStats.totalPoints / nextRewardThreshold) * 100, 100)} 
              className="h-2 bg-emerald-400"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Challenges */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <Calendar className="w-5 h-5" />
              <span>Daily Challenges</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dailyChallenges.map((challenge, index) => (
              <div key={index} className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800">{challenge.task}</span>
                  <Badge variant={challenge.completed ? "outline" : "secondary"} className={`${challenge.completed ? 'border-emerald-500 text-emerald-800 bg-emerald-100' : 'bg-gray-100 text-gray-600'}`}>
                    +{challenge.points}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={challenge.completed ? 100 : (challenge.progress / challenge.total) * 100}
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-green-600">
                    {challenge.progress}/{challenge.total}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <Trophy className="w-5 h-5" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`p-4 rounded-lg border ${achievement.unlocked ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${achievement.color} rounded-xl flex items-center justify-center ${!achievement.unlocked && 'opacity-50'}`}>
                    <achievement.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${achievement.unlocked ? 'text-green-800' : 'text-gray-500'}`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-sm ${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <Progress value={achievement.progress} className="h-1 mt-2" />
                    )}
                  </div>
                  <Badge variant={achievement.unlocked ? "outline" : "secondary"} className={`${achievement.unlocked ? 'border-emerald-500 text-emerald-800 bg-emerald-100' : 'bg-gray-100 text-gray-600'}`}>
                    +{achievement.points}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Rewards Store */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <Gift className="w-5 h-5" />
            <span>Rewards Store</span> 
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userStats.totalPoints < 100 ? (
            <div className="text-center py-8">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Start earning rewards!</h3>
              <p className="text-gray-500">Complete challenges and track your carbon footprint to earn points and unlock rewards.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <div key={reward.id} className={`p-6 rounded-xl border ${reward.available ? 'bg-white border-green-200' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center`}>
                      <reward.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">{reward.name}</h3>
                      <p className="text-sm text-green-600">{reward.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-green-800">{reward.cost}</span>
                    </div>
                    <Button
                      size="sm"
                      disabled={!reward.available || userRewards.totalPoints < reward.cost || userRewards.redeemedRewards.includes(reward.id)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      onClick={() => handleRedeemReward(reward)}
                    >
                      {userStats.totalPoints >= reward.cost ? 'Redeem' : 'Need More Points'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsSystem;
