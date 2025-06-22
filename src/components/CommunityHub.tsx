import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Recycle,
  Send,
} from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';
import { useToast } from '@/hooks/use-toast';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp, // Import serverTimestamp
  setDoc, // Import setDoc
  query, // Import query
  orderBy, // Import orderBy
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

interface CarbonEntry {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface ScannedProduct {
  id: string;
  name: string;
  brand: string;
  sustainabilityScore: number;
  date: string;
  category: string;
}

interface UserStats {
  totalPoints: number;
  level: number;
  totalScans: number;
  avgScore: number;
  co2Saved: number;
  rank: number;
  badges: number;
  weeklyGoal: number;
  currentWeekScans: number;
  streakDays: number;
  coursesCompleted: number;
  recipesViewed: number;
  transportTrips: number;
  esgReports: number;
  investmentsMade: number;
}

interface UserDataContextType {
  carbonEntries: CarbonEntry[];
  scannedProducts: ScannedProduct[];
  userStats: UserStats;
  addCarbonEntry: (entry: Omit<CarbonEntry, 'id'>) => void;
  addScannedProduct: (product: Omit<ScannedProduct, 'id' | 'date'>) => void;
  addPoints: (points: number) => void;
  redeemReward: (cost: number) => boolean;
  incrementCourseCompleted: () => void;
  incrementRecipeViewed: () => void;
  incrementTransportTrip: () => void;
  incrementESGReport: () => void;
  incrementInvestment: () => void;
}

interface CommunityPost {
  id: string;
  authorId: string; // Add authorId
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number; // This will be the count from the subcollection
  timeAgo: string; // Consider using a timestamp and calculating this dynamically
  achievement?: string;
  createdAt: any; // Add createdAt timestamp
}

interface PostComment {
  id: string;
  postId: string;
  authorId: string; // Add authorId
  author: string;
  avatar: string; // Consider fetching author avatar from user data
  content: string;
  timeAgo: string; // Consider using a timestamp
  createdAt: any; // Add createdAt timestamp
}


const CommunityHub = () => {
  const { currentUser } = useAuth(); // Get currentUser from useAuth
  const { userStats, addPoints } = useUserData();
  const { toast } = useToast();
  const [firebaseActiveChallenge, setFirebaseActiveChallenge] = useState(null);
  const [firebaseLikedPosts, setFirebaseLikedPosts] = useState(new Set<string>()); // Specify type for Set
  const [firebaseShowComments, setFirebaseShowComments] = useState(new Set<string>()); // Specify type for Set
  const [firebasePostComments, setFirebasePostComments] = useState<Record<string, PostComment[]>>({}); // Specify type for object
  const [firebaseJoinedGroups, setFirebaseJoinedGroups] = useState(new Set<string>()); // Specify type for Set
  const [newComment, setNewComment] = useState('');
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]); // Specify type for array

  // Fetch user community activity
  useEffect(() => {
    if (!currentUser) {
      setFirebaseActiveChallenge(null);
      setFirebaseLikedPosts(new Set());
      setFirebaseJoinedGroups(new Set());
      return;
    }

    const userActivityRef = doc(db, 'users', currentUser.uid, 'communityActivity', 'data');
    const unsubscribeUserActivity = onSnapshot(userActivityRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirebaseActiveChallenge(data.activeChallenge || null);
        setFirebaseLikedPosts(new Set(data.likedPosts || []));
        setFirebaseJoinedGroups(new Set(data.joinedGroups || []));
      } else {
        // Initialize if no data exists
        setFirebaseActiveChallenge(null);
        setFirebaseLikedPosts(new Set());
        setFirebaseJoinedGroups(new Set());
        // Optionally create the document with initial empty values
        setDoc(userActivityRef, {
          activeChallenge: null,
          likedPosts: [],
          joinedGroups: [],
        }).catch(error => console.error("Error initializing user community activity:", error));
      }
    }, (error) => {
      console.error('Error fetching user community activity:', error);
    });    
    return () => unsubscribeUserActivity();
  }, [currentUser]);

  // Fetch community posts
  useEffect(() => {
    const postsCollectionRef = collection(db, 'posts');
    const postsQuery = query(postsCollectionRef, orderBy('createdAt', 'desc')); // Order by timestamp
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as CommunityPost // Cast with proper type
      }));
      setCommunityPosts(postsData);
    }, (error) => {
      console.error('Error fetching community posts:', error);
    });

    return () => unsubscribePosts();
  }, []);

  // Fetch comments
  useEffect(() => {
    const commentsCollectionRef = collection(db, 'comments');
    const commentsQuery = query(commentsCollectionRef, orderBy('createdAt', 'asc')); // Order by timestamp
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => doc.data() as PostComment); // Cast with proper type
      const organizedComments = commentsData.reduce((acc, comment) => {
        if (comment.postId) {
          if (!acc[comment.postId]) {
            acc[comment.postId] = [];
          }
          acc[comment.postId].push(comment);
        }
        return acc;
      }, {} as Record<string, PostComment[]>); // Specify proper type
      setFirebasePostComments(organizedComments);
    }, (error) => {
      console.error('Error fetching comments:', error);
    });

    return () => unsubscribeComments();
  }, []);


  const challenges = [
    {
      id: 'zero-waste-week', // Use string IDs for Firebase
      title: 'Zero Waste Week',
      description: 'Reduce your waste to zero for 7 consecutive days',
      participants: 1247, // This might be dynamic from Firebase later
      daysLeft: 5, // This will need dynamic calculation
      progress: Math.min((userStats.totalScans / 7) * 100, 100), // Example progress, needs real challenge progress
      reward: '500 EcoPoints',
      difficulty: 'Medium',
      category: 'waste',
      icon: Recycle,
    },
    {
      id: 'sustainable-shopping',
      title: 'Sustainable Shopping',
      description: 'Scan 10 eco-friendly products this month',
      participants: 892, // Dynamic
      daysLeft: 12, // Dynamic
      progress: Math.min((userStats.totalScans / 10) * 100, 100), // Example progress
      reward: '1000 EcoPoints',
      difficulty: 'Easy',
      category: 'shopping',
      icon: Leaf,
    },
    {
      id: 'carbon-tracker-master',
      title: 'Carbon Tracker Master',
      description: 'Track 5kg of CO2 emissions',
      participants: 634, // Dynamic
      daysLeft: 8, // Dynamic
      progress: Math.min((userStats.co2Saved / 5) * 100, 100), // Example progress
      reward: '750 EcoPoints',
      difficulty: 'Medium',
      category: 'carbon',
      icon: Target,
    },
  ];

  // Leaderboard data - This should ideally be fetched from a global leaderboard collection in Firebase
  const leaderboard = [
    { rank: 1, name: 'EcoMaster', points: 15420, change: '+2' },
    { rank: 2, name: 'GreenQueen', points: 14890, change: '-1' },
    { rank: 3, name: 'PlantPapa', points: 14256, change: '+1' },    { rank: 4, name: 'You', points: userStats.totalPoints, change: currentUser.change || '+0' }, // Assuming rankChange in userStats
    { rank: 5, name: 'EcoNinja', points: 12340, change: '-2' },
  ];

  // Community Groups - This should ideally be fetched from a groups collection in Firebase
  const communityGroups = [
    { name: 'Zero Waste Warriors', members: 1234, category: 'Waste Reduction' },
    { name: 'Plant-Based Power', members: 987, category: 'Sustainable Diet' },
    { name: 'Green Commuters', members: 756, category: 'Transportation' }, // Corrected category
    { name: 'Eco DIY Masters', members: 543, category: 'DIY & Crafts' },
  ];



  const handleJoinChallenge = async (challengeId: string) => { // Specify challengeId type
    if (!currentUser) return;

    const userActivityRef = doc(db, 'users', currentUser.uid, 'communityActivity', 'data');

    if (firebaseActiveChallenge === challengeId) {
      // Leaving challenge
      await updateDoc(userActivityRef, {
        activeChallenge: null,
      });
      toast({
        title: 'Challenge Left',
        description: 'You have left the challenge.',
      });
    } else {
      // Joining challenge
      await setDoc(userActivityRef, {
        activeChallenge: challengeId,
      }, { merge: true });
      addPoints(25); // This will also trigger a Firestore update via useUserData
      toast({
        title: 'Challenge Joined!',
        description: 'You earned 25 points for joining a challenge!',
      });
    }
  };

  const handleLikePost = async (postId: string) => { // Specify postId type
    if (!currentUser) return;

    const postRef = doc(db, 'posts', postId);
    const userActivityRef = doc(db, 'users', currentUser.uid, 'communityActivity', 'data');

    const postToUpdate = communityPosts.find(post => post.id === postId); // Find the post in the local state

    const newLikedPosts = new Set(firebaseLikedPosts);

    if (newLikedPosts.has(postId)) {
      // Unlike post
      newLikedPosts.delete(postId);
      await updateDoc(postRef, {
        likes: postToUpdate.likes - 1, // Decrement likes
      });
      await updateDoc(userActivityRef, {
      });
      toast({
        title: 'Post Unliked',
        description: 'You removed your like from this post.',
      });
    } else {
      // Like post
      newLikedPosts.add(postId);
       await updateDoc(postRef, {
        likes: postToUpdate.likes + 1, // Increment likes
      });
      await updateDoc(userActivityRef, {
      });
      addPoints(5); // This will also trigger a Firestore update via useUserData
      toast({
        title: 'Post Liked!',
        description: 'You earned 5 points for engaging with the community!',
      });
    }

    setFirebaseLikedPosts(newLikedPosts); // Update local state based on Firestore listener
  };


  const handleToggleComments = (postId: string) => { // Specify postId type
    const newShowComments = new Set(firebaseShowComments);
    if (newShowComments.has(postId)) {
      newShowComments.delete(postId);
    } else {
      newShowComments.add(postId);
    }
    setFirebaseShowComments(newShowComments);
  };

  const handleAddComment = async (postId: string) => { // Specify postId type
    if (!currentUser || !newComment.trim()) return;

    const commentsCollectionRef = collection(db, 'comments');
    const postRef = doc(db, 'posts', postId);

    const newCommentData = {
      postId,
      authorId: currentUser.uid,
 author: currentUser.displayName || currentUser.email || 'Anonymous', // Use currentUser's name/email
 avatar: currentUser.photoURL || '', // Use currentUser's photo URL if available
      content: newComment,
      createdAt: serverTimestamp(), // Add server timestamp
    };

    await addDoc(commentsCollectionRef, newCommentData);

    // Increment comment count on the post document
    await updateDoc(postRef, {
      comments: (firebasePostComments[postId]?.length || 0) + 1,
    });


    setNewComment('');
    addPoints(10); // This will also trigger a Firestore update via useUserData
    toast({
      title: 'Comment Added!',
      description: 'You earned 10 points for commenting!',
    });
  };

  const handleSharePost = (post: CommunityPost) => { // Specify post type
    try {
      if (navigator.share && navigator.canShare) {
        navigator.share({
          title: `Post by ${post.author}`,
          text: post.content,
          url: window.location.href, // Consider using a specific post URL
        }).then(() => {
          addPoints(5);
          toast({
            title: 'Post Shared!',
            description: 'You earned 5 points for sharing!',
          });
        }).catch((error) => {
          console.log('Share cancelled or failed:', error);
          fallbackShare(post);
        });
      } else {
        fallbackShare(post);
      }
    } catch (error) {
      console.log('Share not supported:', error);
      fallbackShare(post);
    }
  };

  const fallbackShare = (post: CommunityPost) => { // Specify post type
    const shareText = `${post.content} - Shared from EcoApp`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        addPoints(5);
        toast({
          title: 'Post Shared!',
          description: 'Post content copied to clipboard! You earned 5 points!',
        });
      }).catch(() => {
        toast({
          title: 'Share Failed',
          description: 'Unable to copy to clipboard.',
          variant: 'destructive',
        });
      });
    } else {
      toast({
        title: 'Share Content',
        description: shareText,
      });
      addPoints(5);
    }
  };

  const handleJoinGroup = async (groupName: string) => { // Specify groupName type
    if (!currentUser) return;

    const userActivityRef = doc(db, 'users', currentUser.uid, 'communityActivity', 'data');
    const newJoinedGroups = new Set(firebaseJoinedGroups);

    if (newJoinedGroups.has(groupName)) {
      // Leave group
      newJoinedGroups.delete(groupName);
      await updateDoc(userActivityRef, {
        joinedGroups: arrayRemove(groupName),
      });
      toast({
        title: 'Left Group',
        description: `You have left ${groupName}.`,
      });
    } else {
      // Join group
      newJoinedGroups.add(groupName);
       await updateDoc(userActivityRef, {
        joinedGroups: arrayUnion(groupName),
      });
      addPoints(10); // This will also trigger a Firestore update via useUserData
      toast({
        title: 'Group Joined!',
        description: `Welcome to ${groupName}! You earned 10 points!`,
      });
    }
    setFirebaseJoinedGroups(newJoinedGroups); // Update local state based on Firestore listener
  };

  const getDifficultyColor = (difficulty: string) => { // Specify difficulty type
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
          <div className="flex items-center space-x-4 mt-2">
            <Badge className="bg-blue-100 text-blue-700">
              {userStats.totalPoints} Points
            </Badge>
            <Badge className="bg-green-100 text-green-700">
              {userStats.totalScans} Scans
            </Badge>
            <Badge className="bg-purple-100 text-purple-700">
              Level {userStats.level}
            </Badge>
          </div>
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
                      <span className="text-gray-600">Your Progress</span>
                      <span className="font-medium">{Math.round(challenge.progress)}%</span>
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
                      variant={firebaseActiveChallenge === challenge.id ? 'secondary' : 'default'}
                      onClick={() => handleJoinChallenge(challenge.id)}
                    >
                      {firebaseActiveChallenge === challenge.id ? 'Leave Challenge' : 'Join Challenge'}
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
                     {/* Placeholder for author avatar - fetch from user data in Firebase */}
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                         {/* Placeholder for author name - fetch from user data in Firebase */}
                        <span className="font-medium">{post.authorId}</span>
                        {post.achievement && (
                          <Badge variant="outline" className="text-xs">
                            {post.achievement}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">{post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString() : 'just now'}</span> {/* Display timestamp */}
                      </div>
                      <p className="text-gray-700 mb-3">{post.content}</p>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center space-x-1 ${firebaseLikedPosts.has(post.id) ? 'text-red-500' : ''}`}
                          onClick={() => handleLikePost(post.id)}
                        >
                          <ThumbsUp className={`w-4 h-4 ${firebaseLikedPosts.has(post.id) ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1"
                          onClick={() => handleToggleComments(post.id)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{firebasePostComments[post.id]?.length || 0}</span> {/* Use comments count from state */}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1"
                          onClick={() => handleSharePost(post)}
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </Button>
                      </div>

                      {firebaseShowComments.has(post.id) && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="space-y-3 mb-4">
                            {(firebasePostComments[post.id] || []).map((comment) => (
                              <div key={comment.id} className="flex items-start space-x-2">
                                 {/* Placeholder for author avatar */}
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                     {/* Placeholder for author name */}
                                    <span className="text-sm font-medium">{comment.authorId}</span>
                                    <span className="text-xs text-gray-500">{comment.createdAt ? new Date(comment.createdAt.toDate()).toLocaleString() : 'just now'}</span> {/* Display timestamp */}
                                  </div>
                                  <p className="text-sm text-gray-700">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="flex-1"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            />
                            <Button size="sm" onClick={() => handleAddComment(post.id)}>
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
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
            {communityGroups.map((group, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{group.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{group.members} members</span>
                    <Button
                      size="sm"
                      variant={firebaseJoinedGroups.has(group.name) ? 'secondary' : 'default'}
                      onClick={() => handleJoinGroup(group.name)}
                    >
                      {firebaseJoinedGroups.has(group.name) ? 'Leave Group' : 'Join Group'}
                    </Button>
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
