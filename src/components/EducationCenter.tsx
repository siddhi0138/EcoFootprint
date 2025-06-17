
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  Award, 
  Clock, 
  Users, 
  Star,
  Search,
  Filter,
  CheckCircle,
  PlayCircle,
  Download,
  Share2
} from 'lucide-react';

const EducationCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const courses = [
    {
      id: 1,
      title: 'Sustainable Living Basics',
      description: 'Learn the fundamentals of eco-friendly lifestyle choices',
      duration: '2 hours',
      level: 'Beginner',
      progress: 75,
      rating: 4.8,
      students: 1234,
      category: 'lifestyle',
      thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      lessons: 8,
      completed: 6
    },
    {
      id: 2,
      title: 'Carbon Footprint Reduction',
      description: 'Advanced strategies to minimize your environmental impact',
      duration: '3 hours',
      level: 'Intermediate',
      progress: 30,
      rating: 4.9,
      students: 892,
      category: 'carbon',
      thumbnail: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400',
      lessons: 12,
      completed: 4
    },
    {
      id: 3,
      title: 'Sustainable Business Practices',
      description: 'How to implement green practices in your organization',
      duration: '4 hours',
      level: 'Advanced',
      progress: 0,
      rating: 4.7,
      students: 567,
      category: 'business',
      thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      lessons: 15,
      completed: 0
    }
  ];

  const articles = [
    {
      id: 1,
      title: '10 Simple Ways to Reduce Plastic Waste',
      excerpt: 'Practical tips for eliminating single-use plastics from your daily routine',
      readTime: '5 min read',
      author: 'Dr. Sarah Green',
      category: 'waste-reduction',
      image: 'https://images.unsplash.com/photo-1583183416581-c9b803aa1149?w=400',
      tags: ['Plastic', 'Zero Waste', 'DIY']
    },
    {
      id: 2,
      title: 'The Hidden Environmental Cost of Fast Fashion',
      excerpt: 'Understanding the true impact of clothing consumption on our planet',
      readTime: '8 min read',
      author: 'Emma Thompson',
      category: 'fashion',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
      tags: ['Fashion', 'Sustainability', 'Ethics']
    },
    {
      id: 3,
      title: 'Renewable Energy: A Homeowner\'s Guide',
      excerpt: 'Everything you need to know about solar panels and wind energy',
      readTime: '12 min read',
      author: 'Mike Rodriguez',
      category: 'energy',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
      tags: ['Solar', 'Wind', 'Home Energy']
    }
  ];

  const webinars = [
    {
      id: 1,
      title: 'Climate Action: What Individuals Can Do',
      speaker: 'Dr. Climate Expert',
      date: '2024-06-20',
      time: '2:00 PM EST',
      duration: '1 hour',
      attendees: 342,
      status: 'upcoming',
      thumbnail: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400'
    },
    {
      id: 2,
      title: 'Green Investing: ESG Funds Explained',
      speaker: 'Finance Pro',
      date: '2024-06-18',
      time: '3:00 PM EST',
      duration: '45 minutes',
      attendees: 156,
      status: 'recorded',
      thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400'
    }
  ];

  const achievements = [
    { id: 1, name: 'Course Completion Badge', earned: true },
    { id: 2, name: 'Sustainability Advocate', earned: true },
    { id: 3, name: 'Carbon Warrior', earned: false },
    { id: 4, name: 'Eco Expert', earned: false }
  ];

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'carbon', label: 'Carbon' },
    { id: 'business', label: 'Business' },
    { id: 'energy', label: 'Energy' },
    { id: 'waste-reduction', label: 'Waste' },
    { id: 'fashion', label: 'Fashion' }
  ];

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Education Center</span>
          </CardTitle>
          <p className="text-gray-600">Learn, grow, and become a sustainability champion</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search courses, articles, webinars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="webinars">Webinars</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="group hover:shadow-xl transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <PlayCircle className="w-8 h-8 text-white opacity-80 hover:opacity-100 cursor-pointer" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600">{course.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{course.students}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>

                    {course.progress > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{course.completed}/{course.lessons} lessons</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      variant={course.progress > 0 ? "secondary" : "default"}
                    >
                      {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600">{article.excerpt}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {article.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>By {article.author}</span>
                      <span>{article.readTime}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">Read Article</Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webinars" className="space-y-4">
          <div className="space-y-4">
            {webinars.map((webinar) => (
              <Card key={webinar.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={webinar.thumbnail} 
                      alt={webinar.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{webinar.title}</h3>
                      <p className="text-sm text-gray-600">Speaker: {webinar.speaker}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{webinar.date} at {webinar.time}</span>
                        <span>{webinar.duration}</span>
                        <span>{webinar.attendees} attendees</span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Badge variant={webinar.status === 'upcoming' ? 'default' : 'secondary'}>
                        {webinar.status === 'upcoming' ? 'Upcoming' : 'Recorded'}
                      </Badge>
                      <Button size="sm">
                        {webinar.status === 'upcoming' ? 'Register' : 'Watch Recording'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`text-center p-6 ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {achievement.earned ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <Award className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <h3 className={`font-medium ${achievement.earned ? 'text-green-700' : 'text-gray-500'}`}>
                  {achievement.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {achievement.earned ? 'Earned!' : 'Not earned yet'}
                </p>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Courses Completed</span>
                  <span className="font-semibold">3/10</span>
                </div>
                <Progress value={30} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span>Articles Read</span>
                  <span className="font-semibold">15/50</span>
                </div>
                <Progress value={30} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span>Webinars Attended</span>
                  <span className="font-semibold">2/5</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EducationCenter;
