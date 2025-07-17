import React, { useState, useEffect } from 'react';
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
  Calendar,
  MapPin,
  Clock,
  Award,
  Zap,
  Leaf,
  Target,
  TrendingUp
} from 'lucide-react';

import { useNotificationHelperNew } from '../hooks/useNotificationHelperNew';

const CommunityHub = () => {
  const { addCommunityNotification } = useNotificationHelperNew();

  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});

  // Mock current user data
  const currentUser = {
    name: 'You',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    points: 1845,
    level: 'Intermediate',
    totalScans: 127,
    co2Saved: 23.5,
    challengesCompleted: 8,
    postsLiked: 89,
    groupsJoined: 5,
    eventsAttended: 12
  };

  useEffect(() => {
    setCommentInputs(posts.reduce((acc, post) => ({ ...acc, [post.id]: '' }), {}));
  }, [posts]);

  // Initialize with enhanced sample data
  useEffect(() => {
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
        commentList: [
          {
            author: { name: 'GreenGuru', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
            content: 'Totally agree! Bamboo is a game-changer.'
          },
          {
            author: { name: 'EcoWarrior77', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
            content: 'I switched to a reusable water bottle. Best decision!'
          }

        ],
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
        content: 'Amazing to see so many active eco warriors! Keep up the great work everyone! 🌱',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 67,
        comments: 15,
        commentList: [
          {
            author: { name: 'SustainableSam', avatar: 'https://randomuser.me/api/portraits/men/55.jpg' },
            content: 'Inspired by this community!'
          },
          {
            author: { name: 'NatureLover', avatar: 'https://randomuser.me/api/portraits/women/66.jpg' },
            content: 'Keep up the good vibes!'
          }
        ],
        shares: 12,
        tags: ['Community', 'Motivation'],
        liked: true,
        bookmarked: true
      },
      {
        id: 'post3',
        author: {
          name: 'Emma Thompson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
          badge: 'Climate Activist',
          level: 'Master'
        },
        content: 'Celebrating 6 months of being car-free! Public transport + biking has saved me $2000 and reduced my carbon footprint significantly.',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        likes: 156,
        comments: 34,
        commentList: [
          {
            author: { name: 'UrbanCyclist', avatar: 'https://randomuser.me/api/portraits/men/77.jpg' },
            content: 'That\'s amazing! I\'m trying to bike more too.'
          },
          {
            author: { name: 'TransitQueen', avatar: 'https://randomuser.me/api/portraits/women/88.jpg' },
            content: 'Public transport FTW!'
          }

        ],
        shares: 28,
        tags: ['Transportation', 'Carbon Reduction', 'Money Saving'],
        liked: false,
        bookmarked: false
      },
      {
        id: 'post4',
        author: {
          name: 'Alex Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          badge: 'Green Builder',
          level: 'Pro'
        },
        content: 'Installed solar panels last month and they\'re already generating 40% of our home\'s energy! The installation process was smoother than expected.',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        likes: 89,
        comments: 22,
        commentList: [
          {
            author: { name: 'SolarUser', avatar: 'https://randomuser.me/api/portraits/men/99.jpg' },
            content: 'Considering solar for my home. Any tips?'
          },
          {
            author: { name: 'GreenHome', avatar: 'https://randomuser.me/api/portraits/women/11.jpg' },
            content: 'Great to hear about your success!'
          }

        ],
        shares: 18,
        tags: ['Solar Energy', 'Home Improvement', 'Renewable Energy'],
        liked: true,
        bookmarked: true
      },
      {
        id: 'post5',
        author: {
          name: 'Lisa Johnson',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
          badge: 'Urban Farmer',
          level: 'Expert'
        },
        content: 'My rooftop garden is thriving! Growing 70% of my vegetables at home. Nothing beats the taste of homegrown tomatoes! 🍅',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        likes: 78,
        comments: 19,
        commentList: [
          {
            author: { name: 'GardenLife', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
            content: 'My tomatoes are struggling. Any advice?'
          },
          {
            author: { name: 'HomeGrown', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
            content: 'Nothing better than fresh produce from your own garden!'
          }

        ],
        shares: 14,
        tags: ['Urban Gardening', 'Food Security', 'Healthy Living'],
        liked: false,
        bookmarked: false
      },
      {
        id: 'post6',
        author: {
          name: 'David Park',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
          badge: 'Waste Warrior',
          level: 'Intermediate'
        },
        content: 'Completed my first month of zero waste living! It\'s challenging but incredibly rewarding. My trash can was literally empty this week.',
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop',
        timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        likes: 134,
        comments: 41,
        commentList: [
          {
            author: { name: 'ZeroWasteBeginner', avatar: 'https://randomuser.me/api/portraits/men/44.jpg' },
            content: 'This is my goal! So inspiring.'
          },
          {
            author: { name: 'ReduceReuseRecycle', avatar: 'https://randomuser.me/api/portraits/women/55.jpg' },
            content: 'Tell us your secrets!'
          }

        ],
        shares: 25,
        tags: ['Zero Waste', 'Lifestyle Change', 'Minimalism'],
        liked: true,
        bookmarked: false
      },
      {
        id: 'post7',
        author: {
          name: 'Maria Garcia',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
          badge: 'Eco Educator',
          level: 'Master'
        },
        content: 'Taught 50 kids about renewable energy today at the local school! Their enthusiasm for protecting the planet gives me so much hope. 🌍',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        likes: 201,
        comments: 56,
        commentList: [
          {
            author: { name: 'TeacherTina', avatar: 'https://randomuser.me/api/portraits/women/66.jpg' },
            content: 'Education is key! Thank you for doing this.'
          },
          {
            author: { name: 'FutureGen', avatar: 'https://randomuser.me/api/portraits/men/77.jpg' },
            content: 'The kids are our future!'
          }

        ],
        shares: 38,
        tags: ['Education', 'Youth Engagement', 'Community Outreach'],
        liked: false,
        bookmarked: true
      },
      {
        id: 'post8',
        author: {
          name: 'James Wilson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          badge: 'Tech Innovator',
          level: 'Pro'
        },
        content: 'Just launched a new app that tracks your carbon footprint in real-time! Beta testing shows 23% reduction in emissions. Link in bio!',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        likes: 167,
        comments: 43,
        commentList: [
          {
            author: { name: 'AppTester', avatar: 'https://randomuser.me/api/portraits/men/88.jpg' },
            content: 'Downloaded the app! Looks promising.'
          },
          {
            author: { name: 'DataGeek', avatar: 'https://randomuser.me/api/portraits/women/99.jpg' },
            content: 'Real-time tracking is a great feature.'
          }

        ],
        shares: 52,
        tags: ['Technology', 'Innovation', 'Carbon Tracking'],
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
      },
      {
        id: 'group5',
        name: 'Green Transportation',
        description: 'Electric vehicles, public transport, and cycling advocacy',
        members: 7432,
        category: 'Transportation',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop',
        joined: true,
        posts: 987,
        activity: 'Active'
      },
      {
        id: 'group6',
        name: 'Climate Action Network',
        description: 'Organizing for climate policy and environmental justice',
        members: 11234,
        category: 'Activism',
        image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400&h=200&fit=crop',
        joined: false,
        posts: 2876,
        activity: 'Very Active'
      },
      {
        id: 'group7',
        name: 'Eco-Friendly Business',
        description: 'Sustainable business practices and green entrepreneurship',
        members: 5678,
        category: 'Business',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=200&fit=crop',
        joined: true,
        posts: 1567,
        activity: 'Active'
      },
      {
        id: 'group8',
        name: 'Plastic-Free Community',
        description: 'Eliminating single-use plastics from our daily lives',
        members: 13456,
        category: 'Zero Waste',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
        joined: false,
        posts: 2234,
        activity: 'Very Active'
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
      },
      {
        id: 'event4',
        title: 'Climate Action Rally',
        description: 'Join us for a peaceful rally demanding climate action',
        date: '2024-07-30',
        time: '12:00 PM',
        location: 'City Hall',
        attendees: 234,
        maxAttendees: 500,
        image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400&h=200&fit=crop',
        organizer: 'Climate Action Network',
        registered: true
      },
      {
        id: 'event5',
        title: 'Sustainable Fashion Show',
        description: 'Showcase of eco-friendly and ethically made clothing',
        date: '2024-08-05',
        time: '7:00 PM',
        location: 'Fashion District',
        attendees: 156,
        maxAttendees: 200,
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=200&fit=crop',
        organizer: 'Sustainable Fashion Collective',
        registered: false
      },
      {
        id: 'event6',
        title: 'Electric Vehicle Expo',
        description: 'Test drive the latest electric vehicles and learn about incentives',
        date: '2024-08-10',
        time: '9:00 AM',
        location: 'Convention Center',
        attendees: 89,
        maxAttendees: 150,
        image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=200&fit=crop',
        organizer: 'Green Transportation Alliance',
        registered: true
      },
      {
        id: 'event7',
        title: 'Plastic-Free Challenge Kickoff',
        description: 'Start your journey to eliminate single-use plastics',
        date: '2024-08-15',
        time: '3:00 PM',
        location: 'Environmental Center',
        attendees: 78,
        maxAttendees: 120,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
        organizer: 'Plastic-Free Community',
        registered: false
      },
      {
        id: 'event8',
        title: 'Green Building Workshop',
        description: 'Learn about sustainable construction and renovation',
        date: '2024-08-20',
        time: '1:00 PM',
        location: 'Eco Building Center',
        attendees: 43,
        maxAttendees: 60,
        image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=200&fit=crop',
        organizer: 'Green Building Council',
        registered: true
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
      },
      {
        id: 'challenge4',
        title: 'Meatless Monday Movement',
        description: 'Go vegetarian every Monday for 3 months',
        participants: 2156,
        duration: '12 weeks',
        difficulty: 'Easy',
        reward: '300 Green Points',
        progress: 45,
        joined: true,
        category: 'Food'
      },
      {
        id: 'challenge5',
        title: 'Solar Panel Installation',
        description: 'Install solar panels on your home or business',
        participants: 234,
        duration: '6 months',
        difficulty: 'Hard',
        reward: '2000 Green Points',
        progress: 0,
        joined: false,
        category: 'Energy'
      },
      {
        id: 'challenge6',
        title: 'Community Garden Volunteer',
        description: 'Volunteer at local community gardens for 3 months',
        participants: 789,
        duration: '12 weeks',
        difficulty: 'Medium',
        reward: '600 Green Points',
        progress: 78,
        joined: true,
        category: 'Gardening'
      },
      {
        id: 'challenge7',
        title: 'Water Conservation Hero',
        description: 'Reduce water usage by 30% for 60 days',
        participants: 1567,
        duration: '60 days',
        difficulty: 'Medium',
        reward: '400 Green Points',
        progress: 0,
        joined: false,
        category: 'Water'
      },
      {
        id: 'challenge8',
        title: 'Thrift Shopping Only',
        description: 'Buy only secondhand items for 90 days',
        participants: 934,
        duration: '90 days',
        difficulty: 'Medium',
        reward: '700 Green Points',
        progress: 12,
        joined: true,
        category: 'Fashion'
      }
    ]);
  }, []);

  // Generate dynamic leaderboard data
  const generateLeaderboard = () => {
    const baseUsers = [
      { name: 'Sarah Green', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face', basePoints: 2500 },
      { name: 'Mike Rodriguez', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', basePoints: 2300 },
      { name: 'Emma Thompson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', basePoints: 2100 },
      { name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', basePoints: 1900 },
      { name: 'Lisa Johnson', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face', basePoints: 1800 }
    ];

    // Add current user to the list
    const allUsers = [...baseUsers, { 
      name: currentUser.name, 
      avatar: currentUser.avatar, 
      basePoints: currentUser.points 
    }];

    // Sort by points and add ranking
    return allUsers
      .sort((a, b) => b.basePoints - a.basePoints)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        points: user.basePoints
      }));
  };

  const leaderboardData = generateLeaderboard();

  const handleLike = (postId) => {
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  const handleAddComment = (postId) => {
    const commentContent = commentInputs[postId];
    if (!commentContent.trim()) return;

    setPosts(posts.map(p =>
      p.id === postId
        ? {
            ...p,
            comments: p.comments + 1,
            commentList: [...(p.commentList || []), { author: currentUser, content: commentContent }]
          }
        : p
    ));
    setCommentInputs({ ...commentInputs, [postId]: '' });
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

  const handleBookmark = (postId) => {
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, bookmarked: !p.bookmarked }
        : p
    ));
  };

  const handleJoinGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const newJoinedStatus = !group.joined;
      addCommunityNotification(`You have ${newJoinedStatus ? 'joined' : 'left'} the group "${group.name}".`);
    }

    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 }
        : g
    ));
  };

  const handleRegisterEvent = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      const newRegisteredStatus = !event.registered;
      addCommunityNotification(`You have ${newRegisteredStatus ? 'registered for' : 'unregistered from'} the event "${event.title}".`);
    }

    setEvents(events.map(e =>
      e.id === eventId
        ? { ...e, registered: !e.registered, attendees: e.registered ? e.attendees - 1 : e.attendees + 1 }
        : e
    ));
  };

  const handleJoinChallenge = (challengeId) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      const newJoinedStatus = !challenge.joined;
      addCommunityNotification(`You have ${newJoinedStatus ? 'joined' : 'left'} the challenge "${challenge.title}".`);
    }

    setChallenges(challenges.map(c =>
      c.id === challengeId
        ? { ...c, joined: !c.joined, participants: c.joined ? c.participants - 1 : c.participants + 1 }
        : c
    ));
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost = {
      id: Date.now().toString(),
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        badge: 'Community Member',
        level: currentUser.level,
      },
      content: newPostContent,
      image: null,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      tags: ['Community'],
      liked: false,
      bookmarked: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowCreatePost(false);

    addCommunityNotification('A new post has been created in the Community Hub. Check it out!');
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
              <Button variant="outline">
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

        <TabsContent value="feed">
          <div className="space-y-4">
            {posts.filter(post => 
              post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(post => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{post.author.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {post.author.badge}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {post.author.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(post.timestamp)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-700">{post.content}</p>
                  
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
                      <Badge key={index} variant="outline" className="text-xs">
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
                        className={post.liked ? 'text-red-500' : 'text-gray-600'}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${post.liked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        // onClick={() => {}} // Keep interactive, but handled by input field now
                        className="text-gray-600"
                      >
                         <MessageCircle className="w-4 h-4 mr-1" />
                        {post.comments}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(post.id)}
                        className="text-gray-600"
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
                        className={post.bookmarked ? 'text-blue-500' : 'text-gray-600'}
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
                      className="flex-1"
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

        <TabsContent value="groups">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.filter(group => 
              group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              group.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(group => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img 
                    src={group.image} 
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{group.members.toLocaleString()} members</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {group.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-gray-500" />
                      <span>{group.posts.toLocaleString()} posts</span>
                    </div>
                    <Badge className={`text-xs ${getActivityColor(group.activity)}`}>
                      {group.activity}
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={() => handleJoinGroup(group.id)}
                    className={`w-full ${group.joined 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {group.joined ? 'Joined' : 'Join Group'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.filter(event => 
              event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              event.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{event.date}</span>
                    <Clock className="w-4 h-4 text-gray-500 ml-2" />
                    <span>{event.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{event.attendees}/{event.maxAttendees} attending</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.organizer}
                    </Badge>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    />
                  </div>
                  
                  <Button
                    onClick={() => handleRegisterEvent(event.id)}
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
          </div>
        </TabsContent>

        <TabsContent value="challenges">
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
                      <span>{challenge.participants.toLocaleString()} participants</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
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
                  
                  {challenge.joined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{challenge.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${challenge.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
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
          </div>
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
                  Top contributors this month
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData.map((user, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        user.name === currentUser.name 
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
                          {user.name === currentUser.name && (
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
 );
}
export default CommunityHub;