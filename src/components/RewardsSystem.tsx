
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gift, 
  Trophy, 
  Star, 
  Coins,
  Target,
  Calendar,
  Users,
  Leaf,
  Zap,
  Crown
} from 'lucide-react';

const RewardsSystem = () => {
  const userPoints = 2847;
  const nextRewardThreshold = 3000;
  const currentLevel = 7;

  const achievements = [
    {
      id: 1,
      name: 'Eco Pioneer',
      description: 'Scanned 100 products',
      points: 500,
      unlocked: true,
      icon: Target,
      color: 'bg-emerald-500'
    },
    {
      id: 2,
      name: 'Green Influencer',
      description: 'Shared 50 sustainable tips',
      points: 750,
      unlocked: true,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      id: 3,
      name: 'Carbon Crusher',
      description: 'Reduced CO₂ by 100kg',
      points: 1000,
      unlocked: false,
      progress: 78,
      icon: Leaf,
      color: 'bg-green-500'
    },
    {
      id: 4,
      name: 'Sustainability Sage',
      description: 'Maintain 30-day streak',
      points: 1500,
      unlocked: false,
      progress: 60,
      icon: Crown,
      color: 'bg-purple-500'
    }
  ];

  const rewards = [
    {
      id: 1,
      name: '10% Off Eco Products',
      cost: 500,
      description: 'Discount on sustainable marketplace',
      type: 'discount',
      icon: Gift,
      available: true
    },
    {
      id: 2,
      name: 'Plant a Tree',
      cost: 1000,
      description: 'We plant a tree in your name',
      type: 'impact',
      icon: Leaf,
      available: true
    },
    {
      id: 3,
      name: 'Premium Features',
      cost: 2000,
      description: '3 months of advanced analytics',
      type: 'feature',
      icon: Star,
      available: true
    },
    {
      id: 4,
      name: 'Eco Consultation',
      cost: 3500,
      description: '1-hour sustainability expert call',
      type: 'service',
      icon: Users,
      available: false
    }
  ];

  const dailyChallenges = [
    {
      task: 'Scan 3 eco-friendly products',
      progress: 2,
      total: 3,
      points: 50,
      completed: false
    },
    {
      task: 'Share a sustainability tip',
      progress: 1,
      total: 1,
      points: 25,
      completed: true
    },
    {
      task: 'Compare 2 products',
      progress: 0,
      total: 2,
      points: 30,
      completed: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card className="bg-gradient-to-r from-emerald-500 to-sage-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{userPoints.toLocaleString()} Points</h2>
              <p className="text-emerald-100">Level {currentLevel} • Eco Champion</p>
            </div>
            <div className="flex items-center space-x-2">
              <Coins className="w-8 h-8" />
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next reward</span>
              <span>{nextRewardThreshold - userPoints} points to go</span>
            </div>
            <Progress 
              value={(userPoints / nextRewardThreshold) * 100} 
              className="h-2 bg-emerald-400"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Challenges */}
        <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sage-700">
              <Calendar className="w-5 h-5" />
              <span>Daily Challenges</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dailyChallenges.map((challenge, index) => (
              <div key={index} className="bg-sage-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sage-800">{challenge.task}</span>
                  <Badge variant={challenge.completed ? "default" : "secondary"} className="bg-emerald-100 text-emerald-700">
                    +{challenge.points}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(challenge.progress / challenge.total) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-sage-600">
                    {challenge.progress}/{challenge.total}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sage-700">
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
                    <h3 className={`font-semibold ${achievement.unlocked ? 'text-sage-800' : 'text-gray-500'}`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-sm ${achievement.unlocked ? 'text-sage-600' : 'text-gray-400'}`}>
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && achievement.progress && (
                      <Progress value={achievement.progress} className="h-1 mt-2" />
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

      {/* Rewards Store */}
      <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sage-700">
            <Gift className="w-5 h-5" />
            <span>Rewards Store</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className={`p-6 rounded-xl border ${reward.available ? 'bg-white border-sage-200' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r from-sage-500 to-emerald-500 rounded-xl flex items-center justify-center`}>
                    <reward.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sage-800">{reward.name}</h3>
                    <p className="text-sm text-sage-600">{reward.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-sage-800">{reward.cost}</span>
                  </div>
                  <Button 
                    size="sm" 
                    disabled={!reward.available || userPoints < reward.cost}
                    className="bg-gradient-to-r from-sage-600 to-emerald-600 hover:from-sage-700 hover:to-emerald-700"
                  >
                    {userPoints >= reward.cost ? 'Redeem' : 'Not Enough Points'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsSystem;
