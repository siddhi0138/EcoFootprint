
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Trophy, 
  Target, 
  Calendar, 
  MessageCircle, 
  ThumbsUp,
  Share2,
  Award,
  Leaf,
  Recycle
} from 'lucide-react';

const CommunityHub = () => {
  const [activeChallenge, setActiveChallenge] = useState(null);

  const challenges = [
    {
      id: 1,
      title: 'Zero Waste Week',
      description: 'Reduce your waste to zero for 7 consecutive days',
      participants: 1247,
      daysLeft: 5,
      progress: 68,
      reward: '500 EcoPoints',
      difficulty: 'Medium',
      category: 'waste',
      icon: Recycle
    },
    {
      id: 2,
      title: 'Plant-Based February',
      description: 'Adopt a plant-based diet for the entire month',
      participants: 892,
      daysLeft: 12,
      progress: 45,
      reward: '1000 EcoPoints',
      difficulty: 'Hard',
      category: 'food',
      icon: Leaf
    },
    {
      id: 3,
      title: 'Carbon-Free Commute',
      description: 'Use only sustainable transport for 2 weeks',
      participants: 634,
      daysLeft: 8,
      progress: 72,
      reward: '750 EcoPoints',
      difficulty: 'Easy',
      category: 'transport',
      icon: Target
    }
  ];

  const communityPosts = [
    {
      id: 1,
      author: 'EcoWarrior23',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b422?w=40',
      content: 'Just completed my first zero-waste week! Feeling amazing and learned so much about sustainable alternatives. 🌱',
      likes: 24,
      comments: 8,
      timeAgo: '2 hours ago',
      achievement: 'Zero Waste Champion'
    },
    {
      id: 2,
      author: 'GreenThumb99',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40',
      content: 'Found an amazing local farmers market that reduces my carbon footprint by 60%! Location shared in comments.',
      likes: 18,
      comments: 12,
      timeAgo: '4 hours ago',
      achievement: 'Local Hero'
    },
    {
      id: 3,
      author: 'SustainableSarah',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40',
      content: 'DIY cleaning products tutorial is live! Made from ingredients you probably already have at home. ♻️',
      likes: 35,
      comments: 15,
      timeAgo: '1 day ago',
      achievement: 'Eco Educator'
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'EcoMaster', points: 15420, change: '+2' },
    { rank: 2, name: 'GreenQueen', points: 14890, change: '-1' },
    { rank: 3, name: 'PlantPapa', points: 14256, change: '+1' },
    { rank: 4, name: 'You', points: 12890, change: '+3' },
    { rank: 5, name: 'EcoNinja', points: 12340, change: '-2' }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Community Hub</span>
          </CardTitle>
          <p className="text-gray-600">Connect, compete, and collaborate for a sustainable future</p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <challenge.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{challenge.title}</h3>
                        <p className="text-gray-600">{challenge.description}</p>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{challenge.progress}%</span>
                    </div>
                    <Progress value={challenge.progress} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{challenge.participants} participants</span>
                        <span>{challenge.daysLeft} days left</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{challenge.reward}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      variant={activeChallenge === challenge.id ? "secondary" : "default"}
                      onClick={() => setActiveChallenge(activeChallenge === challenge.id ? null : challenge.id)}
                    >
                      {activeChallenge === challenge.id ? 'Leave Challenge' : 'Join Challenge'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <div className="space-y-4">
            {communityPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <img 
                      src={post.avatar} 
                      alt={post.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{post.author}</span>
                        <Badge variant="outline" className="text-xs">
                          {post.achievement}
                        </Badge>
                        <span className="text-xs text-gray-500">{post.timeAgo}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{post.content}</p>
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>EcoPoints Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div key={user.rank} className={`flex items-center justify-between p-3 rounded-lg ${user.name === 'You' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${user.rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' : 'bg-gray-200'}`}>
                        {user.rank}
                      </div>
                      <span className={`font-medium ${user.name === 'You' ? 'text-blue-600' : ''}`}>
                        {user.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{user.points.toLocaleString()}</span>
                      <Badge variant={user.change.startsWith('+') ? 'default' : 'secondary'} className="text-xs">
                        {user.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Zero Waste Warriors', members: 1234, category: 'Waste Reduction' },
              { name: 'Plant-Based Power', members: 987, category: 'Sustainable Diet' },
              { name: 'Green Commuters', members: 756, category: 'Transportation' },
              { name: 'Eco DIY Masters', members: 543, category: 'DIY & Crafts' }
            ].map((group, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{group.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{group.members} members</span>
                    <Button size="sm">Join Group</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityHub;
