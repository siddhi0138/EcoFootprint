import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  MessageCircle,
  Heart,
  Share2,
  Trophy,
  Star,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  BookmarkPlus,
  Calendar,
  MapPin,
  Clock,
  Award,
  Zap,
  Leaf,
  Target,
  TrendingUp,
  Gift,
  Coins,
  Crown,
  ShoppingBag,
  CheckCircle,
} from 'lucide-react';

import { useNotificationHelperNew } from '../hooks/useNotificationHelperNew';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';

const CommunityHub = () => {
  const { addCommunityNotification } = useNotificationHelperNew();
  const { currentUser: authUser } = useAuth();
  const { userStats, redeemReward } = useUserData();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', category: '' });
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Live discussion feed for whichever group is currently open (selectedGroup) - real Firestore
  // messages, not a static "for show" card.
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupMessage, setNewGroupMessage] = useState('');
  const [isSendingGroupMessage, setIsSendingGroupMessage] = useState(false);

  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '', location: '', maxAttendees: '' });
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', category: '', difficulty: 'Easy', duration: '', reward: '' });
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);

  // Real identity for the logged-in user, derived from auth + their actual stats -
  // no more fabricated points/scans/streaks for "You".
  const currentUser = {
    uid: authUser?.uid,
    name: authUser?.name || authUser?.email || 'EcoScope Member',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser?.name || authUser?.email || 'U')}`,
    points: userStats.totalPoints,
    level: userStats.level,
    totalScans: userStats.totalScans,
    co2Saved: userStats.co2Saved,
  };

  // --- Rewards tab (merged in from the former standalone Rewards page) ---
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
    }
  ];

  const rewardsCatalog = [
    { id: 1, name: '10% Off Eco Products', cost: 150, description: 'Discount on sustainable marketplace purchases', icon: Gift, category: 'Shopping', savings: 'Up to $50 value' },
    { id: 2, name: 'Plant a Tree', cost: 300, description: 'We plant a tree in your name through our partners', icon: Leaf, category: 'Environmental Impact', savings: '1 tree planted' },
    { id: 3, name: 'Premium Analytics', cost: 500, description: '1 month of advanced insights and tracking', icon: Star, category: 'Features', savings: '$9.99 value' },
    { id: 4, name: 'Sustainability Consultation', cost: 750, description: '30-minute call with sustainability expert', icon: Users, category: 'Expert Advice', savings: '$75 value' },
    { id: 5, name: 'Carbon Offset Package', cost: 1000, description: 'Offset 1 ton of your carbon footprint', icon: Zap, category: 'Carbon Offset', savings: '1 ton CO₂ offset' },
    { id: 6, name: 'Eco Product Bundle', cost: 1250, description: 'Curated bundle of top-rated sustainable products', icon: ShoppingBag, category: 'Product Bundle', savings: '$150 value' },
  ].map(r => ({ ...r, available: userStats.totalPoints >= r.cost }));

  const generateDailyChallenges = () => {
    const dailyList = [];
    const avgScansPerDay = Math.max(1, Math.ceil(userStats.totalScans / 30));
    dailyList.push({
      task: `Scan ${avgScansPerDay} sustainable product${avgScansPerDay > 1 ? 's' : ''}`,
      progress: Math.min(userStats.currentWeekScans, avgScansPerDay),
      total: avgScansPerDay,
      points: avgScansPerDay * 15,
      completed: userStats.currentWeekScans >= avgScansPerDay,
      category: 'Scanning'
    });
    const carbonTarget = Math.max(1, Math.ceil(userStats.co2Saved / 10));
    dailyList.push({
      task: `Save ${carbonTarget}kg CO₂ today`,
      progress: userStats.co2Saved >= carbonTarget ? carbonTarget : userStats.co2Saved % carbonTarget || 0,
      total: carbonTarget,
      points: carbonTarget * 20,
      completed: (userStats.co2Saved % 10) >= carbonTarget,
      category: 'Carbon Tracking'
    });
    if (userStats.coursesCompleted < 10) {
      dailyList.push({
        task: 'Complete 1 sustainability course',
        progress: userStats.coursesCompleted > 0 ? 1 : 0,
        total: 1,
        points: 50,
        completed: userStats.coursesCompleted > 0,
        category: 'Learning'
      });
    }
    return dailyList;
  };
  const dailyChallenges = generateDailyChallenges();

  const getUnlockedAchievements = () => achievements.filter(a => a.unlocked).length;
  const getCompletedChallenges = () => dailyChallenges.filter(c => c.completed).length;

  const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];
  const currentLevel = levelThresholds.findIndex((threshold, index) =>
    userStats.totalPoints >= threshold && (levelThresholds[index + 1] === undefined || userStats.totalPoints < levelThresholds[index + 1])
  ) + 1;
  const currentLevelThreshold = levelThresholds[currentLevel - 1] || 0;
  const nextLevelThreshold = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
  const levelProgress = nextLevelThreshold ? ((userStats.totalPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100 : 100;

  const handleRedeemReward = async (reward: typeof rewardsCatalog[0]) => {
    if (await redeemReward(reward.cost, reward.name)) {
      toast({
        title: "Reward Redeemed! 🎉",
        description: `You've successfully redeemed: ${reward.name}. It's saved to your rewards history.`,
        duration: 5000,
      });
    } else {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.cost - userStats.totalPoints} more points to redeem this reward.`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    setCommentInputs(posts.reduce((acc, post) => ({ ...acc, [post.id]: '' }), {}));
  }, [posts]);

  // Real community feed - reads/writes the shared 'communityPosts' Firestore collection
  // (public read, authenticated create, author-only edit/delete, field-scoped like/comment/bookmark).
  useEffect(() => {
    const q = query(collection(db, 'communityPosts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
        const likedBy: string[] = data.likedBy || [];
        const bookmarkedBy: string[] = data.bookmarkedBy || [];
        return {
          id: docSnap.id,
          author: data.author,
          content: data.content,
          image: data.image || null,
          timestamp: timestamp.toISOString(),
          likes: likedBy.length,
          comments: (data.commentList || []).length,
          commentList: data.commentList || [],
          shares: data.shares || 0,
          tags: data.tags || [],
          liked: !!authUser && likedBy.includes(authUser.uid),
          bookmarked: !!authUser && bookmarkedBy.includes(authUser.uid),
        };
      });
      setPosts(loaded);
    }, (error) => console.error('Error loading community posts:', error));
    return () => unsubscribe();
  }, [authUser]);

  // Real community groups/events/challenges - top-level Firestore collections, same
  // live-onSnapshot pattern as communityPosts above. Membership is tracked via an array of
  // uids (memberIds/attendeeIds/participantIds) rather than a single shared boolean, since a
  // shared 'joined' flag on the doc would make every user see the same joined state.
  useEffect(() => {
    const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGroups(snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const memberIds: string[] = data.memberIds || [];
        return {
          id: docSnap.id,
          name: data.name,
          description: data.description,
          category: data.category,
          memberIds,
          members: memberIds.length,
          joined: !!authUser && memberIds.includes(authUser.uid),
        };
      }));
    }, (error) => console.error('Error loading groups:', error));
    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const attendeeIds: string[] = data.attendeeIds || [];
        return {
          id: docSnap.id,
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          location: data.location,
          organizer: data.organizerName || 'Community Member',
          maxAttendees: data.maxAttendees || null,
          attendeeIds,
          attendees: attendeeIds.length,
          registered: !!authUser && attendeeIds.includes(authUser.uid),
        };
      }));
    }, (error) => console.error('Error loading events:', error));
    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChallenges(snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const participantIds: string[] = data.participantIds || [];
        return {
          id: docSnap.id,
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          duration: data.duration,
          reward: data.reward,
          participantIds,
          participants: participantIds.length,
          joined: !!authUser && participantIds.includes(authUser.uid),
        };
      }));
    }, (error) => console.error('Error loading challenges:', error));
    return () => unsubscribe();
  }, [authUser]);

  // Real leaderboard - reads the public 'leaderboard' mirror collection (see
  // UserDataContext, which keeps each user's own doc there in sync with their totalPoints).
  useEffect(() => {
    const q = query(collection(db, 'leaderboard'), orderBy('totalPoints', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeaderboardData(snapshot.docs.map((docSnap, index) => {
        const data = docSnap.data();
        return {
          uid: docSnap.id,
          name: data.name || 'EcoScope Member',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || docSnap.id)}`,
          points: data.totalPoints || 0,
          rank: index + 1,
        };
      }));
    }, (error) => console.error('Error loading leaderboard:', error));
    return () => unsubscribe();
  }, []);

  const handleLike = async (postId) => {
    if (!authUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    try {
      await updateDoc(doc(db, 'communityPosts', postId), {
        likedBy: post.liked ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
      });
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const commentContent = commentInputs[postId];
    if (!commentContent?.trim() || !authUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    try {
      await updateDoc(doc(db, 'communityPosts', postId), {
        commentList: arrayUnion({
          author: { name: currentUser.name, avatar: currentUser.avatar },
          content: commentContent,
        }),
      });
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = (postId) => {
    if (navigator.share) {
      navigator.share({
        title: 'Community Post',
        text: 'Check out this post from our sustainability community!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleBookmark = async (postId) => {
    if (!authUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    try {
      await updateDoc(doc(db, 'communityPosts', postId), {
        bookmarkedBy: post.bookmarked ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
      });
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!authUser) return;
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        memberIds: group.joined ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
      });
      addCommunityNotification(`You have ${group.joined ? 'left' : 'joined'} the group "${group.name}".`);
      toast({ title: group.joined ? 'Left Group' : 'Joined Group!', description: `You ${group.joined ? 'left' : 'joined'} "${group.name}".` });
    } catch (error) {
      console.error('Error updating group membership:', error);
      toast({ title: 'Action Failed', description: 'Could not update group membership.', variant: 'destructive' });
    }
  };

  // Real-time discussion feed for the currently open group - lets a group actually be used for
  // something instead of just existing as a join/leave card.
  useEffect(() => {
    if (!selectedGroup) {
      setGroupMessages([]);
      return;
    }
    const q = query(collection(db, 'groups', selectedGroup.id, 'messages'), orderBy('timestamp', 'asc'), limit(200));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGroupMessages(snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
        return {
          id: docSnap.id,
          text: data.text,
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatar: data.authorAvatar,
          timestamp,
        };
      }));
    }, (error) => console.error('Error loading group messages:', error));
    return () => unsubscribe();
  }, [selectedGroup]);

  const handleSendGroupMessage = async () => {
    if (!authUser || !selectedGroup || !newGroupMessage.trim()) return;
    setIsSendingGroupMessage(true);
    try {
      await addDoc(collection(db, 'groups', selectedGroup.id, 'messages'), {
        text: newGroupMessage.trim(),
        authorId: authUser.uid,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        timestamp: serverTimestamp(),
      });
      setNewGroupMessage('');
    } catch (error) {
      console.error('Error sending group message:', error);
      toast({ title: 'Message Failed', description: 'Could not send your message. Please try again.', variant: 'destructive' });
    } finally {
      setIsSendingGroupMessage(false);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    if (!authUser) return;
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    try {
      await updateDoc(doc(db, 'events', eventId), {
        attendeeIds: event.registered ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
      });
      addCommunityNotification(`You have ${event.registered ? 'unregistered from' : 'registered for'} the event "${event.title}".`);
    } catch (error) {
      console.error('Error updating event registration:', error);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    if (!authUser) return;
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    try {
      await updateDoc(doc(db, 'challenges', challengeId), {
        participantIds: challenge.joined ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
      });
      addCommunityNotification(`You have ${challenge.joined ? 'left' : 'joined'} the challenge "${challenge.title}".`);
    } catch (error) {
      console.error('Error updating challenge participation:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim() || !authUser) return;
    setIsCreatingGroup(true);
    try {
      await addDoc(collection(db, 'groups'), {
        name: newGroup.name,
        description: newGroup.description,
        category: newGroup.category || 'General',
        creatorId: authUser.uid,
        memberIds: [authUser.uid],
        createdAt: serverTimestamp(),
      });
      setNewGroup({ name: '', description: '', category: '' });
      setShowCreateGroup(false);
      addCommunityNotification(`You created a new group "${newGroup.name}".`);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date || !authUser) return;
    setIsCreatingEvent(true);
    try {
      await addDoc(collection(db, 'events'), {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees, 10) : null,
        organizerId: authUser.uid,
        organizerName: currentUser.name,
        attendeeIds: [authUser.uid],
        createdAt: serverTimestamp(),
      });
      setNewEvent({ title: '', description: '', date: '', time: '', location: '', maxAttendees: '' });
      setShowCreateEvent(false);
      addCommunityNotification(`You created a new event "${newEvent.title}".`);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleCreateChallenge = async () => {
    if (!newChallenge.title.trim() || !authUser) return;
    setIsCreatingChallenge(true);
    try {
      await addDoc(collection(db, 'challenges'), {
        title: newChallenge.title,
        description: newChallenge.description,
        category: newChallenge.category || 'General',
        difficulty: newChallenge.difficulty,
        duration: newChallenge.duration,
        reward: newChallenge.reward,
        creatorId: authUser.uid,
        participantIds: [authUser.uid],
        createdAt: serverTimestamp(),
      });
      setNewChallenge({ title: '', description: '', category: '', difficulty: 'Easy', duration: '', reward: '' });
      setShowCreateChallenge(false);
      addCommunityNotification(`You created a new challenge "${newChallenge.title}".`);
    } catch (error) {
      console.error('Error creating challenge:', error);
    } finally {
      setIsCreatingChallenge(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !authUser) return;
    setIsPosting(true);
    try {
      await addDoc(collection(db, 'communityPosts'), {
        authorId: authUser.uid,
        author: {
          name: currentUser.name,
          avatar: currentUser.avatar,
          badge: 'Community Member',
          level: currentUser.level,
        },
        content: newPostContent,
        image: null,
        timestamp: serverTimestamp(),
        likedBy: [],
        bookmarkedBy: [],
        commentList: [],
        shares: 0,
        tags: ['Community'],
      });
      setNewPostContent('');
      setShowCreatePost(false);
      addCommunityNotification('A new post has been created in the Community Hub. Check it out!');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Hash-based so any category string (including ones users type in when creating a group/
  // challenge) gets a consistent, varied color instead of every badge defaulting to the same grey.
  const CATEGORY_COLORS = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-cyan-100 text-cyan-700 border-cyan-200',
    'bg-lime-100 text-lime-700 border-lime-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
  ];
  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-100 text-gray-700 border-gray-200';
    let hash = 0;
    for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
    return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="container mx-auto px-6 pt-28 pb-8 space-y-6">
      <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-900 dark:border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-slate-800 dark:text-slate-200">
            <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Community Hub</span>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">Connect, share, and grow with fellow sustainability champions</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search posts, groups, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-background dark:text-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreatePost(true)} className="bg-green-600 hover:bg-green-700 dark:bg-primary dark:hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <Button variant="outline" className="dark:border-border dark:text-foreground dark:hover:bg-muted">
                <Filter className="w-4 h-4 dark:text-foreground" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCreatePost && (
        <Card className="bg-white border-blue-200 dark:bg-background dark:border-border">
          <CardHeader>
            <CardTitle className="dark:text-foreground">Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Share your sustainability journey, tips, or questions..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[100px] dark:bg-background dark:text-foreground"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreatePost} disabled={isPosting || !newPostContent.trim()} className="bg-green-600 hover:bg-green-700 dark:bg-primary dark:hover:bg-primary/90">
                {isPosting ? 'Posting...' : 'Post'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreatePost(false)} className="dark:border-border dark:text-foreground dark:hover:bg-muted">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-900 dark:border-gray-700">
        <CardContent className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="feed" className="dark:text-foreground">Feed</TabsTrigger>
          <TabsTrigger value="groups" className="dark:text-foreground">Groups</TabsTrigger>
          <TabsTrigger value="events" className="dark:text-foreground">Events</TabsTrigger>
          <TabsTrigger value="challenges" className="dark:text-foreground">Challenges</TabsTrigger>
          <TabsTrigger value="rewards" className="dark:text-foreground">Rewards</TabsTrigger>
          <TabsTrigger value="leaderboard" className="dark:text-foreground">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <div className="space-y-4">
            {posts.filter(post => 
              post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(post => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow dark:bg-card dark:border-border">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold dark:text-foreground">{post.author.name}</span>
                        <Badge variant="secondary" className="text-xs dark:text-foreground">
                          {post.author.badge}
                        </Badge>
                        <Badge variant="outline" className="text-xs dark:text-foreground">
                          {post.author.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(post.timestamp)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-700 dark:text-foreground">{post.content}</p>
                  
                  {post.image && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={post.image} 
                        alt="Post content" 
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs dark:text-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={post.liked ? 'text-red-500' : 'text-gray-600 dark:text-muted-foreground'}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${post.liked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        // onClick={() => {}} // Keep interactive, but handled by input field now
                        className="text-gray-600 dark:text-muted-foreground"
                      >
                         <MessageCircle className="w-4 h-4 mr-1" />
                        {post.comments}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(post.id)}
                        className="text-gray-600 dark:text-muted-foreground"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        {post.shares}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(post.id)}
                        className={post.bookmarked ? 'text-blue-500' : 'text-gray-600 dark:text-muted-foreground'}
                      >
                        <BookmarkPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Input
                      placeholder="Add a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      className="flex-1 dark:bg-background dark:text-foreground"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(post.id)}                      
                    > 
 Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateGroup(true)} className="bg-green-600 hover:bg-green-700 dark:bg-primary dark:hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>

          {showCreateGroup && (
            <Card className="dark:bg-background dark:border-border">
              <CardHeader><CardTitle className="dark:text-foreground">Create New Group</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Group name" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <Input placeholder="Category (e.g. Lifestyle, Energy, Fashion)" value={newGroup.category} onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <Textarea placeholder="Description" value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <div className="flex gap-2">
                  <Button onClick={handleCreateGroup} disabled={isCreatingGroup || !newGroup.name.trim()} className="bg-green-600 hover:bg-green-700">
                    {isCreatingGroup ? 'Creating...' : 'Create'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateGroup(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.filter(group =>
              group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              group.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(group => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <Badge variant="outline" className={`text-xs mt-1 ${getCategoryColor(group.category)}`}>{group.category}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 pt-2">{group.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{group.members.toLocaleString()} member{group.members === 1 ? '' : 's'}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleJoinGroup(group.id)}
                      className={`flex-1 ${group.joined
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {group.joined ? 'Joined' : 'Join Group'}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setSelectedGroup(group)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Open Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {groups.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-muted-foreground">
                No groups yet. Be the first to create one!
              </div>
            )}
          </div>

          {/* Group Chat - a real, live discussion feed for the opened group instead of a
              dead-end join/leave card. */}
          {selectedGroup && (
            <Card className="dark:bg-background dark:border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="dark:text-foreground">{selectedGroup.name} - Group Chat</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground">
                    {selectedGroup.members.toLocaleString()} member{selectedGroup.members === 1 ? '' : 's'}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedGroup(null)} className="dark:text-foreground">✕</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-80 overflow-y-auto space-y-3 border rounded-lg p-4 bg-gray-50/50 dark:bg-muted/30 dark:border-border">
                  {groupMessages.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-muted-foreground text-center py-8">
                      No messages yet - say something to get the conversation started!
                    </p>
                  )}
                  {groupMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={msg.authorAvatar} alt={msg.authorName} />
                        <AvatarFallback>{(msg.authorName || '?').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium dark:text-foreground">{msg.authorName}</span>
                          <span className="text-xs text-gray-400 dark:text-muted-foreground">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-muted-foreground">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {authUser ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a message..."
                      value={newGroupMessage}
                      onChange={(e) => setNewGroupMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isSendingGroupMessage && handleSendGroupMessage()}
                      className="dark:bg-background dark:text-foreground"
                    />
                    <Button onClick={handleSendGroupMessage} disabled={isSendingGroupMessage || !newGroupMessage.trim()} className="bg-green-600 hover:bg-green-700">
                      Send
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-muted-foreground text-center">Log in to join the conversation.</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateEvent(true)} className="bg-green-600 hover:bg-green-700 dark:bg-primary dark:hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>

          {showCreateEvent && (
            <Card className="dark:bg-background dark:border-border">
              <CardHeader><CardTitle className="dark:text-foreground">Create New Event</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Event title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <Textarea placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="dark:bg-background dark:text-foreground" />
                  <Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="dark:bg-background dark:text-foreground" />
                </div>
                <Input placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <Input type="number" min="1" placeholder="Max attendees (optional)" value={newEvent.maxAttendees} onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <div className="flex gap-2">
                  <Button onClick={handleCreateEvent} disabled={isCreatingEvent || !newEvent.title.trim() || !newEvent.date} className="bg-green-600 hover:bg-green-700">
                    {isCreatingEvent ? 'Creating...' : 'Create'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateEvent(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.filter(event =>
              event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              event.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                  </div>
                  <p className="text-sm text-gray-600 pt-2">{event.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{event.date}</span>
                    {event.time && <><Clock className="w-4 h-4 text-gray-500 ml-2" /><span>{event.time}</span></>}
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{event.attendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''} attending</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.organizer}
                    </Badge>
                  </div>

                  {event.maxAttendees && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((event.attendees / event.maxAttendees) * 100, 100)}%` }}
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => handleRegisterEvent(event.id)}
                    disabled={!!event.maxAttendees && !event.registered && event.attendees >= event.maxAttendees}
                    className={`w-full ${event.registered
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {event.registered ? 'Registered' : 'Register'}
                  </Button>
                </CardContent>
              </Card>
            ))}
            {events.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-muted-foreground">
                No events yet. Be the first to create one!
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateChallenge(true)} className="bg-green-600 hover:bg-green-700 dark:bg-primary dark:hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </div>

          {showCreateChallenge && (
            <Card className="dark:bg-background dark:border-border">
              <CardHeader><CardTitle className="dark:text-foreground">Create New Challenge</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Challenge title" value={newChallenge.title} onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <Textarea placeholder="Description" value={newChallenge.description} onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Category" value={newChallenge.category} onChange={(e) => setNewChallenge({ ...newChallenge, category: e.target.value })} className="dark:bg-background dark:text-foreground" />
                  <select
                    value={newChallenge.difficulty}
                    onChange={(e) => setNewChallenge({ ...newChallenge, difficulty: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Duration (e.g. 30 days)" value={newChallenge.duration} onChange={(e) => setNewChallenge({ ...newChallenge, duration: e.target.value })} className="dark:bg-background dark:text-foreground" />
                  <Input placeholder="Reward (e.g. 500 Green Points)" value={newChallenge.reward} onChange={(e) => setNewChallenge({ ...newChallenge, reward: e.target.value })} className="dark:bg-background dark:text-foreground" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateChallenge} disabled={isCreatingChallenge || !newChallenge.title.trim()} className="bg-green-600 hover:bg-green-700">
                    {isCreatingChallenge ? 'Creating...' : 'Create'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateChallenge(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.filter(challenge =>
              challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(challenge => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{challenge.participants.toLocaleString()} participant{challenge.participants === 1 ? '' : 's'}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getCategoryColor(challenge.category)}`}>
                      {challenge.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{challenge.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span>{challenge.reward}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleJoinChallenge(challenge.id)}
                    className={`w-full ${challenge.joined
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {challenge.joined ? 'Joined' : 'Join Challenge'}
                  </Button>
                </CardContent>
              </Card>
            ))}
            {challenges.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-muted-foreground">
                No challenges yet. Be the first to create one!
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card className="bg-white text-slate-900 border border-slate-200 shadow-xl dark:bg-background dark:text-foreground dark:border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{userStats.totalPoints.toLocaleString()} Points</h2>
                  <div className="flex items-center space-x-4 text-slate-700 dark:text-muted-foreground">
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Level {currentLevel + 1}</span>
                  <span>{nextLevelThreshold ? `${nextLevelThreshold - userStats.totalPoints} points to go` : 'Max Level!'}</span>
                </div>
                <Progress value={levelProgress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Today's Challenges</span>
                  </div>
                  <Badge variant="outline">{getCompletedChallenges()}/{dailyChallenges.length} Complete</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyChallenges.map((challenge, index) => (
                  <div key={index} className={`rounded-lg p-4 ${challenge.completed ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700' : 'bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {challenge.completed && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                        <span className="font-medium">{challenge.task}</span>
                      </div>
                      <Badge variant="secondary">+{challenge.points}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={(challenge.progress / challenge.total) * 100} className="flex-1 h-2" />
                      <span className="text-sm text-slate-600 dark:text-muted-foreground">{challenge.progress}/{challenge.total}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-4 rounded-lg border ${achievement.unlocked ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${achievement.color} rounded-xl flex items-center justify-center ${!achievement.unlocked && 'opacity-50'}`}>
                        <achievement.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <Badge variant="outline" className="text-xs">{achievement.category}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-muted-foreground">{achievement.description}</p>
                        {!achievement.unlocked && achievement.progress !== undefined && (
                          <Progress value={achievement.progress} className="h-1.5 mt-2" />
                        )}
                      </div>
                      <Badge>+{achievement.points}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gift className="w-5 h-5" />
                  <span>Rewards Store</span>
                </div>
                <Badge variant="outline">{rewardsCatalog.filter(r => r.available).length} Available</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userStats.totalPoints < 150 ? (
                <div className="text-center py-12">
                  <Gift className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-3">Start earning rewards!</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">Complete challenges and track your sustainability journey to unlock amazing rewards.</p>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
                    <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Next reward unlocks at 150 points!</strong> You need {150 - userStats.totalPoints} more points.</p>
                    <Progress value={(userStats.totalPoints / 150) * 100} className="h-2 mt-3" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewardsCatalog.map((reward) => (
                    <div key={reward.id} className={`p-6 rounded-xl border ${reward.available ? 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700' : 'bg-slate-50 border-slate-200 opacity-75 dark:bg-slate-900 dark:border-slate-700'}`}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <reward.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{reward.name}</h3>
                          <Badge variant="outline" className="text-xs mt-1">{reward.category}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-muted-foreground mb-3">{reward.description}</p>
                      <div className="text-xs text-slate-500 dark:text-muted-foreground mb-4">{reward.savings}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold">{reward.cost}</span>
                        </div>
                        <Button
                          size="sm"
                          disabled={!reward.available}
                          onClick={() => handleRedeemReward(reward)}
                        >
                          {reward.available ? 'Redeem' : `Need ${reward.cost - userStats.totalPoints}`}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Community Leaderboard
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Top contributors by points
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData.map((user) => (
                    <div
                      key={user.uid}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        user.uid === authUser?.uid
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border">
                        <span className={`text-sm font-bold ${
                          user.rank === 1 ? 'text-yellow-600' :
                          user.rank === 2 ? 'text-gray-600' :
                          user.rank === 3 ? 'text-amber-600' :
                          'text-gray-800'
                        }`}>
                          {user.rank}
                        </span>
                      </div>

                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{user.name}</span>
                          {user.uid === authUser?.uid && (
                            <Badge variant="default" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          <span>{user.points.toLocaleString()} points</span>
                        </div>
                      </div>

                      {user.rank <= 3 && (
                        <div className="flex items-center">
                          {user.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                          {user.rank === 2 && <Award className="w-5 h-5 text-gray-500" />}
                          {user.rank === 3 && <Award className="w-5 h-5 text-amber-600" />}
                        </div>
                      )}
                    </div>
                  ))}
                  {leaderboardData.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                      No leaderboard data yet. Start earning points to appear here!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </CardContent>
      </Card>
    </div>
 );
}
export default CommunityHub;