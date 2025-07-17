
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUserData } from '@/contexts/UserDataContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Gift, 
  Trophy, 
  Star, 
  Coins,
  Target,
  Calendar,
  Users,
  Leaf,
  Crown,
  CheckCircle,
  Clock,
  Zap,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useNotificationHelperNew } from '../hooks/useNotificationHelperNew';

const RewardsSystem = () => {
  const { userStats, redeemReward, addPoints } = useUserData();
  const { toast } = useToast();
  const { addRewardNotification } = useNotificationHelperNew();

  // Dynamic achievements based on actual user data
  const achievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first product scan',
      points: 50,
      unlocked: userStats.totalScans >= 1,
      icon: Target,
      color: 'bg-emerald-500',
      category: 'Getting Started'
    },
    {
      id: 2,
      name: 'Eco Explorer',
      description: `Scan ${userStats.totalScans >= 10 ? '25' : '10'} products`,
      points: userStats.totalScans >= 10 ? 200 : 100,
      unlocked: userStats.totalScans >= (userStats.totalScans >= 10 ? 25 : 10),
      progress: userStats.totalScans >= 10 ? 
        Math.min((userStats.totalScans / 25) * 100, 100) : 
        Math.min((userStats.totalScans / 10) * 100, 100),
      icon: Users,
      color: 'bg-blue-500',
      category: 'Scanning'
    },
    {
      id: 3,
      name: 'Carbon Tracker',
      description: `Track ${userStats.co2Saved >= 5 ? '15kg' : '5kg'} of CO₂ savings`,
      points: userStats.co2Saved >= 5 ? 300 : 200,
      unlocked: userStats.co2Saved >= (userStats.co2Saved >= 5 ? 15 : 5),
      progress: userStats.co2Saved >= 5 ? 
        Math.min((userStats.co2Saved / 15) * 100, 100) : 
        Math.min((userStats.co2Saved / 5) * 100, 100),
      icon: Leaf,
      color: 'bg-green-500',
      category: 'Environmental Impact'
    },
    {
      id: 4,
      name: 'Learning Champion',
      description: `Complete ${userStats.coursesCompleted >= 5 ? '10' : '5'} courses`,
      points: userStats.coursesCompleted >= 5 ? 400 : 250,
      unlocked: userStats.coursesCompleted >= (userStats.coursesCompleted >= 5 ? 10 : 5),
      progress: userStats.coursesCompleted >= 5 ? 
        Math.min((userStats.coursesCompleted / 10) * 100, 100) : 
        Math.min((userStats.coursesCompleted / 5) * 100, 100),
      icon: Crown,
      color: 'bg-purple-500',
      category: 'Education'
    },
    {
      id: 5,
      name: 'Community Helper',
      description: `Help ${userStats.communityHelpCount >= 5 ? '15' : '5'} community members`,
      points: userStats.communityHelpCount >= 5 ? 350 : 200,
      unlocked: userStats.communityHelpCount >= (userStats.communityHelpCount >= 5 ? 15 : 5),
      progress: userStats.communityHelpCount >= 5 ? 
        Math.min((userStats.communityHelpCount / 15) * 100, 100) : 
        Math.min((userStats.communityHelpCount / 5) * 100, 100),
      icon: Users,
      color: 'bg-indigo-500',
      category: 'Community'
    },
    {
      id: 6,
      name: 'Recipe Explorer',
      description: `Try ${userStats.recipesViewed >= 10 ? '25' : '10'} sustainable recipes`,
      points: userStats.recipesViewed >= 10 ? 300 : 150,
      unlocked: userStats.recipesViewed >= (userStats.recipesViewed >= 10 ? 25 : 10),
      progress: userStats.recipesViewed >= 10 ? 
        Math.min((userStats.recipesViewed / 25) * 100, 100) : 
        Math.min((userStats.recipesViewed / 10) * 100, 100),
      icon: Sparkles,
      color: 'bg-pink-500',
      category: 'Lifestyle'
    },
    {
      id: 7,
      name: 'Transport Pioneer',
      description: `Use sustainable transport ${userStats.transportTrips >= 5 ? '20' : '5'} times`,
      points: userStats.transportTrips >= 5 ? 400 : 200,
      unlocked: userStats.transportTrips >= (userStats.transportTrips >= 5 ? 20 : 5),
      progress: userStats.transportTrips >= 5 ? 
        Math.min((userStats.transportTrips / 20) * 100, 100) : 
        Math.min((userStats.transportTrips / 5) * 100, 100),
      icon: Zap,
      color: 'bg-cyan-500',
      category: 'Transport'
    },
    {
      id: 8,
      name: 'Sustainable Investor',
      description: `Make ${userStats.investmentsMade >= 1 ? '5' : '1'} sustainable investments`,
      points: userStats.investmentsMade >= 1 ? 600 : 300,
      unlocked: userStats.investmentsMade >= (userStats.investmentsMade >= 1 ? 5 : 1),
      progress: userStats.investmentsMade >= 1 ? 
        Math.min((userStats.investmentsMade / 5) * 100, 100) : 
        Math.min((userStats.investmentsMade / 1) * 100, 100),
      icon: Crown,
      color: 'bg-amber-500',
      category: 'Investment'
    }
  ];

  // User-specific rewards based on actual points and activity
  const rewards = [
    {
      id: 1,
      name: '10% Off Eco Products',
      cost: 150,
      description: 'Discount on sustainable marketplace purchases',
      type: 'discount',
      icon: Gift,
      available: userStats.totalPoints >= 150,
      category: 'Shopping',
      savings: 'Up to $50 value'
    },
    {
      id: 2,
      name: 'Plant a Tree',
      cost: 300,
      description: 'We plant a tree in your name through our partners',
      type: 'impact',
      icon: Leaf,
      available: userStats.totalPoints >= 300,
      category: 'Environmental Impact',
      savings: '1 tree planted'
    },
    {
      id: 3,
      name: 'Premium Analytics',
      cost: 500,
      description: '1 month of advanced insights and tracking',
      type: 'feature',
      icon: Star,
      available: userStats.totalPoints >= 500,
      category: 'Features',
      savings: '$9.99 value'
    },
    {
      id: 4,
      name: 'Sustainability Consultation',
      cost: 750,
      description: '30-minute call with sustainability expert',
      type: 'service',
      icon: Users,
      available: userStats.totalPoints >= 750,
      category: 'Expert Advice',
      savings: '$75 value'
    },
    {
      id: 5,
      name: 'Carbon Offset Package',
      cost: 1000,
      description: 'Offset 1 ton of your carbon footprint',
      type: 'impact',
      icon: Zap,
      available: userStats.totalPoints >= 1000,
      category: 'Carbon Offset',
      savings: '1 ton CO₂ offset'
    },
    {
      id: 6,
      name: 'Eco Product Bundle',
      cost: 1250,
      description: 'Curated bundle of top-rated sustainable products',
      type: 'product',
      icon: ShoppingBag,
      available: userStats.totalPoints >= 1250,
      category: 'Product Bundle',
      savings: '$150 value'
    }
  ];

  // Real daily challenges based on user's actual behavior
  const generateDailyChallenges = () => {
    const challenges = [];
    
    // Scanning challenge based on user's average
    const avgScansPerDay = Math.max(1, Math.ceil(userStats.totalScans / 30)); // Assuming 30 days
    const scanningTarget = Math.max(1, avgScansPerDay);
    challenges.push({
      task: `Scan ${scanningTarget} sustainable product${scanningTarget > 1 ? 's' : ''}`,
      progress: Math.min(userStats.currentWeekScans, scanningTarget),
      total: scanningTarget,
      points: scanningTarget * 15,
      completed: userStats.currentWeekScans >= scanningTarget,
      category: 'Scanning'
    });
    
    // Carbon tracking challenge
    const carbonTarget = Math.max(1, Math.ceil(userStats.co2Saved / 10));
    challenges.push({
      task: `Save ${carbonTarget}kg CO₂ today`,
      progress: userStats.co2Saved >= carbonTarget ? carbonTarget : userStats.co2Saved % carbonTarget || 0,
      total: carbonTarget,
      points: carbonTarget * 20,
      completed: (userStats.co2Saved % 10) >= carbonTarget,
      category: 'Carbon Tracking'
    });
    
    // Learning challenge
    if (userStats.coursesCompleted < 10) {
      challenges.push({
        task: 'Complete 1 sustainability course',
        progress: userStats.coursesCompleted > 0 ? 1 : 0,
        total: 1,
        points: 50,
        completed: userStats.coursesCompleted > 0,
        category: 'Learning'
      });
    }
    
    // Community challenge
    challenges.push({
      task: 'Help 1 community member',
      progress: userStats.communityHelpCount > 0 ? 1 : 0,
      total: 1,
      points: 30,
      completed: userStats.communityHelpCount > 0,
      category: 'Community'
    });
    
    return challenges;
  };

  const dailyChallenges = generateDailyChallenges();

  const handleRedeemReward = (reward: typeof rewards[0]) => {
    if (redeemReward(reward.cost)) {
      toast({
        title: "Reward Redeemed! 🎉",
        description: `You've successfully redeemed: ${reward.name}. Check your email for details.`,
        duration: 5000,
      });
      addRewardNotification(reward.name);
    } else {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.cost - userStats.totalPoints} more points to redeem this reward.`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const getUnlockedAchievements = () => achievements.filter(a => a.unlocked).length;
  const getCompletedChallenges = () => dailyChallenges.filter(c => c.completed).length;

  // Calculate actual level progression
  const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];
  const currentLevel = levelThresholds.findIndex((threshold, index) => 
    userStats.totalPoints >= threshold && (levelThresholds[index + 1] === undefined || userStats.totalPoints < levelThresholds[index + 1])
  ) + 1;
  
  const currentLevelThreshold = levelThresholds[currentLevel - 1] || 0;
  const nextLevelThreshold = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
  const levelProgress = nextLevelThreshold ? ((userStats.totalPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* User-Specific Points Overview */}
      <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">{userStats.totalPoints.toLocaleString()} Points</h2>
              <div className="flex items-center space-x-4 text-emerald-100">
                <span>Level {currentLevel}</span>
                <span>•</span>
                <span>{getUnlockedAchievements()}/{achievements.length} achievements</span>
                <span>•</span>
                <span>{getCompletedChallenges()}/{dailyChallenges.length} challenges today</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <Coins className="w-8 h-8 mx-auto mb-1" />
                <div className="text-xs">Points</div>
              </div>
              <div className="text-center">
                <Trophy className="w-8 h-8 mx-auto mb-1" />
                <div className="text-xs">Level {currentLevel}</div>
              </div>
            </div>
          </div>
          
          {/* Real Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {currentLevel + 1}</span>
              <span>{nextLevelThreshold ? `${nextLevelThreshold - userStats.totalPoints} points to go` : 'Max Level!'}</span>
            </div>
            <Progress 
              value={levelProgress} 
              className="h-3 bg-emerald-400"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User-Specific Daily Challenges */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-green-700">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Today's Challenges</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                {getCompletedChallenges()}/{dailyChallenges.length} Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dailyChallenges.map((challenge, index) => (
              <div key={index} className={`rounded-lg p-4 transition-all duration-200 ${
                challenge.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {challenge.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                    <span className={`font-medium ${challenge.completed ? 'text-green-800' : 'text-gray-700'}`}>
                      {challenge.task}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={`text-xs ${
                      challenge.completed ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {challenge.category}
                    </Badge>
                    <Badge variant={challenge.completed ? "default" : "secondary"} className="bg-emerald-100 text-emerald-700">
                      +{challenge.points}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(challenge.progress / challenge.total) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-green-600 font-medium">
                    {challenge.progress}/{challenge.total}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* User-Specific Achievements */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <Trophy className="w-5 h-5" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`p-4 rounded-lg border transition-all duration-200 ${
                achievement.unlocked 
                  ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${achievement.color} rounded-xl flex items-center justify-center ${
                    !achievement.unlocked && 'opacity-50'
                  } shadow-md`}>
                    <achievement.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${
                        achievement.unlocked ? 'text-green-800' : 'text-gray-500'
                      }`}>
                        {achievement.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {achievement.category}
                      </Badge>
                    </div>
                    <p className={`text-sm ${
                      achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <div className="mt-2">
                        <Progress value={achievement.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                  <Badge variant={achievement.unlocked ? "default" : "secondary"} className="bg-emerald-100 text-emerald-700">
                    +{achievement.points}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* User-Specific Rewards Store */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-green-700">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5" />
              <span>Rewards Store</span>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
              {rewards.filter(r => r.available).length} Available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userStats.totalPoints < 150 ? (
            <div className="text-center py-12">
              <Gift className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-600 mb-3">Start earning rewards!</h3>
              <p className="text-gray-500 mb-4">Complete challenges and track your sustainability journey to unlock amazing rewards.</p>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700">
                  <strong>Next reward unlocks at 150 points!</strong> You need {150 - userStats.totalPoints} more points.
                </p>
                <div className="mt-3">
                  <Progress value={(userStats.totalPoints / 150) * 100} className="h-2" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <div key={reward.id} className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                  reward.available 
                    ? 'bg-white border-green-200 hover:border-green-300' 
                    : 'bg-gray-50 border-gray-200 opacity-75'
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md`}>
                      <reward.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800">{reward.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {reward.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-green-600 mb-3">{reward.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-green-500 font-medium">
                      {reward.savings}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-green-800">{reward.cost}</span>
                    </div>
                    <Button 
                      size="sm" 
                      disabled={!reward.available || userStats.totalPoints < reward.cost}
                      className={`${
                        reward.available && userStats.totalPoints >= reward.cost
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                          : 'bg-gray-300'
                      }`}
                      onClick={() => handleRedeemReward(reward)}
                    >
                      {userStats.totalPoints >= reward.cost ? 'Redeem' : `Need ${reward.cost - userStats.totalPoints}`}
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
