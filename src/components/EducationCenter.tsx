import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
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
  Share2,
  Calendar,
  Video,
  FileText,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Eye,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';

const EducationCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [watchingVideo, setWatchingVideo] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState(new Set([1]));
  const [courseProgress, setCourseProgress] = useState(new Map([[1, 100], [2, 30]]));
  const [likedArticles, setLikedArticles] = useState(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [registeredWebinars, setRegisteredWebinars] = useState(new Set());
  const { userStats, incrementCourseCompleted } = useUserData();
  const { toast } = useToast();

  const courses = [
    {
      id: 1,
      title: 'Sustainable Living Basics',
      description: 'Learn the fundamentals of eco-friendly lifestyle choices',
      duration: '2 hours',
      level: 'Beginner',
      rating: 4.8,
      students: 1234,
      category: 'lifestyle',
      thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      lessons: 8,
      instructor: 'Dr. Sarah Green',
      price: 'Free',
      content: [
        { title: 'Introduction to Sustainable Living', duration: '15 min', completed: false },
        { title: 'Energy Conservation at Home', duration: '20 min', completed: false },
        { title: 'Waste Reduction Strategies', duration: '18 min', completed: false },
        { title: 'Sustainable Transportation', duration: '22 min', completed: false },
        { title: 'Green Shopping Guide', duration: '16 min', completed: false },
        { title: 'Water Conservation Tips', duration: '14 min', completed: false },
        { title: 'Eco-Friendly Diet Choices', duration: '19 min', completed: false },
        { title: 'Building Sustainable Habits', duration: '21 min', completed: false }
      ],
      skills: ['Waste Reduction', 'Energy Efficiency', 'Sustainable Shopping', 'Green Living']
    },
    {
      id: 2,
      title: 'Carbon Footprint Reduction',
      description: 'Advanced strategies to minimize your environmental impact',
      duration: '3 hours',
      level: 'Intermediate',
      rating: 4.9,
      students: 892,
      category: 'carbon',
      thumbnail: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400',
      lessons: 12,
      instructor: 'Prof. Mike Johnson',
      price: '$29',
      content: [
        { title: 'Understanding Carbon Footprints', duration: '25 min', completed: false },
        { title: 'Home Energy Audits', duration: '30 min', completed: false },
        { title: 'Transportation Choices', duration: '28 min', completed: false },
        { title: 'Renewable Energy Options', duration: '35 min', completed: false },
        { title: 'Carbon Offset Programs', duration: '22 min', completed: false },
        { title: 'Business Carbon Strategies', duration: '40 min', completed: false }
      ],
      skills: ['Carbon Calculation', 'Energy Auditing', 'Renewable Energy', 'Carbon Offsetting']
    },
    {
      id: 3,
      title: 'Sustainable Business Practices',
      description: 'How to implement green practices in your organization',
      duration: '4 hours',
      level: 'Advanced',
      rating: 4.7,
      students: 567,
      category: 'business',
      thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      lessons: 15,
      instructor: 'Dr. Emma Wilson',
      price: '$49',
      content: [
        { title: 'Sustainability in Business Strategy', duration: '45 min', completed: false },
        { title: 'Green Supply Chain Management', duration: '50 min', completed: false },
        { title: 'Sustainable Marketing', duration: '40 min', completed: false }
      ],
      skills: ['Green Strategy', 'Supply Chain', 'Sustainable Marketing', 'ESG Reporting']
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
      likes: 234,
      comments: 45,
      publishDate: '2024-06-15',
      content: `Plastic waste is one of the biggest environmental challenges we face today. Here are 10 practical ways to reduce your plastic consumption:
        
1. **Use reusable bags for shopping** - Keep cloth or canvas bags handy for grocery trips
2. **Carry a refillable water bottle** - Invest in a quality stainless steel or glass bottle
3. **Choose products with minimal packaging** - Opt for bulk items or products with recyclable packaging
4. **Use glass containers for food storage** - Replace plastic containers with glass alternatives
5. **Avoid single-use utensils and straws** - Carry your own reusable utensils

Making these small changes can significantly impact the environment while saving you money.`
    },
    {
      id: 2,
      title: 'The Hidden Environmental Cost of Fast Fashion',
      excerpt: 'Understanding the true impact of clothing consumption on our planet',
      readTime: '8 min read',
      author: 'Emma Thompson',
      category: 'fashion',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
      tags: ['Fashion', 'Sustainability', 'Ethics'],
      likes: 567,
      comments: 89,
      publishDate: '2024-06-10',
      content: `Fast fashion has revolutionized how we consume clothing, but at what cost to our environment?
        
**The Scale of the Problem**
The fashion industry is the second-largest polluter globally, responsible for 10% of global carbon emissions.

**What You Can Do:**
- Buy fewer, higher-quality items
- Choose sustainable brands
- Thrift and swap clothes
- Care for clothes properly to extend their life`
    }
  ];

  const webinars = [
    {
      id: 1,
      title: 'Climate Action: What Individuals Can Do',
      speaker: 'Dr. Climate Expert',
      date: '2024-07-20',
      time: '2:00 PM EST',
      duration: '1 hour',
      attendees: 342,
      maxAttendees: 500,
      status: 'upcoming',
      thumbnail: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400',
      description: 'Learn practical strategies for individual climate action and how small changes can make a big difference.',
      topics: ['Personal Carbon Footprint', 'Sustainable Living', 'Climate Advocacy', 'Green Technology'],
      price: 'Free'
    },
    {
      id: 2,
      title: 'Green Investing: ESG Funds Explained',
      speaker: 'Finance Pro Sarah Johnson',
      date: '2024-06-18',
      time: '3:00 PM EST',
      duration: '45 minutes',
      attendees: 156,
      maxAttendees: 200,
      status: 'recorded',
      thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400',
      description: 'Understand how to invest in environmentally responsible funds and make your money work for the planet.',
      topics: ['ESG Investing', 'Green Bonds', 'Sustainable Funds', 'Impact Investing'],
      price: 'Free'
    }
  ];

  const achievements = [
    { id: 1, name: 'Course Completion Badge', earned: userStats.coursesCompleted >= 1, description: 'Complete your first course' },
    { id: 2, name: 'Sustainability Advocate', earned: userStats.coursesCompleted >= 2, description: 'Complete 2 courses' },
    { id: 3, name: 'Carbon Warrior', earned: userStats.coursesCompleted >= 3, description: 'Complete the Carbon Footprint course' },
    { id: 4, name: 'Eco Expert', earned: userStats.coursesCompleted >= 5, description: 'Complete 5 courses' },
    { id: 5, name: 'Knowledge Seeker', earned: userStats.recipesViewed >= 10, description: 'Read 10 articles' },
    { id: 6, name: 'Community Learner', earned: registeredWebinars.size > 0, description: 'Attend your first webinar' }
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

  const handleEnrollCourse = (courseId) => {
    setEnrolledCourses(prev => new Set([...prev, courseId]));
    setCourseProgress(prev => new Map([...prev, [courseId, 0]]));
    toast({
      title: "Enrollment Successful!",
      description: "You've been enrolled in the course. Start learning now!",
    });
  };

  const handleStartCourse = (course) => {
    setSelectedCourse(course);
    if (!enrolledCourses.has(course.id)) {
      handleEnrollCourse(course.id);
    }
  };

  const handleWatchLesson = (lesson, courseId) => {
    setWatchingVideo(true);
    setTimeout(() => {
      setWatchingVideo(false);
      const currentProgress = courseProgress.get(courseId) || 0;
      const newProgress = Math.min(currentProgress + (100 / courses.find(c => c.id === courseId)?.lessons || 8), 100);
      setCourseProgress(prev => new Map([...prev, [courseId, newProgress]]));
      
      if (newProgress === 100) {
        incrementCourseCompleted();
        toast({
          title: "Course Completed! 🎉",
          description: "Congratulations! You've completed the course and earned a new badge.",
        });
      } else {
        toast({
          title: "Lesson Complete",
          description: "Great job! Continue to the next lesson.",
        });
      }
    }, 2000);
  };

  const handleLikeArticle = (articleId) => {
    if (likedArticles.has(articleId)) {
      setLikedArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
      toast({
        title: "Like Removed",
        description: "Article removed from your liked articles.",
      });
    } else {
      setLikedArticles(prev => new Set([...prev, articleId]));
      toast({
        title: "Article Liked!",
        description: "Article added to your liked articles.",
      });
    }
  };

  const handleBookmarkArticle = (articleId) => {
    if (bookmarkedArticles.has(articleId)) {
      setBookmarkedArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
      toast({
        title: "Bookmark Removed",
        description: "Article removed from your bookmarks.",
      });
    } else {
      setBookmarkedArticles(prev => new Set([...prev, articleId]));
      toast({
        title: "Article Bookmarked!",
        description: "Article saved to your bookmarks.",
      });
    }
  };

  const handleRegisterWebinar = (webinarId) => {
    if (registeredWebinars.has(webinarId)) {
      toast({
        title: "Already Registered",
        description: "You're already registered for this webinar.",
      });
    } else {
      setRegisteredWebinars(prev => new Set([...prev, webinarId]));
      toast({
        title: "Registration Successful!",
        description: "You're now registered for the webinar. Check your email for details.",
      });
    }
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
      toast({
        title: "Link Copied!",
        description: "Article link copied to clipboard.",
      });
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

  const filteredWebinars = webinars.filter(webinar => {
    const matchesSearch = webinar.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Course Detail Modal */}
      {selectedCourse && (
        <Card className="bg-white/95 rounded-xl border border-blue-100 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedCourse.title}</h2>
                <p className="text-gray-600 mb-3">{selectedCourse.description}</p>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className={getLevelColor(selectedCourse.level)}>
                    {selectedCourse.level}
                  </Badge>
                  <Badge variant="outline">{selectedCourse.duration}</Badge>
                  <Badge variant="outline">{selectedCourse.price}</Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>By {selectedCourse.instructor}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{selectedCourse.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{selectedCourse.students} students</span>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedCourse(null)}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3">Course Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {Math.round(courseProgress.get(selectedCourse.id) || 0)}%</span>
                  </div>
                  <Progress value={courseProgress.get(selectedCourse.id) || 0} className="h-3" />
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Skills You'll Learn</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.skills?.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {selectedCourse.content && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Course Content</h3>
                <div className="space-y-2">
                  {selectedCourse.content.map((lesson, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className={`w-4 h-4 ${lesson.completed ? 'text-green-500' : 'text-gray-300'}`} />
                        <div>
                          <span className={lesson.completed ? 'text-gray-800' : 'text-gray-500'}>
                            {lesson.title}
                          </span>
                          <div className="text-xs text-gray-500">{lesson.duration}</div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleWatchLesson(lesson, selectedCourse.id)}
                        disabled={watchingVideo}
                      >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        {watchingVideo ? 'Playing...' : 'Play'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => enrolledCourses.has(selectedCourse.id) ? null : handleEnrollCourse(selectedCourse.id)}
              >
                {enrolledCourses.has(selectedCourse.id) ? 'Continue Learning' : 'Enroll Now'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleBookmarkArticle(selectedCourse.id)}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Bookmark
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <Card className="bg-white/95 rounded-xl border border-blue-100 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedArticle.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span>By {selectedArticle.author}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                  <span>•</span>
                  <span>{selectedArticle.publishDate}</span>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedArticle(null)}>
                ✕
              </Button>
            </div>

            <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-64 object-cover rounded-lg mb-6" />
            
            <div className="prose max-w-none mb-6">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {selectedArticle.content || selectedArticle.excerpt}
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleLikeArticle(selectedArticle.id)}
                  className={likedArticles.has(selectedArticle.id) ? 'text-red-500' : ''}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {selectedArticle.likes + (likedArticles.has(selectedArticle.id) ? 1 : 0)}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {selectedArticle.comments}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleBookmarkArticle(selectedArticle.id)}
                  className={bookmarkedArticles.has(selectedArticle.id) ? 'text-blue-500' : ''}
                >
                  <Bookmark className="w-4 h-4 mr-1" />
                  {bookmarkedArticles.has(selectedArticle.id) ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleShareArticle(selectedArticle)}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webinar Detail Modal */}
      {selectedWebinar && (
        <Card className="bg-white/95 rounded-xl border border-blue-100 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedWebinar.title}</h2>
                <p className="text-gray-600 mb-3">{selectedWebinar.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>By {selectedWebinar.speaker}</span>
                  <span>•</span>
                  <span>{selectedWebinar.date} at {selectedWebinar.time}</span>
                  <span>•</span>
                  <span>{selectedWebinar.duration}</span>
                  <span>•</span>
                  <span>{selectedWebinar.price}</span>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedWebinar(null)}>
                ✕
              </Button>
            </div>

            <img src={selectedWebinar.thumbnail} alt={selectedWebinar.title} className="w-full h-64 object-cover rounded-lg mb-6" />
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {selectedWebinar.topics?.map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {selectedWebinar.attendees}/{selectedWebinar.maxAttendees} registered
              </div>
              <Badge variant={selectedWebinar.status === 'upcoming' ? 'default' : 'secondary'}>
                {selectedWebinar.status === 'upcoming' ? 'Upcoming' : 'Recorded'}
              </Badge>
            </div>

            <div className="flex gap-3">
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleRegisterWebinar(selectedWebinar.id)}
              >
                {registeredWebinars.has(selectedWebinar.id) ? 'Registered ✓' : selectedWebinar.status === 'upcoming' ? 'Register Now' : 'Watch Recording'}
              </Button>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
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
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-white/90">
                      {course.price}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600">{course.description}</p>
                      <p className="text-xs text-gray-500 mt-1">By {course.instructor}</p>
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

                    {enrolledCourses.has(course.id) && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{Math.round(courseProgress.get(course.id) || 0)}%</span>
                        </div>
                        <Progress value={courseProgress.get(course.id) || 0} className="h-2" />
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      variant={enrolledCourses.has(course.id) ? "secondary" : "default"}
                      onClick={() => handleStartCourse(course)}
                    >
                      {enrolledCourses.has(course.id) ? 'Continue Learning' : 'Start Course'}
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
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-white/90">
                      {article.readTime}
                    </Badge>
                  </div>
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
                      <span>{article.publishDate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className={`w-4 h-4 ${likedArticles.has(article.id) ? 'text-red-500' : ''}`} />
                          <span>{article.likes + (likedArticles.has(article.id) ? 1 : 0)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{article.comments}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedArticle(article)}
                      >
                        Read Article
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
            {filteredWebinars.map((webinar) => (
              <Card key={webinar.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={webinar.thumbnail} 
                      alt={webinar.title}
                      className="w-32 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{webinar.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{webinar.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Speaker: {webinar.speaker}</span>
                            <span>•</span>
                            <span>{webinar.date} at {webinar.time}</span>
                            <span>•</span>
                            <span>{webinar.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={webinar.status === 'upcoming' ? 'default' : 'secondary'}>
                              {webinar.status === 'upcoming' ? 'Upcoming' : 'Recorded'}
                            </Badge>
                            <Badge variant="outline">{webinar.price}</Badge>
                            {registeredWebinars.has(webinar.id) && (
                              <Badge className="bg-green-100 text-green-700">Registered</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-2">
                            {webinar.attendees}/{webinar.maxAttendees}
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => setSelectedWebinar(webinar)}
                          >
                            {webinar.status === 'upcoming' ? 'View Details' : 'Watch Recording'}
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

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`text-center p-6 ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {achievement.earned ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <Award className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <h3 className={`font-medium mb-2 ${achievement.earned ? 'text-green-700' : 'text-gray-500'}`}>
                  {achievement.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <p className="text-xs text-gray-500">
                  {achievement.earned ? 'Earned!' : 'Not earned yet'}
                </p>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Your Learning Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Courses Completed</span>
                    <span className="font-semibold text-blue-600">{userStats.coursesCompleted}/10</span>
                  </div>
                  <Progress value={(userStats.coursesCompleted / 10) * 100} className="h-3" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Articles Read</span>
                    <span className="font-semibold text-green-600">{userStats.recipesViewed}/50</span>
                  </div>
                  <Progress value={(userStats.recipesViewed / 50) * 100} className="h-3" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Webinars Registered</span>
                    <span className="font-semibold text-purple-600">{registeredWebinars.size}/10</span>
                  </div>
                  <Progress value={(registeredWebinars.size / 10) * 100} className="h-3" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Learning Streak</span>
                    <span className="font-semibold text-orange-600">7 days</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EducationCenter;
