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
import { useUserData } from '@/contexts/UserDataContext';

const EducationCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { userStats, incrementCourseCompleted } = useUserData();

  const courses = [
    {
      id: 1,
      title: 'Sustainable Living Basics',
      description: 'Learn the fundamentals of eco-friendly lifestyle choices',
      duration: '2 hours',
      level: 'Beginner',
      progress: userStats.coursesCompleted >= 1 ? 100 : 0,
      rating: 4.8,
      students: 1234,
      category: 'lifestyle',
      thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      lessons: 8,
      completed: userStats.coursesCompleted >= 1 ? 8 : 0,
      content: [
        'Introduction to Sustainable Living',
        'Energy Conservation at Home',
        'Waste Reduction Strategies',
        'Sustainable Transportation',
        'Green Shopping Guide',
        'Water Conservation Tips',
        'Eco-Friendly Diet Choices',
        'Building Sustainable Habits'
      ]
    },
    {
      id: 2,
      title: 'Carbon Footprint Reduction',
      description: 'Advanced strategies to minimize your environmental impact',
      duration: '3 hours',
      level: 'Intermediate',
      progress: userStats.coursesCompleted >= 2 ? 100 : userStats.coursesCompleted >= 1 ? 30 : 0,
      rating: 4.9,
      students: 892,
      category: 'carbon',
      thumbnail: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400',
      lessons: 12,
      completed: userStats.coursesCompleted >= 2 ? 12 : userStats.coursesCompleted >= 1 ? 4 : 0
    },
    {
      id: 3,
      title: 'Sustainable Business Practices',
      description: 'How to implement green practices in your organization',
      duration: '4 hours',
      level: 'Advanced',
      progress: userStats.coursesCompleted >= 3 ? 100 : 0,
      rating: 4.7,
      students: 567,
      category: 'business',
      thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      lessons: 15,
      completed: userStats.coursesCompleted >= 3 ? 15 : 0
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
      tags: ['Plastic', 'Zero Waste', 'DIY'],
      content: `
        Plastic waste is one of the biggest environmental challenges we face today. Here are 10 practical ways to reduce your plastic consumption:
        
        1. Use reusable bags for shopping
        2. Carry a refillable water bottle
        3. Choose products with minimal packaging
        4. Use glass containers for food storage
        5. Avoid single-use utensils and straws
        6. Buy in bulk to reduce packaging
        7. Choose bar soaps over liquid soaps in plastic bottles
        8. Use bamboo or wooden alternatives
        9. Repair items instead of replacing them
        10. Support brands committed to reducing plastic use
        
        Making these small changes can significantly impact the environment while saving you money in the long run.
      `
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
    { id: 1, name: 'Course Completion Badge', earned: userStats.coursesCompleted >= 1 },
    { id: 2, name: 'Sustainability Advocate', earned: userStats.coursesCompleted >= 2 },
    { id: 3, name: 'Carbon Warrior', earned: userStats.coursesCompleted >= 3 },
    { id: 4, name: 'Eco Expert', earned: userStats.coursesCompleted >= 5 }
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

  const handleContinueLearning = (course) => {
    setSelectedCourse(course);
    if (course.progress < 100) {
      // Simulate course completion
      incrementCourseCompleted();
    }
  };

  const handleStartCourse = (course) => {
    setSelectedCourse(course);
    incrementCourseCompleted();
  };

  const handleReadArticle = (article) => {
    setSelectedArticle(article);
  };

  const handleShareArticle = (article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

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
      {/* Course Detail Modal */}
      {selectedCourse && (
        <Card className="bg-white/95 rounded-xl border border-blue-100 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedCourse.title}</h2>
                <p className="text-gray-600 mt-2">{selectedCourse.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={getLevelColor(selectedCourse.level)}>
                    {selectedCourse.level}
                  </Badge>
                  <Badge variant="outline">{selectedCourse.duration}</Badge>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedCourse(null)}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Course Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completed: {selectedCourse.completed}/{selectedCourse.lessons} lessons</span>
                    <span>{Math.round(selectedCourse.progress)}%</span>
                  </div>
                  <Progress value={selectedCourse.progress} className="h-3" />
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Course Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{selectedCourse.students} students enrolled</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{selectedCourse.rating}/5.0 rating</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedCourse.content && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Course Content</h3>
                <div className="space-y-2">
                  {selectedCourse.content.map((lesson, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <CheckCircle className={`w-4 h-4 ${index < selectedCourse.completed ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={index < selectedCourse.completed ? 'text-gray-800' : 'text-gray-500'}>
                        {lesson}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <Card className="bg-white/95 rounded-xl border border-blue-100 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedArticle.title}</h2>
                <p className="text-gray-600 mt-2">By {selectedArticle.author} • {selectedArticle.readTime}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedArticle(null)}>
                ✕
              </Button>
            </div>

            <div className="prose max-w-none">
              <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-64 object-cover rounded-lg mb-4" />
              <div className="whitespace-pre-line text-gray-700">
                {selectedArticle.content || selectedArticle.excerpt}
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-6 pt-4 border-t">
              {selectedArticle.tags?.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                      onClick={() => course.progress > 0 ? handleContinueLearning(course) : handleStartCourse(course)}
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
                      {article.tags?.map((tag, index) => (
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
                      <Button className="flex-1" onClick={() => handleReadArticle(article)}>
                        Read Article
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleShareArticle(article)}>
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
                  <span className="font-semibold">{userStats.coursesCompleted}/10</span>
                </div>
                <Progress value={(userStats.coursesCompleted / 10) * 100} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span>Articles Read</span>
                  <span className="font-semibold">{userStats.recipesViewed}/50</span>
                </div>
                <Progress value={(userStats.recipesViewed / 50) * 100} className="h-2" />
                
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
