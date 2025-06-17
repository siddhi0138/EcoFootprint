
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Users, 
  Trophy, 
  Calendar,
  Leaf,
  Droplets,
  Zap,
  Recycle,
  Car,
  ShoppingBag,
  Home,
  Clock
} from 'lucide-react';

const SustainabilityChallenges = () => {
  const [activeTab, setActiveTab] = useState('active');

  const activeChallenges = [
    {
      id: 1,
      title: 'Zero Waste Week',
      description: 'Reduce your household waste to less than 1 bag this week',
      category: 'Waste Reduction',
      progress: 4,
      target: 7,
      unit: 'days',
      points: 500,
      participants: 1247,
      timeLeft: '3 days',
      icon: Recycle,
      color: 'bg-green-500',
      difficulty: 'Medium'
    },
    {
      id: 2,
      title: 'Sustainable Commute',
      description: 'Use public transport, bike, or walk for all trips this week',
      category: 'Transportation',
      progress: 12,
      target: 20,
      unit: 'trips',
      points: 300,
      participants: 892,
      timeLeft: '5 days',
      icon: Car,
      color: 'bg-blue-500',
      difficulty: 'Easy'
    },
    {
      id: 3,
      title: 'Energy Saver',
      description: 'Reduce electricity usage by 20% compared to last month',
      category: 'Energy',
      progress: 15,
      target: 20,
      unit: '% reduction',
      points: 750,
      participants: 2156,
      timeLeft: '12 days',
      icon: Zap,
      color: 'bg-yellow-500',
      difficulty: 'Hard'
    }
  ];

  const upcomingChallenges = [
    {
      id: 4,
      title: 'Plastic-Free July',
      description: 'Eliminate single-use plastics for the entire month',
      category: 'Waste Reduction',
      duration: '30 days',
      points: 1500,
      startDate: '2024-07-01',
      icon: Recycle,
      color: 'bg-green-500',
      difficulty: 'Hard'
    },
    {
      id: 5,
      title: 'Local Food Challenge',
      description: 'Source 80% of your food from local producers',
      category: 'Food',
      duration: '14 days',
      points: 600,
      startDate: '2024-06-25',
      icon: ShoppingBag,
      color: 'bg-orange-500',
      difficulty: 'Medium'
    }
  ];

  const completedChallenges = [
    {
      id: 6,
      title: 'Water Conservation Week',
      description: 'Reduce water usage by 30%',
      category: 'Water',
      points: 400,
      completedDate: '2024-06-10',
      result: 'Saved 180L of water',
      icon: Droplets,
      color: 'bg-blue-500'
    },
    {
      id: 7,
      title: 'Eco Shopping Spree',
      description: 'Buy only sustainable products for 2 weeks',
      category: 'Shopping',
      points: 550,
      completedDate: '2024-05-28',
      result: 'Scanned 47 eco products',
      icon: ShoppingBag,
      color: 'bg-purple-500'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-sage-50 to-emerald-50 border-sage-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sage-700">
            <Target className="w-6 h-6" />
            <span>Sustainability Challenges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-sage-800">12</p>
              <p className="text-sm text-sage-600">Completed</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-sage-800">3</p>
              <p className="text-sm text-sage-600">Active</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-sage-800">4.2K</p>
              <p className="text-sm text-sage-600">Points Earned</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-sage-800">45</p>
              <p className="text-sm text-sage-600">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Challenges</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeChallenges.map((challenge) => (
            <Card key={challenge.id} className="bg-white/80 backdrop-blur-sm border-sage-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${challenge.color} rounded-xl flex items-center justify-center`}>
                      <challenge.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sage-800">{challenge.title}</h3>
                      <p className="text-sm text-sage-600">{challenge.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                      +{challenge.points} pts
                    </Badge>
                  </div>
                </div>

                <p className="text-sage-700 mb-4">{challenge.description}</p>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-sage-600">Progress</span>
                    <span className="font-medium text-sage-800">
                      {challenge.progress}/{challenge.target} {challenge.unit}
                    </span>
                  </div>
                  <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm text-sage-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{challenge.participants.toLocaleString()} participants</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{challenge.timeLeft} left</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-sage-600 to-emerald-600 hover:from-sage-700 hover:to-emerald-700">
                      Update Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingChallenges.map((challenge) => (
            <Card key={challenge.id} className="bg-white/80 backdrop-blur-sm border-sage-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${challenge.color} rounded-xl flex items-center justify-center`}>
                      <challenge.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sage-800">{challenge.title}</h3>
                      <p className="text-sm text-sage-600">{challenge.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                      +{challenge.points} pts
                    </Badge>
                  </div>
                </div>

                <p className="text-sage-700 mb-4">{challenge.description}</p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-sage-600">
                    <p>Duration: {challenge.duration}</p>
                    <p>Starts: {new Date(challenge.startDate).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" className="border-sage-200 hover:bg-sage-50">
                    Join Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedChallenges.map((challenge) => (
            <Card key={challenge.id} className="bg-white/80 backdrop-blur-sm border-sage-200 opacity-75">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${challenge.color} rounded-xl flex items-center justify-center`}>
                      <challenge.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sage-800">{challenge.title}</h3>
                      <p className="text-sm text-sage-600">{challenge.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-emerald-500" />
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                      +{challenge.points} pts
                    </Badge>
                  </div>
                </div>

                <p className="text-sage-700 mb-4">{challenge.description}</p>

                <div className="flex items-center justify-between text-sm text-sage-600">
                  <div>
                    <p className="font-medium text-emerald-700">{challenge.result}</p>
                    <p>Completed: {new Date(challenge.completedDate).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-sage-600">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SustainabilityChallenges;
