import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Eye,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';
import { useNotificationHelper } from '@/hooks/useNotificationHelper';
import { useToast } from '@/hooks/use-toast';

const CommunityHub = () => {
  const { userStats } = useUserData();
  const { addCommunityNotification } = useNotificationHelper();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState(() => {
    const basePosts = [
      {
        id: 1,
        author: {
          name: 'Sarah Green',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
          badge: 'Eco Champion',
          level: 'Expert'
        },
        content: 'Just switched to a bamboo toothbrush and love it! Small changes make a big difference. What sustainable swaps have you made recently?',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        timestamp: '2 hours ago',
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
        id: 2,
        author: {
          name: 'Mike Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          badge: 'Solar Advocate',
          level: 'Pro'
        },
        content: `Amazing to see so many active eco warriors! I've scanned ${userStats.totalScans} products this week. Keep it up everyone!`,
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
        timestamp: '4 hours ago',
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
        id: 3,
        author: {
          name: 'Emma Thompson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
          badge: 'Climate Activist',
          level: 'Master'
        },
        content: `Celebrating everyone who's making a difference! Together we've saved tons of CO₂. Your ${userStats.co2Saved}kg contribution matters!`,
        image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400&h=300&fit=crop',
        timestamp: '1 day ago',
        likes: 89 + Math.floor(userStats.co2Saved),
        comments: 23,
        shares: 18,
        tags: ['Climate Action', 'Carbon Reduction', 'Community Impact'],
        liked: false,
        bookmarked: false
      });
    }

    return basePosts;
  });

  const [groups, setGroups] = useState([
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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
      id: 4,
      name: 'Urban Gardening',
      description: 'Growing your own food in small spaces',
      members: 9876,
      category: 'Gardening',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop',
      joined: false,
      posts: 1876,
      activity: 'Moderate'
    }
  ]);

  const [events, setEvents] = useState([
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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
  ]);

  const [challenges, setChallenges] = useState([
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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
  ]);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
    
    const post = posts.find(p => p.id === postId);
    if (post && !post.liked) {
      addCommunityNotification(`You liked "${post.author.name}'s" post about sustainability!`);
      toast({
        title: "Post Liked!",
        description: "Your engagement helps build our community.",
      });
    }
  };

  const handleComment = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      addCommunityNotification(`You commented on "${post.author.name}'s" post. Join the conversation!`);
      toast({
        title: "Comment Added!",
        description: "Your comment helps spark meaningful discussions.",
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
        title: "Link Copied!",
        description: "Post link copied to clipboard.",
      });
    }
  };

  const handleBookmark = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, bookmarked: !post.bookmarked }
        : post
    ));
    
    const post = posts.find(p => p.id === postId);
    if (post) {
      toast({
        title: post.bookmarked ? "Bookmark Removed" : "Post Bookmarked!",
        description: post.bookmarked ? "Removed from your saved posts." : "Saved to your bookmarks.",
      });
    }
  };

  const handleFlag = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      toast({
        title: "Post Reported",
        description: "Thank you for helping keep our community safe.",
      });
    }
  };

  const handleJoinGroup = (groupId) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, joined: !group.joined, members: group.joined ? group.members - 1 : group.members + 1 }
        : group
    ));
    
    const group = groups.find(g => g.id === groupId);
    if (group) {
      if (!group.joined) {
        addCommunityNotification(`You joined the "${group.name}" group! Connect with like-minded people.`);
        toast({
          title: "Group Joined!",
          description: `Welcome to ${group.name}. Start connecting with ${group.members} members.`,
        });
      } else {
        toast({
          title: "Left Group",
          description: `You've left ${group.name}.`,
        });
      }
    }
  };

  const handleRegisterEvent = (eventId) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, registered: !event.registered, attendees: event.registered ? event.attendees - 1 : event.attendees + 1 }
        : event
    ));
    
    const event = events.find(e => e.id === eventId);
    if (event) {
      if (!event.registered) {
        addCommunityNotification(`You registered for "${event.title}"! Don't forget to attend on ${event.date}.`);
        toast({
          title: "Event Registration Successful!",
          description: `You're registered for ${event.title}. See you on ${event.date}!`,
        });
      } else {
        toast({
          title: "Registration Cancelled",
          description: `You've unregistered from ${event.title}.`,
        });
      }
    }
  };

  const handleJoinChallenge = (challengeId) => {
    setChallenges(challenges.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, joined: !challenge.joined, participants: challenge.joined ? challenge.participants - 1 : challenge.participants + 1 }
        : challenge
    ));
    
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      if (!challenge.joined) {
        addCommunityNotification(`You joined the "${challenge.title}" challenge! Start making a difference today.`);
        toast({
          title: "Challenge Joined!",
          description: `You're now part of ${challenge.title}. Good luck making a positive impact!`,
        });
      } else {
        toast({
          title: "Challenge Left",
          description: `You've left ${challenge.title}.`,
        });
      }
    }
  };

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      const newPost = {
        id: posts.length + 1,
        author: {
          name: 'You',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          badge: 'Community Member',
          level: 'Beginner'
        },
        content: newPostContent,
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop',
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        shares: 0,
        tags: ['Community'],
        liked: false,
        bookmarked: false
      };
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setShowCreatePost(false);
      
      addCommunityNotification('Your post has been shared with the community! Engage with others to build connections.');
      toast({
        title: "Post Created!",
        description: "Your post is now live in the community feed.",
      });
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

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'Very Active': return 'bg-green-100 text-green-700';
      case 'Active': return 'bg-blue-100 text-blue-700';
      case 'Moderate': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
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

      {/* Create Post Modal */}
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
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
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
                <div className="relative">
                  <img 
                    src={group.image} 
                    alt={group.name}
                    className="w-full h-32 object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-white/90 text-gray-700">
                    {group.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{group.members.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{group.posts}</span>
                        </div>
                      </div>
                      <Badge className={getActivityColor(group.activity)} variant="outline">
                        {group.activity}
                      </Badge>
                    </div>

                    <Button 
                      className="w-full"
                      variant={group.joined ? "outline" : "default"}
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      {group.joined ? 'Leave Group' : 'Join Group'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Organized by {event.organizer}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-2">
                            {event.attendees}/{event.maxAttendees} attending
                          </div>
                          <Button
                            variant={event.registered ? "outline" : "default"}
                            onClick={() => handleRegisterEvent(event.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {event.registered ? 'Unregister' : 'Register'}
                          </Button>
                        </div>
                      </div>
                    </div>
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
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{challenge.title}</h3>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
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

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{challenge.participants}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{challenge.duration}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <Trophy className="w-3 h-3 mr-1" />
                        {challenge.reward}
                      </Badge>
                    </div>

                    <Button 
                      className="w-full"
                      variant={challenge.joined ? "outline" : "default"}
                      onClick={() => handleJoinChallenge(challenge.id)}
                    >
                      {challenge.joined ? 'Leave Challenge' : 'Join Challenge'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Top Contributors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Emma Thompson', points: 2456, badge: 'Climate Hero', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
                    { name: 'Sarah Green', points: 2234, badge: 'Eco Champion', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face' },
                    { name: 'Mike Rodriguez', points: 2001, badge: 'Solar Advocate', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
                    { name: 'You', points: userStats.totalPoints || 456, badge: 'Rising Star', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' }
                  ].map((user, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-600">#{index + 1}</div>
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.badge}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{user.points}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: 'First Scan Complete', user: 'You', time: '2 hours ago', points: 50 },
                    { title: 'Eco Warrior', user: 'Sarah Green', time: '1 day ago', points: 200 },
                    { title: 'Solar Pioneer', user: 'Mike Rodriguez', time: '2 days ago', points: 500 },
                    { title: 'Community Builder', user: 'Emma Thompson', time: '3 days ago', points: 300 }
                  ].map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{achievement.title}</div>
                        <div className="text-sm text-gray-600">{achievement.user} • {achievement.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">+{achievement.points}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityHub;
