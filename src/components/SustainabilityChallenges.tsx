import React, { useState, useEffect } from 'react';
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
import { collection, doc, onSnapshot, setDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  icon: React.ElementType;
  color: string;
  difficulty?: string;
  duration?: string;
  startDate?: string;
  result?: string;
  progress?: number;
  completedDate?: string;
  target?: number;
  participants?: number;
  timeLeft?: string;
  status: 'active' | 'upcoming' | 'completed' | 'joined'; 
}

// Create a separate interface for Firebase data
interface FirebaseChallenge {
  challengeId: string;
  title: string;
  category: string;
  points: number;
  status: 'active' | 'completed' | 'joined';
  progress: number;
  target: number;
  unit: string;
  joinedAt?: any;
  completedAt?: any;
  description?: string;
  result?: string;
  completedDate?: string;
}

const SustainabilityChallenges = () => {
  const [activeTab, setActiveTab] = useState('active');

  // Helper function to get icon and color based on category
  const getChallengeDisplayInfo = (category: string) => {
    switch (category) {
      case 'Waste Reduction':
        return { icon: Recycle, color: 'bg-green-500' };
      case 'Transportation':
        return { icon: Car, color: 'bg-blue-500' };
      case 'Energy':
        return { icon: Zap, color: 'bg-yellow-500' };
      case 'Water':
        return { icon: Droplets, color: 'bg-blue-500' };
      case 'Food':
      case 'Shopping':
        return { icon: ShoppingBag, color: 'bg-orange-500' };
      default:
        return { icon: Leaf, color: 'bg-green-500' };
    }
  };

  const activeChallenges: Challenge[] = [
    {
      id: '1',
      title: 'Zero Waste Week',
      description: 'Reduce your household waste to less than 1 bag this week',
      category: 'Waste Reduction',
      progress: 4,
      target: 7,
      points: 500,
      participants: 1247,
      timeLeft: '3 days',
      icon: Recycle,
      color: 'bg-green-500',
      difficulty: 'Medium',
      status: 'active',
    },
    {
      id: '2',
      title: 'Sustainable Commute',
      description: 'Use public transport, bike, or walk for all trips this week',
      category: 'Transportation',
      progress: 12,
      target: 20,
      points: 300,
      participants: 892,
      timeLeft: '5 days',
      icon: Car,
      color: 'bg-blue-500',
      difficulty: 'Easy',
      status: 'active',
    },
    {
      id: '3',
      title: 'Energy Saver',
      description: 'Reduce electricity usage by 20% compared to last month',
      category: 'Energy',
      progress: 15,
      target: 20,
      points: 750,
      participants: 2156,
      timeLeft: '12 days',
      icon: Zap,
      color: 'bg-yellow-500',
      difficulty: 'Hard',
      status: 'active',
    }
  ];

  const upcomingChallenges: Challenge[] = [
    {
      id: '4',
      title: 'Plastic-Free July',
      description: 'Eliminate single-use plastics for the entire month',
      category: 'Waste Reduction',
      duration: '30 days',
      points: 1500,
      startDate: '2024-07-01',
      icon: Recycle,
      color: 'bg-green-500',
      status: 'upcoming',
      difficulty: 'Hard'
    },
    {
      id: '5',
      title: 'Local Food Challenge',
      description: 'Source 80% of your food from local producers',
      category: 'Food',
      duration: '14 days',
      points: 600,
      startDate: '2024-06-25',
      icon: ShoppingBag,
      color: 'bg-orange-500',
      status: 'upcoming',
      difficulty: 'Medium'
    }
  ];

  const completedChallenges: Challenge[] = [
    {
      id: '6',
      title: 'Water Conservation Week',
      description: 'Reduce water usage by 30%',
      category: 'Water',
      points: 400,
      completedDate: '2024-06-10',
      result: 'Saved 180L of water',
      icon: Droplets,
      status: 'completed',
      color: 'bg-blue-500'
    },
    {
      id: '7',
      title: 'Eco Shopping Spree',
      description: 'Buy only sustainable products for 2 weeks',
      category: 'Shopping',
      points: 550,
      completedDate: '2024-05-28',
      result: 'Scanned 47 eco products',
      icon: ShoppingBag,
      status: 'completed',
      color: 'bg-purple-500'
    }
  ];

  const { user } = useAuth();
  const [userChallenges, setUserChallenges] = useState<FirebaseChallenge[]>([]);
  const [activeUserChallenges, setActiveUserChallenges] = useState<Challenge[]>([]);
  const [completedUserChallenges, setCompletedUserChallenges] = useState<Challenge[]>([]);
  const [upcomingChallengesDisplay, setUpcomingChallengesDisplay] = useState<Challenge[]>(upcomingChallenges);

  // Helper function to convert Firebase data to Challenge format
  const convertToChallenge = (firebaseData: FirebaseChallenge, docId: string): Challenge => {
    const displayInfo = getChallengeDisplayInfo(firebaseData.category);
    return {
      id: docId,
      title: firebaseData.title,
      description: firebaseData.description || 'No description available',
      category: firebaseData.category,
      points: firebaseData.points,
      icon: displayInfo.icon,
      color: displayInfo.color,
      status: firebaseData.status,
      progress: firebaseData.progress,
      target: firebaseData.target,
      result: firebaseData.result,
      completedDate: firebaseData.completedDate,
    };
  };

  // Fetch user's challenges
  useEffect(() => {
    if (!user) {
      setUserChallenges([]);
      setActiveUserChallenges([]);
      setCompletedUserChallenges([]);
      return;
    }

    const userChallengesRef = collection(db, 'users', user.uid, 'challenges');
    const unsubscribeChallenges = onSnapshot(userChallengesRef, (snapshot) => {
      const challengesData = snapshot.docs.map(doc => ({ 
        ...(doc.data() as FirebaseChallenge),
        id: doc.id 
      }));
      
      setUserChallenges(challengesData);
      
      // Convert Firebase data to Challenge format for display
      const activeChallengesData = challengesData
        .filter(c => c.status === 'active')
        .map(c => convertToChallenge(c, c.id));
      
      const completedChallengesData = challengesData
        .filter(c => c.status === 'completed')
        .map(c => convertToChallenge(c, c.id));
      
      setActiveUserChallenges(activeChallengesData);
      setCompletedUserChallenges(completedChallengesData);

      // Filter upcoming challenges based on what user has already joined
      const joinedChallengeIds = challengesData.map(c => c.challengeId);
      const filteredUpcoming = upcomingChallenges.filter(uc => !joinedChallengeIds.includes(uc.id));
      setUpcomingChallengesDisplay(filteredUpcoming);

    }, (error) => {
      console.error('Error fetching user challenges:', error);
    });
    
    return () => unsubscribeChallenges();
  }, [user]);

  const joinChallenge = async (challenge: Challenge) => {
    if (!user) return;

    const challengeRef = doc(db, 'users', user.uid, 'challenges', challenge.id);
    try {
      await setDoc(challengeRef, {
        challengeId: challenge.id,
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        points: challenge.points,
        status: 'active',
        progress: 0,
        target: challenge.duration ? (challenge.duration.includes('days') ? parseInt(challenge.duration) : 0) : (challenge as any).target || 0,
        unit: challenge.duration ? (challenge.duration.includes('days') ? 'days' : '') : (challenge as any).unit || '',
        joinedAt: serverTimestamp(),
      });
      console.log(`Joined challenge: ${challenge.title}`);
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const updateChallengeProgress = async (challengeId: string, newProgress: number, target: number) => {
    if (!user) return;

    const challengeRef = doc(db, 'users', user.uid, 'challenges', challengeId);
    try {
      const status = newProgress >= target ? 'completed' : 'active';
      await updateDoc(challengeRef, { 
        progress: newProgress, 
        status: status, 
        completedAt: status === 'completed' ? serverTimestamp() : null 
      });
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
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
              <p className="text-2xl font-bold text-sage-800">{completedUserChallenges.length}</p>
              <p className="text-sm text-sage-600">Completed</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-sage-800">{activeUserChallenges.length}</p>
              <p className="text-sm text-sage-600">Active</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-sage-800">
                {userChallenges.reduce((total, challenge) => total + challenge.points, 0)}
              </p>
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
          {activeUserChallenges.map((challenge) => (
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
                      {challenge.difficulty || 'N/A'}
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
                      {challenge.progress}/{challenge.target}
                    </span>
                  </div>
                  <Progress value={challenge.target ? (challenge.progress! / challenge.target) * 100 : 0} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm text-sage-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingChallengesDisplay.map((challenge) => (
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
                    <p>Starts: {challenge.startDate ? new Date(challenge.startDate).toLocaleDateString() : 'TBD'}</p>
                  </div>
                  <Button variant="outline" className="border-sage-200 hover:bg-sage-50" onClick={() => joinChallenge(challenge)}>
                    Join Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedUserChallenges.map((challenge) => (
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
                    <p className="font-medium text-emerald-700">{challenge.result || 'Challenge completed!'}</p>
                    <p>Completed: {challenge.completedDate ? new Date(challenge.completedDate).toLocaleDateString() : 'Recently'}</p>
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