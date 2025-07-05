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
  BookmarkPlus,
  Flag,
  Calendar,
  MapPin,
  Clock,
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
  const [showCreatePost, setShowCreatePost] = useState(false);

  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);

  const userId = currentUser?.uid || null;

  // Firestore collection references
  const userDocRef = userId ? doc(db, 'users', userId) : null;

  useEffect(() => {
    if (!userId) return;

    const postsRef = collection(userDocRef, 'posts');
    const unsubscribePosts = onSnapshot(postsRef, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });

    const groupsRef = collection(userDocRef, 'groups');
    const unsubscribeGroups = onSnapshot(groupsRef, (snapshot) => {
      const groupsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGroups(groupsData);
    });

    const eventsRef = collection(userDocRef, 'events');
    const unsubscribeEvents = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
    });

    const challengesRef = collection(userDocRef, 'challenges');
    const unsubscribeChallenges = onSnapshot(challengesRef, (snapshot) => {
      const challengesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChallenges(challengesData);
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

    const postRef = doc(userDocRef, 'posts', postId);
    const updatedLikes = post.liked ? post.likes - 1 : post.likes + 1;
    try {
      await updateDoc(postRef, {
        liked: !post.liked,
        likes: updatedLikes,
      });
      addCommunityNotification(`You ${post.liked ? 'unliked' : 'liked'} a post.`);
      toast({
        title: post.liked ? 'Like Removed' : 'Post Liked',
        description: 'Your engagement helps build our community.',
      });
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleBookmark = async (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const postRef = doc(userDocRef, 'posts', postId);
    try {
      await updateDoc(postRef, {
        bookmarked: !post.bookmarked,
      });
      toast({
        title: post.bookmarked ? 'Bookmark Removed' : 'Post Bookmarked',
        description: post.bookmarked ? 'Removed from your saved posts.' : 'Saved to your bookmarks.',
      });
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleJoinGroup = async (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const groupRef = doc(userDocRef, 'groups', groupId);
    const updatedJoined = !group.joined;
    const updatedMembers = updatedJoined ? group.members + 1 : group.members - 1;
    try {
      await updateDoc(groupRef, {
        joined: updatedJoined,
        members: updatedMembers,
      });
      if (updatedJoined) {
        addCommunityNotification(`You joined the "${group.name}" group!`);
        toast({
          title: 'Group Joined',
          description: `Welcome to ${group.name}.`,
        });
      } else {
        toast({
          title: 'Left Group',
          description: `You've left ${group.name}.`,
        });
      }
    } catch (error) {
      console.error('Error updating group join status:', error);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const eventRef = doc(userDocRef, 'events', eventId);
    const updatedRegistered = !event.registered;
    const updatedAttendees = updatedRegistered ? event.attendees + 1 : event.attendees - 1;
    try {
      await updateDoc(eventRef, {
        registered: updatedRegistered,
        attendees: updatedAttendees,
      });
      if (updatedRegistered) {
        addCommunityNotification(`You registered for "${event.title}"!`);
        toast({
          title: 'Event Registration Successful',
          description: `You're registered for ${event.title}.`,
        });
      } else {
        toast({
          title: 'Registration Cancelled',
          description: `You've unregistered from ${event.title}.`,
        });
      }
    } catch (error) {
      console.error('Error updating event registration:', error);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    const challengeRef = doc(userDocRef, 'challenges', challengeId);
    const updatedJoined = !challenge.joined;
    const updatedParticipants = updatedJoined ? challenge.participants + 1 : challenge.participants - 1;
    try {
      await updateDoc(challengeRef, {
        joined: updatedJoined,
        participants: updatedParticipants,
      });
      if (updatedJoined) {
        addCommunityNotification(`You joined the "${challenge.title}" challenge!`);
        toast({
          title: 'Challenge Joined',
          description: `You're now part of ${challenge.title}.`,
        });
      } else {
        toast({
          title: 'Challenge Left',
          description: `You've left ${challenge.title}.`,
        });
      }
    } catch (error) {
      console.error('Error updating challenge join status:', error);
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
      const postsRef = collection(userDocRef, 'posts');
      await addDoc(postsRef, newPost);
      setNewPostContent('');
      setShowCreatePost(false);
      addCommunityNotification('Your post has been shared with the community!');
      toast({
        title: 'Post Created',
        description: 'Your post is now live in the community feed.',
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* The UI code remains unchanged and uses the updated state and handlers */}
    </div>
  );
};

export default CommunityHub;
