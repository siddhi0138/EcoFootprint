
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Video,
  Trophy,
  Star,
  ExternalLink,
  Bell,
  Bookmark
} from 'lucide-react';

const LiveEvents = () => {
  const [filter, setFilter] = useState('all');

  const events = [
    {
      id: 1,
      title: 'Sustainable Living Workshop',
      type: 'workshop',
      date: '2024-06-20',
      time: '14:00 UTC',
      duration: '2 hours',
      host: 'EcoExperts',
      participants: 245,
      maxParticipants: 500,
      location: 'Virtual',
      description: 'Learn practical tips for reducing your environmental footprint in daily life.',
      badges: ['Beginner Friendly', 'Interactive'],
      status: 'upcoming',
      featured: true
    },
    {
      id: 2,
      title: 'Climate Action Challenge',
      type: 'challenge',
      date: '2024-06-18',
      time: 'All Day',
      duration: '7 days',
      host: 'EcoScope Community',
      participants: 1247,
      maxParticipants: null,
      location: 'Global',
      description: 'Join thousands in a week-long challenge to reduce carbon footprint.',
      badges: ['Community Event', 'Rewards Available'],
      status: 'live',
      featured: true
    },
    {
      id: 3,
      title: 'Green Tech Innovation Showcase',
      type: 'showcase',
      date: '2024-06-25',
      time: '16:00 UTC',
      duration: '3 hours',
      host: 'TechForGood',
      participants: 89,
      maxParticipants: 200,
      location: 'San Francisco + Virtual',
      description: 'Discover the latest innovations in sustainable technology.',
      badges: ['Industry Leaders', 'Networking'],
      status: 'upcoming',
      featured: false
    }
  ];

  const liveStats = {
    activeEvents: 12,
    participants: 3456,
    completedToday: 8,
    upcomingWeek: 15
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-red-500 text-white';
      case 'upcoming': return 'bg-blue-500 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'workshop': return Video;
      case 'challenge': return Trophy;
      case 'showcase': return Star;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-700">
            <Calendar className="w-6 h-6" />
            <span>Live Events & Challenges</span>
            <Badge variant="secondary" className="ml-auto bg-red-100 text-red-700 animate-pulse">
              {liveStats.activeEvents} Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{liveStats.activeEvents}</div>
              <div className="text-sm text-gray-600">Active Events</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{liveStats.participants.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Participants</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{liveStats.completedToday}</div>
              <div className="text-sm text-gray-600">Completed Today</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{liveStats.upcomingWeek}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-6">
            {['all', 'live', 'upcoming', 'workshops', 'challenges'].map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="capitalize"
              >
                {filterType}
              </Button>
            ))}
          </div>

          {/* Events List */}
          <div className="space-y-4">
            {events.map((event) => {
              const TypeIcon = getTypeIcon(event.type);
              return (
                <div key={event.id} className={`bg-white/80 rounded-xl p-6 border ${event.featured ? 'border-purple-200 ring-2 ring-purple-100' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{event.title}</h3>
                          {event.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {event.badges.map((badge, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{event.participants} joined</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Bookmark className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bell className="w-4 h-4 mr-2" />
                        Remind Me
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                        {event.status === 'live' ? 'Join Now' : 'Register'}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
            <h3 className="font-semibold text-purple-800 mb-2">Create Your Own Event</h3>
            <p className="text-sm text-purple-700 mb-3">
              Host a sustainability workshop, challenge, or meetup in your community.
            </p>
            <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              Start Hosting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveEvents;
