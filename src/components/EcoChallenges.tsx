
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Calendar, Users, Leaf, Zap, Recycle } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  category: string;
  points: number;
  progress: number;
  target: number;
  icon: any;
  completed: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  requirement: number;
}

const EcoChallenges = () => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements'>('challenges');

  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Plastic-Free Day',
      description: 'Avoid single-use plastics for an entire day',
      type: 'daily',
      category: 'Waste Reduction',
      points: 50,
      progress: 0,
      target: 1,
      icon: Recycle,
      completed: false
    },
    {
      id: '2',
      title: 'Carbon-Free Commute',
      description: 'Use sustainable transportation for 5 days',
      type: 'weekly',
      category: 'Transportation',
      points: 100,
      progress: 3,
      target: 5,
      icon: Leaf,
      completed: false
    },
    {
      id: '3',
      title: 'Energy Saver',
      description: 'Reduce home energy consumption by 20%',
      type: 'monthly',
      category: 'Energy',
      points: 200,
      progress: 15,
      target: 20,
      icon: Zap,
      completed: false
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Eco Warrior',
      description: 'Complete 10 environmental challenges',
      icon: '🌟',
      unlockedAt: '2024-01-15',
      progress: 10,
      requirement: 10
    },
    {
      id: '2',
      title: 'Carbon Calculator',
      description: 'Calculate your carbon footprint',
      icon: '📊',
      unlockedAt: '2024-01-20',
      progress: 1,
      requirement: 1
    },
    {
      id: '3',
      title: 'Product Analyzer',
      description: 'Analyze 25 products for environmental impact',
      icon: '🔍',
      progress: 18,
      requirement: 25
    },
    {
      id: '4',
      title: 'Green Influencer',
      description: 'Share 5 environmental insights',
      icon: '📢',
      progress: 3,
      requirement: 5
    },
    {
      id: '5',
      title: 'Sustainability Expert',
      description: 'Maintain 90+ green score for 30 days',
      icon: '🎓',
      progress: 22,
      requirement: 30
    }
  ];

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'weekly': return <Target className="h-4 w-4 text-orange-600" />;
      case 'monthly': return <Trophy className="h-4 w-4 text-purple-600" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'border-blue-300 text-blue-700 bg-blue-50';
      case 'weekly': return 'border-orange-300 text-orange-700 bg-orange-50';
      case 'monthly': return 'border-purple-300 text-purple-700 bg-purple-50';
      default: return 'border-gray-300 text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-emerald-600" />
            <span>Eco Challenges & Achievements</span>
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Take on challenges and unlock achievements to build sustainable habits
          </p>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={activeTab === 'challenges' ? 'default' : 'outline'}
              onClick={() => setActiveTab('challenges')}
              className={activeTab === 'challenges' 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              }
            >
              <Target className="h-4 w-4 mr-2" />
              Challenges
            </Button>
            <Button
              variant={activeTab === 'achievements' ? 'default' : 'outline'}
              onClick={() => setActiveTab('achievements')}
              className={activeTab === 'achievements' 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              }
            >
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </Button>
          </div>

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="space-y-4">
              {challenges.map((challenge) => {
                const Icon = challenge.icon;
                const progressPercentage = (challenge.progress / challenge.target) * 100;
                
                return (
                  <div key={challenge.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Icon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getChallengeTypeColor(challenge.type)}>
                          {getChallengeTypeIcon(challenge.type)}
                          <span className="ml-1 capitalize">{challenge.type}</span>
                        </Badge>
                        <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                          {challenge.points} pts
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{challenge.progress}/{challenge.target}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{challenge.category}</span>
                      <Button 
                        size="sm"
                        disabled={challenge.completed}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {challenge.completed ? 'Completed' : 'Join Challenge'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="grid gap-4">
              {achievements.map((achievement) => {
                const isUnlocked = achievement.unlockedAt;
                const progressPercentage = (achievement.progress / achievement.requirement) * 100;
                
                return (
                  <div 
                    key={achievement.id} 
                    className={`border rounded-lg p-4 ${
                      isUnlocked 
                        ? 'border-emerald-300 bg-emerald-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`text-2xl ${isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isUnlocked ? 'text-emerald-900' : 'text-gray-600'}`}>
                            {achievement.title}
                          </h3>
                          <p className={`text-sm ${isUnlocked ? 'text-emerald-700' : 'text-gray-500'}`}>
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      {isUnlocked && (
                        <Badge className="bg-emerald-600 text-white">
                          <Trophy className="h-3 w-3 mr-1" />
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    
                    {!isUnlocked && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.requirement}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    )}
                    
                    {isUnlocked && (
                      <p className="text-xs text-emerald-600">
                        Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EcoChallenges;
