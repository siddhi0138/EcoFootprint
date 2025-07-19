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
import { useNotificationHelper } from '@/hooks/useNotificationHelper';

const EducationCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const {
    enrolledCourses,
    courseProgress,
    enrollInCourse,
    updateCourseProgress,
    userStats,
    incrementCourseCompleted,
    incrementRecipeViewed,
  } = useUserData();
  const { addCourseCompletionNotification, addRecipeViewNotification, addGeneralNotification } = useNotificationHelper();
  // Remove local state for likedArticles, bookmarkedArticles, registeredWebinars
  // const [likedArticles, setLikedArticles] = useState(new Set());
  // const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  // const [registeredWebinars, setRegisteredWebinars] = useState(new Set());

  // Use from context instead
  const {
    likedArticles,
    bookmarkedArticles,
    registeredWebinars,
    likeArticle,
    bookmarkArticle,
    registerWebinar,
  } = useUserData();
  const { toast } = useToast();
  const [watchingVideo, setWatchingVideo] = useState(false);

  // Remove usage of setEnrolledCourses and setCourseProgress since they do not exist
  // Use enrolledCourses and courseProgress directly from context

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
    enrollInCourse(courseId);
    
    const course = courses.find(c => c.id === courseId);
    if (course) {
      addGeneralNotification("Course Enrollment", `You've successfully enrolled in "${course.title}". Start learning now!`, "achievement");
      toast({
        title: "Enrollment Successful!",
        description: `You've been enrolled in ${course.title}. Start learning now!`,
      });
    }
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
      const course = courses.find(c => c.id === courseId);
      const newProgress = Math.min(currentProgress + (100 / (course?.lessons || 8)), 100);
      updateCourseProgress(courseId, newProgress);
      
      if (newProgress === 100) {
        incrementCourseCompleted();
        console.log('incrementCourseCompleted called');
        addCourseCompletionNotification(course?.title || 'Course');
        toast({
          title: "Course Completed! 🎉",
          description: "Congratulations! You've completed the course and earned a new badge.",
        });
      } else {
        toast({
          title: "Lesson Complete",
          description: `Great job completing "${lesson.title}"! Continue to the next lesson.`,
        });
      }
    }, 2000);
  };
  
  // Removed duplicate handleLikeArticle and fixed missing incrementRecipeViewed import

  const handleLikeArticle = (articleId) => {
    const article = articles.find(a => a.id === articleId);
    if (likedArticles.has(articleId)) {
      likeArticle(articleId);
      toast({
        title: "Like Removed",
        description: "Article removed from your liked articles.",
      });
    } else {
      likeArticle(articleId);
      if (article) {
        addRecipeViewNotification(article.title);
        incrementRecipeViewed();
        console.log('incrementRecipeViewed called');
        toast({
          title: "Article Liked!",
          description: "Article added to your liked articles.",
        });
      }
    }
  };

  const handleBookmarkArticle = (articleId) => {
    const article = articles.find(a => a.id === articleId);
    if (bookmarkedArticles.has(articleId)) {
      bookmarkArticle(articleId);
      toast({
        title: "Bookmark Removed",
        description: "Article removed from your bookmarks.",
      });
    } else {
      bookmarkArticle(articleId);
      if (article) {
        addGeneralNotification("Article Bookmarked", `"${article.title}" has been saved to your bookmarks.`, "info");
        toast({
          title: "Article Bookmarked!",
          description: "Article saved to your bookmarks.",
        });
      }
    }
  };

  const handleRegisterWebinar = (webinarId) => {
    const webinar = webinars.find(w => w.id === webinarId);
    if (registeredWebinars.has(webinarId)) {
      toast({
        title: "Already Registered",
        description: "You're already registered for this webinar.",
      });
    } else {
      registerWebinar(webinarId);
      if (webinar) {
        addGeneralNotification("Webinar Registration", `You're now registered for "${webinar.title}" on ${webinar.date}.`, "info");
        toast({
          title: "Registration Successful!",
          description: "You're now registered for the webinar. Check your email for details.",
        });
      }
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

  const handleDownloadCertificate = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (course && courseProgress.get(courseId) === 100) {
      toast({
        title: "Certificate Downloaded!",
        description: `Your completion certificate for "${course.title}" has been downloaded.`,
      });
    } else {
      toast({
        title: "Complete Course First",
        description: "You need to complete the course to download the certificate.",
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
      <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-900 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-foreground" />
            <span className="dark:text-foreground">Education Center</span>
          </CardTitle>
          <p className="text-gray-600 dark:text-muted-foreground">Learn, grow, and become a sustainability champion</p>
         </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search courses, articles, webinars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-background dark:text-foreground"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md dark:bg-background dark:border-border dark:text-foreground"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id} className="dark:bg-background dark:text-foreground">
                    {category.label}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={() => toast({ title: "Filter Options", description: "Advanced filtering options coming soon!" })} className="dark:border-border dark:text-foreground dark:hover:bg-muted">
                <Filter className="w-4 h-4 dark:text-foreground" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses" className="dark:text-foreground">Courses</TabsTrigger>
            <TabsTrigger value="articles" className="dark:text-foreground">Articles</TabsTrigger>
            <TabsTrigger value="webinars" className="dark:text-foreground">Webinars</TabsTrigger>
            <TabsTrigger value="achievements" className="dark:text-foreground">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 dark:bg-card dark:border-border">
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
                      <Badge variant="outline" className="bg-white/90 dark:bg-background dark:text-foreground">
                        {course.price}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-primary transition-colors dark:text-foreground">
                          {course.title}
                        </h3>
 <p className="text-sm text-gray-600 dark:text-muted-foreground">{course.description}</p>
 <p className="text-xs text-gray-500 mt-1 dark:text-muted-foreground">By {course.instructor}</p>
 </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-muted-foreground">
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

          {/* Course Detail Modal - Positioned below courses */}
          {selectedCourse && (
            <Card className="bg-white/95 rounded-xl border border-blue-100 mt-6 dark:bg-background dark:border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground mb-2">{selectedCourse.title}</h2>
                    <p className="text-gray-600 mb-3 dark:text-muted-foreground">{selectedCourse.description}</p>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge className={getLevelColor(selectedCourse.level)}>
                        {selectedCourse.level}
                      </Badge>
                      <Badge variant="outline" className="dark:border-border dark:text-foreground">{selectedCourse.duration}</Badge>
                      <Badge variant="outline" className="dark:border-border dark:text-foreground">{selectedCourse.price}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-muted-foreground">
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
                  <Button variant="ghost" onClick={() => setSelectedCourse(null)} className="dark:text-foreground">
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
                      {selectedCourse.content?.map((lesson, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className={`w-4 h-4 ${lesson.completed ? 'text-green-500' : 'text-gray-300 dark:text-gray-500'}`} />
                            <div>
                              <span className={lesson.completed ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}>
                                {lesson.title}
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{lesson.duration}</div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleWatchLesson(lesson, selectedCourse.id)}
                            disabled={watchingVideo}
                            className="dark:text-foreground"
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
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
 onClick={() => enrolledCourses.has(selectedCourse.id) ? null : handleEnrollCourse(selectedCourse.id)}
                  >
                    {enrolledCourses.has(selectedCourse.id) ? 'Continue Learning' : 'Enroll Now'} 
                  </Button>
 <Button
                    variant="outline" 
                    onClick={() => handleBookmarkArticle(selectedCourse.id)}
                    className="dark:border-border dark:text-foreground"
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Bookmark
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleDownloadCertificate(selectedCourse.id)}
                    className="dark:border-border dark:text-foreground"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Certificate
                  </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">{article.excerpt}</p> 
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {article.tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div> 

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-muted-foreground">
                      <span>By {article.author}</span>
                      <span>{article.publishDate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-muted-foreground">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeArticle(article.id)}
                          className={likedArticles.has(article.id) ? 'text-red-500' : ''}
                        >
                          <ThumbsUp className={`w-4 h-4 mr-1 ${likedArticles.has(article.id) ? 'fill-current' : ''}`} />
                          {article.likes + (likedArticles.has(article.id) ? 1 : 0)}
                        </Button>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{article.comments}</span>
                        </div>
                      </div>
              <Button 
                size="sm" 
                onClick={() => {
                  setSelectedArticle(article);
                  incrementRecipeViewed();
                }}
              >
                Read Article
              </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Article Detail Modal */}
          {selectedArticle && (
            <Card className="bg-white/95 rounded-xl border border-blue-100 mt-6 dark:bg-background dark:border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground mb-2">{selectedArticle.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-muted-foreground mb-4">
                      <span>By {selectedArticle.author}</span>
                      <span>•</span>
                      <span>{selectedArticle.readTime}</span>
                      <span>•</span>
                      <span>{selectedArticle.publishDate}</span>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedArticle(null)} className="dark:text-foreground">
                    ✕
                  </Button>
                </div>

                <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-64 object-cover rounded-lg mb-6" />
                
                <div className="prose max-w-none mb-6">
                  <div className="whitespace-pre-line text-gray-700 dark:text-muted-foreground leading-relaxed">
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
                          <h3 className="font-semibold text-lg dark:text-foreground">{webinar.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 dark:text-muted-foreground">{webinar.description}</p>
 <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-muted-foreground">
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
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Registered</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-2 dark:text-muted-foreground">
                            {webinar.attendees}/{webinar.maxAttendees} 
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => setSelectedWebinar(webinar)}
                              variant="outline"
                            >
                              View Details
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleRegisterWebinar(webinar.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {registeredWebinars.has(webinar.id) ? 'Registered ✓' : webinar.status === 'upcoming' ? 'Register' : 'Watch'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Webinar Detail Modal */}
          {selectedWebinar && (
            <Card className="bg-white/95 rounded-xl border border-blue-100 mt-6">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedWebinar.title}</h2>
                    <p className="text-gray-600 mb-3 dark:text-muted-foreground">{selectedWebinar.description}</p>
 <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-muted-foreground">
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
                  <div className="text-sm text-gray-600 dark:text-muted-foreground">
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
                  <Button variant="outline" onClick={() => toast({ title: "Calendar Event", description: "Event added to your calendar!" })}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`text-center p-6 ${achievement.earned ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700' : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'}`}>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    {achievement.earned ? (
                      <CheckCircle className="w-8 h-8 text-white" />
                    ) : (
                      <Award className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <h3 className={`font-medium mb-2 ${achievement.earned ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-muted-foreground'}`}>
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 dark:text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">
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
                    <span className="font-medium dark:text-foreground">Courses Completed</span>
                    <span className="font-semibold text-blue-600">{userStats.coursesCompleted}/10</span>
                  </div>
                  <Progress value={(userStats.coursesCompleted / 10) * 100} className="h-3" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium dark:text-foreground">Articles Read</span>
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
                  <div className="flex items-center justify-between mb-2 dark:text-foreground">
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
