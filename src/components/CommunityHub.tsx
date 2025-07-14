import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
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
  Flag,
  Calendar,
  MapPin,
  Clock,
  Award,
  Zap
} from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { useNotificationHelper } from '../hooks/useNotificationHelper';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  addDoc,
} from 'firebase/firestore';

const CommunityHub = () => {
  const { userStats, loading } = useUserData();
  const { addCommunityNotification } = useNotificationHelper();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);

  const userId = currentUser?.uid || null;

  // Firestore collection references
  const userDocRef = userId ? doc(db, 'users', userId) : null;

  // Initialize default data
  useEffect(() => {
    if (!userId) return;

    // Initialize default groups
    const defaultGroups = [
      {
        id: 'group1',
        name: 'Zero Waste Living',
        description: 'Tips and tricks for reducing waste in daily life',
        members: 12543,
        category: 'Lifestyle',
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=200&fit=crop',
        joined: true,
        posts: 1234,
        activity: 'Very Active'
      },
      {
        id: 'group2',
        name: 'Renewable Energy Enthusiasts',
        description: 'Discussing solar, wind, and other clean energy solutions',
        members: 8967,
        category: 'Energy',
        image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=200&fit=crop',
        joined: false,
        posts: 2345,
        activity: 'Active'
      },
      {
        id: 'group3',
        name: 'Sustainable Fashion',
        description: 'Ethical clothing choices and eco-friendly fashion',
        members: 15678,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=200&fit=crop',
        joined: true,
        posts: 3456,
        activity: 'Very Active'
      },
      {
        id: 'group4',
        name: 'Urban Gardening',
        description: 'Growing your own food in small spaces',
        members: 9876,
        category: 'Gardening',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop',
        joined: false,
        posts: 1876,
        activity: 'Moderate'
      }
    ];

    const defaultEvents = [
      {
        id: 'event1',
        title: 'Community Solar Workshop',
        description: 'Learn about community solar programs and how to join',
        date: '2024-07-15',
        time: '2:00 PM',
        location: 'Community Center',
        attendees: 45,
        maxAttendees: 100,
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=200&fit=crop',
        organizer: 'Green Energy Group',
        registered: false
      },
      {
        id: 'event2',
        title: 'Zero Waste Cooking Class',
        description: 'Learn to cook delicious meals with minimal waste',
        date: '2024-07-20',
        time: '6:00 PM',
        location: 'Eco Kitchen Studio',
        attendees: 28,
        maxAttendees: 30,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop',
        organizer: 'Zero Waste Community',
        registered: true
      },
      {
        id: 'event3',
        title: 'Urban Farming Meetup',
        description: 'Connect with local urban farmers and learn techniques',
        date: '2024-07-25',
        time: '10:00 AM',
        location: 'City Park',
        attendees: 67,
        maxAttendees: 80,
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop',
        organizer: 'Urban Gardening Network',
        registered: false
      }
    ];

    const defaultChallenges = [
      {
        id: 'challenge1',
        title: '30-Day Plastic Free Challenge',
        description: 'Eliminate single-use plastics for 30 days',
        participants: 1234,
        duration: '30 days',
        difficulty: 'Medium',
        reward: '500 Green Points',
        progress: 65,
        joined: true,
        category: 'Zero Waste'
      },
      {
        id: 'challenge2',
        title: 'Energy Saver Week',
        description: 'Reduce energy consumption by 20% for one week',
        participants: 876,
        duration: '7 days',
        difficulty: 'Easy',
        reward: '200 Green Points',
        progress: 0,
        joined: false,
        category: 'Energy'
      },
      {
        id: 'challenge3',
        title: 'Bike to Work Month',
        description: 'Use bicycle for daily commuting for a month',
        participants: 543,
        duration: '30 days',
        difficulty: 'Hard',
        reward: '800 Green Points',
        progress: 23,
        joined: true,
        category: 'Transportation'
      }
    ];

    // Initialize default posts based on user stats
    const getDefaultPosts = () => {
      const basePosts = [
        {
          id: 'post1',
          author: {
            name: 'Sarah Green',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
            badge: 'Eco Champion',
            level: 'Expert'
          },
          content: 'Just switched to a bamboo toothbrush and love it! Small changes make a big difference. What sustainable swaps have you made recently?',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 24,
          comments: 8,
          shares: 3,
          tags: ['Zero Waste', 'Personal Care', 'Sustainability'],
          liked: false,
          bookmarked: false
        }
      ];

      if (userStats.totalScans > 5) {
        basePosts.push({
          id: 'post2',
          author: {
            name: 'Mike Rodriguez',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            badge: 'Solar Advocate',
            level: 'Pro'
          },
          content: `Amazing to see so many active eco warriors! I've scanned ${userStats.totalScans} products this week. Keep it up everyone!`,
          image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likes: 67,
          comments: 15,
          shares: 12,
          tags: ['Community', 'Product Scanning', 'Motivation'],
          liked: true,
          bookmarked: true
        });
      }

      if (userStats.co2Saved > 10) {
        basePosts.push({
          id: 'post3',
          author: {
            name: 'Emma Thompson',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
            badge: 'Climate Activist',
            level: 'Master'
          },
          content: `Celebrating everyone who's making a difference! Together we've saved tons of CO₂. Your ${userStats.co2Saved}kg contribution matters!`,
          image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400&h=300&fit=crop',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          likes: 89 + Math.floor(userStats.co2Saved || 0),
          comments: 23,
          shares: 18,
          tags: ['Climate Action', 'Carbon Reduction', 'Community Impact'],
          liked: false,
          bookmarked: false
        });
      }

      return basePosts;
    };

    // Set default data
    setGroups(defaultGroups);
    setEvents(defaultEvents);
    setChallenges(defaultChallenges);
    setPosts(getDefaultPosts());
  }, [userStats]);

  useEffect(() => {
    if (!userId) return;

    const postsRef = collection(userDocRef, 'posts');
    const unsubscribePosts = onSnapshot(postsRef, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(prevPosts => [...prevPosts, ...postsData]);
    });

    const groupsRef = collection(userDocRef, 'groups');
    const unsubscribeGroups = onSnapshot(groupsRef, (snapshot) => {
      const groupsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (groupsData.length > 0) {
        setGroups(groupsData);
      }
    });

    const eventsRef = collection(userDocRef, 'events');
    const unsubscribeEvents = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (eventsData.length > 0) {
        setEvents(eventsData);
      }
    });

    const challengesRef = collection(userDocRef, 'challenges');
    const unsubscribeChallenges = onSnapshot(challengesRef, (snapshot) => {
      const challengesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (challengesData.length > 0) {
        setChallenges(challengesData);
      }
    });

    return () => {
      unsubscribePosts();
      unsubscribeGroups();
      unsubscribeEvents();
      unsubscribeChallenges();
    };
  }, [userId]);

  const handleLike = async (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Update local state immediately
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));

    // If it's a Firebase post, update Firebase
    if (userDocRef && post.id.startsWith('post') === false) {
      const postRef = doc(userDocRef, 'posts', postId);
      const updatedLikes = post.liked ? post.likes - 1 : post.likes + 1;
      try {
        await updateDoc(postRef, {
          liked: !post.liked,
          likes: updatedLikes,
        });
      } catch (error) {
        console.error('Error updating like:', error);
      }
    }

    if (!post.liked) {
      addCommunityNotification(`You liked "${post.author.name}'s" post about sustainability!`);
      toast({
        title: 'Post Liked!',
        description: 'Your engagement helps build our community.',
      });
    }
  };

  const handleComment = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      addCommunityNotification(`You commented on "${post.author.name}'s" post. Join the conversation!`);
      toast({
        title: 'Comment Added!',
        description: 'Your comment helps spark meaningful discussions.',
      });
    }
  };

  const handleShare = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post && navigator.share) {
      navigator.share({
        title: `Post by ${post.author.name}`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied!',
        description: 'Post link copied to clipboard.',
      });
    }
  };

  const handleBookmark = async (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Update local state
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, bookmarked: !p.bookmarked }
        : p
    ));

    // If it's a Firebase post, update Firebase
    if (userDocRef && post.id.startsWith('post') === false) {
      const postRef = doc(userDocRef, 'posts', postId);
      try {
        await updateDoc(postRef, {
          bookmarked: !post.bookmarked,
        });
      } catch (error) {
        console.error('Error updating bookmark:', error);
      }
    }

    toast({
      title: post.bookmarked ? 'Bookmark Removed' : 'Post Bookmarked!',
      description: post.bookmarked ? 'Removed from your saved posts.' : 'Saved to your bookmarks.',
    });
  };

  const handleFlag = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      toast({
        title: 'Post Reported',
        description: 'Thank you for helping keep our community safe.',
      });
    }
  };

  const handleJoinGroup = async (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    // Update local state
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 }
        : g
    ));

    // If it's a Firebase group, update Firebase
    if (userDocRef && group.id.startsWith('group') === false) {
      const groupRef = doc(userDocRef, 'groups', groupId);
      const updatedJoined = !group.joined;
      const updatedMembers = updatedJoined ? group.members + 1 : group.members - 1;
      try {
        await updateDoc(groupRef, {
          joined: updatedJoined,
          members: updatedMembers,
        });
      } catch (error) {
        console.error('Error updating group join status:', error);
      }
    }

    if (!group.joined) {
      addCommunityNotification(`You joined the "${group.name}" group! Connect with like-minded people.`);
      toast({
        title: 'Group Joined!',
        description: `Welcome to ${group.name}. Start connecting with ${group.members} members.`,
      });
    } else {
      toast({
        title: 'Left Group',
        description: `You've left ${group.name}.`,
      });
    }
  };

  const handleRegisterEvent = async (eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    // Update local state
    setEvents(events.map(e =>
      e.id === eventId
        ? { ...e, registered: !e.registered, attendees: e.registered ? e.attendees - 1 : e.attendees + 1 }
        : e
    ));

    // If it's a Firebase event, update Firebase
    if (userDocRef && event.id.startsWith('event') === false) {
      const eventRef = doc(userDocRef, 'events', eventId);
      const updatedRegistered = !event.registered;
      const updatedAttendees = updatedRegistered ? event.attendees + 1 : event.attendees - 1;
      try {
        await updateDoc(eventRef, {
          registered: updatedRegistered,
          attendees: updatedAttendees,
        });
      } catch (error) {
        console.error('Error updating event registration:', error);
      }
    }

    if (!event.registered) {
      addCommunityNotification(`You registered for "${event.title}"! Don't forget to attend on ${event.date}.`);
      toast({
        title: 'Event Registration Successful!',
        description: `You're registered for ${event.title}. See you on ${event.date}!`,
      });
    } else {
      toast({
        title: 'Registration Cancelled',
        description: `You've unregistered from ${event.title}.`,
      });
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    // Update local state
    setChallenges(challenges.map(c =>
      c.id === challengeId
        ? { ...c, joined: !c.joined, participants: c.joined ? c.participants - 1 : c.participants + 1 }
        : c
    ));

    // If it's a Firebase challenge, update Firebase
    if (userDocRef && challenge.id.startsWith('challenge') === false) {
      const challengeRef = doc(userDocRef, 'challenges', challengeId);
      const updatedJoined = !challenge.joined;
      const updatedParticipants = updatedJoined ? challenge.participants + 1 : challenge.participants - 1;
      try {
        await updateDoc(challengeRef, {
          joined: updatedJoined,
          participants: updatedParticipants,
        });
      } catch (error) {
        console.error('Error updating challenge join status:', error);
      }
    }

    if (!challenge.joined) {
      addCommunityNotification(`You joined the "${challenge.title}" challenge! Start making a difference today.`);
      toast({
        title: 'Challenge Joined!',
        description: `You're now part of ${challenge.title}. Good luck making a positive impact!`,
      });
    } else {
      toast({
        title: 'Challenge Left',
        description: `You've left ${challenge.title}.`,
      });
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    const newPost = {
      author: {
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        badge: 'Community Member',
        level: 'Beginner',
      },
      content: newPostContent,
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop',
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      tags: ['Community'],
      liked: false,
      bookmarked: false,
    };

    try {
      if (userDocRef) {
        const postsRef = collection(userDocRef, 'posts');
        await addDoc(postsRef, newPost);
      } else {
        // If no user, just add to local state
        setPosts([{ ...newPost, id: Date.now().toString() }, ...posts]);
      }

      setNewPostContent('');
      setShowCreatePost(false);
      addCommunityNotification('Your post has been shared with the community! Engage with others to build connections.');
      toast({
        title: 'Post Created!',
        description: 'Your post is now live in the community feed.',
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-green-600" />
            <span>Community Hub</span>
          </CardTitle>
          <p className="text-gray-600">Connect, share, and grow with fellow sustainability champions</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search posts, groups, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreatePost(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <Button variant="outline" onClick={() => toast({ title: "Filter Options", description: "Advanced filtering coming soon!" })}>
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCreatePost && (
        <Card className="bg-white border-blue-200">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Share your sustainability journey, tips, or questions..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreatePost} className="bg-green-600 hover:bg-green-700">
                Post
              </Button>
              <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{post.author.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {post.author.badge}
                      </Badge>
                      <Badge className="text-xs bg-blue-100 text-blue-700">
                        {post.author.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{formatTimestamp(post.timestamp)}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{post.content}</p>

                {post.image && (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={post.liked ? 'text-red-600' : 'text-gray-600'}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${post.liked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => handleComment(post.id)}>
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => handleShare(post.id)}>
                      <Share2 className="w-4 h-4 mr-1" />
                      {post.shares}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBookmark(post.id)}
                      className={post.bookmarked ? 'text-blue-600' : 'text-gray-600'}
                    >
                      <BookmarkPlus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => handleFlag(post.id)}>
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={group.image}
                      alt={group.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {group.category}
                        </Badge>
                        <Badge className={`text-xs ${getActivityColor(group.activity)}`}>
                          {group.activity}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {group.members.toLocaleString()} members
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {group.posts} posts
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinGroup(group.id)}
                    className={`w-full ${
                      group.joined
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {group.joined ? 'Joined' : 'Join Group'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      {event.attendees}/{event.maxAttendees} attending
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Capacity</span>
                      <span>{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">by {event.organizer}</span>
                    <Button
                      onClick={() => handleRegisterEvent(event.id)}
                      size="sm"
                      className={`${
                        event.registered
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {event.registered ? 'Registered' : 'Register'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
                    </div>
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{challenge.participants}</div>
                      <div className="text-sm text-gray-500">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{challenge.duration}</div>
                      <div className="text-sm text-gray-500">Duration</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {challenge.category}
                    </Badge>
                    <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Reward</span>
                      <span className="font-semibold text-green-600">{challenge.reward}</span>
                    </div>
                  </div>

                  {challenge.joined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{challenge.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${challenge.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleJoinChallenge(challenge.id)}
                    className={`w-full ${
                      challenge.joined
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {challenge.joined ? 'Joined' : 'Join Challenge'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Top Contributors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Sarah Green', points: 2845, rank: 1, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face' },
                    { name: 'Mike Rodriguez', points: 2634, rank: 2, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
                    { name: 'Emma Thompson', points: 2456, rank: 3, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
                    { name: 'Alex Chen', points: 2234, rank: 4, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
                    { name: 'Lisa Johnson', points: 2156, rank: 5, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face' }
                  ].map((user) => (
                    <div key={user.rank} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-bold">
                        {user.rank}
                      </div>
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.points} points</div>
                      </div>
                      {user.rank <= 3 && (
                        <Star className={`w-5 h-5 ${user.rank === 1 ? 'text-yellow-500' : user.rank === 2 ? 'text-gray-400' : 'text-amber-600'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span>Challenge Leaders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Zero Waste Warriors', members: 1234, challenges: 15, category: 'Zero Waste' },
                    { name: 'Solar Champions', members: 987, challenges: 12, category: 'Energy' },
                    { name: 'Eco Transport', members: 876, challenges: 18, category: 'Transportation' },
                    { name: 'Green Builders', members: 765, challenges: 9, category: 'Construction' },
                    { name: 'Sustainable Fashion', members: 654, challenges: 14, category: 'Fashion' }
                  ].map((team, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{team.name}</div>
                        <div className="text-sm text-gray-500">{team.members} members • {team.challenges} challenges</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {team.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-green-500" />
                <span>Recent Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Plastic-Free Champion', description: 'Completed 30-day plastic-free challenge', user: 'Sarah Green', time: '2 hours ago' },
                  { title: 'Solar Advocate', description: 'Convinced 10 neighbors to install solar panels', user: 'Mike Rodriguez', time: '5 hours ago' },
                  { title: 'Zero Waste Master', description: 'Reduced waste by 95% for 3 months', user: 'Emma Thompson', time: '1 day ago' },
                  { title: 'Community Leader', description: 'Organized 5 sustainability events', user: 'Alex Chen', time: '2 days ago' },
                  { title: 'Eco Educator', description: 'Taught 50 people about sustainability', user: 'Lisa Johnson', time: '3 days ago' },
                  { title: 'Green Commuter', description: 'Biked to work for 100 days straight', user: 'David Park', time: '1 week ago' }
                ].map((achievement, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <h3 className="font-semibold text-sm">{achievement.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-green-600">{achievement.user}</span>
                      <span className="text-xs text-gray-500">{achievement.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Helper functions
  function getDifficultyColor(difficulty) {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  function getActivityColor(activity) {
    switch (activity) {
      case 'Very Active': return 'bg-green-100 text-green-700';
      case 'Active': return 'bg-blue-100 text-blue-700';
      case 'Moderate': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  }

  // Initialize with sample data
  React.useEffect(() => {
    setPosts([
      {
        id: 'post1',
        author: {
          name: 'Sarah Green',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
          badge: 'Eco Champion',
          level: 'Expert'
        },
        content: 'Just switched to a bamboo toothbrush and love it! Small changes make a big difference. What sustainable swaps have you made recently?',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 24,
        comments: 8,
        shares: 3,
        tags: ['Zero Waste', 'Personal Care', 'Sustainability'],
        liked: false,
        bookmarked: false
      },
      {
        id: 'post2',
        author: {
          name: 'Mike Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          badge: 'Solar Advocate',
          level: 'Pro'
        },
        content: 'Amazing to see so many active eco warriors! Keep up the great work everyone!',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 67,
        comments: 15,
        shares: 12,
        tags: ['Community', 'Motivation'],
        liked: true,
        bookmarked: true
      }
    ]);

    setGroups([
      {
        id: 'group1',
        name: 'Zero Waste Living',
        description: 'Tips and tricks for reducing waste in daily life',
        members: 12543,
        category: 'Lifestyle',
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=200&fit=crop',
        joined: true,
        posts: 1234,
        activity: 'Very Active'
      },
      {
        id: 'group2',
        name: 'Renewable Energy Enthusiasts',
        description: 'Discussing solar, wind, and other clean energy solutions',
        members: 8967,
        category: 'Energy',
        image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=200&fit=crop',
        joined: false,
        posts: 2345,
        activity: 'Active'
      }
    ]);

    setEvents([
      {
        id: 'event1',
        title: 'Community Solar Workshop',
        description: 'Learn about community solar programs and how to join',
        date: '2024-07-15',
        time: '2:00 PM',
        location: 'Community Center',
        attendees: 45,
        maxAttendees: 100,
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=200&fit=crop',
        organizer: 'Green Energy Group',
        registered: false
      }
    ]);

    setChallenges([
      {
        id: 'challenge1',
        title: '30-Day Plastic Free Challenge',
        description: 'Eliminate single-use plastics for 30 days',
        participants: 1234,
        duration: '30 days',
        difficulty: 'Medium',
        reward: '500 Green Points',
        progress: 65,
        joined: true,
        category: 'Zero Waste'
      }
    ]);
  }, []);
};

export default CommunityHub;