import React, { useState, useEffect } from 'react';
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
  Share2,
} from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  rating: number;
  students: number;
  category: string;
  thumbnail: string;
  lessons: number;
  content: string[];
}

interface Article {
  id: number;
  title: string;
  excerpt: string;
  readTime: string;
  author: string;
  category: string;
  image: string;
  tags: string[];
  content?: string;
}

interface Webinar {
  id: number;
  title: string;
  speaker: string;
  date: string;
  time: string;
  duration: string;
  attendees: number;
  status: 'upcoming' | 'recorded';
  thumbnail: string;
}

interface UserEducationData {
    completedCourses: number[];
    courseProgress: Record<number, number[]>; // Map course ID to array of completed lesson indices
    readArticles: number[];
    attendedWebinars: number[];
    registeredWebinars: number[];
    // Optionally add searchQuery and selectedCategory
}

const EducationCenter = () => {
  const { user } = useAuth(); // Get user from useAuth
  const { userStats, incrementCourseCompleted } = useUserData(); // userStats might still be useful for displaying overall stats
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null); // Specify type
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null); // Specify type
  const [firebaseUserEducationData, setFirebaseUserEducationData] = useState<UserEducationData>({ // New state for Firebase data
      completedCourses: [],
      courseProgress: {},
      readArticles: [],
      attendedWebinars: [],
      registeredWebinars: [],
  });


  // Fetch user education data
  useEffect(() => {
    if (!user) {
      setFirebaseUserEducationData({
          completedCourses: [],
          courseProgress: {},
          readArticles: [],
          attendedWebinars: [],
          registeredWebinars: [],
      });
      return;
    }

    const userEducationRef = doc(db, 'users', user.uid, 'education', 'data');
    const unsubscribeEducationData = onSnapshot(userEducationRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserEducationData; // Cast with proper type
        setFirebaseUserEducationData(data);
        // Optionally set searchQuery and selectedCategory here if you want to persist them
      } else {
        // Initialize if no data exists
         setFirebaseUserEducationData({
            completedCourses: [],
            courseProgress: {},
            readArticles: [],
            attendedWebinars: [],
            registeredWebinars: [],
         });
        // Optionally create the document with initial empty values
         setDoc(userEducationRef, {
           completedCourses: [],
           courseProgress: {},
           readArticles: [],
           attendedWebinars: [],
           registeredWebinars: [],
         }).catch(error => console.error("Error initializing user education data:", error));
      }
    }, (error) => {
      console.error('Error fetching user education data:', error);
    });

    return () => unsubscribeEducationData();
  }, [user]);


  const courses: Course[] = [ // Specify type
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
      content: [
        'Introduction to Sustainable Living',
        'Energy Conservation at Home',
        'Waste Reduction Strategies',
        'Sustainable Transportation',
        'Green Shopping Guide',
        'Water Conservation Tips',
        'Eco-Friendly Diet Choices',
        'Building Sustainable Habits',
      ],
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
      content: [ /* Add lesson titles */ ]
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
      content: [ /* Add lesson titles */ ]
    },
  ];

  const articles: Article[] = [ // Specify type
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
      `,
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
    },
    {
      id: 3,
      title: 'Renewable Energy: A Homeowner\'s Guide',
      excerpt: 'Everything you need to know about solar panels and wind energy',
      readTime: '12 min read',
      author: 'Mike Rodriguez',
      category: 'energy',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
      tags: ['Solar', 'Wind', 'Home Energy'],
    },
  ];

  const webinars: Webinar[] = [ // Specify type
    {
      id: 1,
      title: 'Climate Action: What Individuals Can Do',
      speaker: 'Dr. Climate Expert',
      date: '2024-06-20',
      time: '2:00 PM EST',
      duration: '1 hour',
      attendees: 342,
      status: 'upcoming',
      thumbnail: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400',
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
      thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400',
    },
  ];

  // Achievements data - should be based on userStats or firebaseUserEducationData
  const achievements = [
    { id: 1, name: 'Course Completion Badge', earned: firebaseUserEducationData.completedCourses.length >= 1 },
    { id: 2, name: 'Sustainability Advocate', earned: firebaseUserEducationData.completedCourses.length >= 2 },
    { id: 3, name: 'Carbon Warrior', earned: firebaseUserEducationData.completedCourses.length >= 3 },
    { id: 4, name: 'Eco Expert', earned: firebaseUserEducationData.completedCourses.length >= 5 }, // Example goal
  ];

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'carbon', label: 'Carbon' },
    { id: 'business', label: 'Business' },
    { id: 'energy', label: 'Energy' },
    { id: 'waste-reduction', label: 'Waste' },
    { id: 'fashion', label: 'Fashion' },
  ];

  const handleCompleteLesson = async (courseId: number, lessonIndex: number) => { // New function to mark lesson complete
      if (!user) return;

      const userEducationRef = doc(db, 'users', user.uid, 'education', 'data');
      const currentCourseProgress = firebaseUserEducationData.courseProgress[courseId] || [];

      if (!currentCourseProgress.includes(lessonIndex)) {
          const updatedCourseProgress = {
              ...firebaseUserEducationData.courseProgress,
              [courseId]: [...currentCourseProgress, lessonIndex],
          };

          await updateDoc(userEducationRef, {
              courseProgress: updatedCourseProgress,
          });

          // Check if course is completed
          const course = courses.find(c => c.id === courseId);
          if (course && updatedCourseProgress[courseId].length === course.lessons) {
              await updateDoc(userEducationRef, {
                  completedCourses: arrayUnion(courseId)
              });
               incrementCourseCompleted(); // Update userStats in Firebase via useUserData
          }

           // State will be updated by the onSnapshot listener
      }
  };


  const handleContinueLearning = (course: Course) => { // Specify type
    setSelectedCourse(course);
     // Logic to display the course content and track lesson completion will be needed here
     // You will call handleCompleteLesson when a user finishes a lesson
  };

  const handleStartCourse = (course: Course) => { // Specify type
    setSelectedCourse(course);
    // Initialize course progress in Firebase if it doesn't exist
     if (!firebaseUserEducationData.courseProgress[course.id]) {
         const userEducationRef = doc(db, 'users', user.uid, 'education', 'data');
          updateDoc(userEducationRef, {
             courseProgress: {
                 ...firebaseUserEducationData.courseProgress,
                 [course.id]: [] // Initialize with empty array of completed lessons
             }
         }).catch(error => console.error("Error initializing course progress:", error));
     }
     // Logic to display the first lesson or course overview
  };

  const handleReadArticle = async (article: Article) => { // Make async, specify type
     if (!user) return;

     const userEducationRef = doc(db, 'users', user.uid, 'education', 'data');

      if (!firebaseUserEducationData.readArticles.includes(article.id)) {
          await updateDoc(userEducationRef, {
              readArticles: arrayUnion(article.id) // Add article ID to readArticles array
          });
          // You might want to increment a counter for articles read in userStats here if needed
      }

    setSelectedArticle(article); // Display the article content
  };

  const handleRegisterWebinar = async (webinarId: number) => { // New function, make async, specify type
      if (!user) return;

      const userEducationRef = doc(db, 'users', user.uid, 'education', 'data');

       if (!firebaseUserEducationData.registeredWebinars.includes(webinarId)) {
           await updateDoc(userEducationRef, {
               registeredWebinars: arrayUnion(webinarId) // Add webinar ID to registeredWebinars array
           });
           // State will be updated by the onSnapshot listener
           alert('Registered for webinar!'); // Or use a toast
       } else {
           alert('Already registered for this webinar.'); // Or use a toast
       }
  };

   const handleAttendWebinar = async (webinarId: number) => { // New function, make async, specify type
        if (!user) return;

        const userEducationRef = doc(db, 'users', user.uid, 'education', 'data');

        if (!firebaseUserEducationData.attendedWebinars.includes(webinarId)) {
            await updateDoc(userEducationRef, {
                attendedWebinars: arrayUnion(webinarId) // Add webinar ID to attendedWebinars array
            });
             // Remove from registered webinars if it was there
             if (firebaseUserEducationData.registeredWebinars.includes(webinarId)) {
                  await updateDoc(userEducationRef, {
                      registeredWebinars: arrayRemove(webinarId)
                  });
             }
            // State will be updated by the onSnapshot listener
            alert('Marked as attended!'); // Or use a toast
             // You might want to add points or update userStats here
        } else {
            alert('Already marked as attended.'); // Or use a toast
        }
   };


  const handleShareArticle = (article: Article) => { // Specify type
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href, // Consider using a specific article URL
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  const getLevelColor = (level: string) => { // Specify type
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

  const getCourseProgress = (courseId: number) => { // Helper to calculate progress
       const completedLessons = firebaseUserEducationData.courseProgress[courseId]?.length || 0;
       const course = courses.find(c => c.id === courseId);
       if (!course || course.lessons === 0) return 0;
       return (completedLessons / course.lessons) * 100;
  };

   const isCourseCompleted = (courseId: number) => { // Helper to check if course is completed
       return firebaseUserEducationData.completedCourses.includes(courseId);
   };

    const isArticleRead = (articleId: number) => { // Helper to check if article is read
        return firebaseUserEducationData.readArticles.includes(articleId);
    };

     const isWebinarRegistered = (webinarId: number) => { // Helper to check if webinar is registered
        return firebaseUserEducationData.registeredWebinars.includes(webinarId);
    };

    const isWebinarAttended = (webinarId: number) => { // Helper to check if webinar is attended
        return firebaseUserEducationData.attendedWebinars.includes(webinarId);
    };


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
                  <Badge className={getLevelColor(selectedCourse.level)}>{selectedCourse.level}</Badge>
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
                    <span>Completed: {(firebaseUserEducationData.courseProgress[selectedCourse.id]?.length || 0)}/{selectedCourse.lessons} lessons</span> {/* Use Firebase data */}
                    <span>{Math.round(getCourseProgress(selectedCourse.id))}%</span> {/* Use helper */}
                  </div>
                  <Progress value={getCourseProgress(selectedCourse.id)} className="h-3" /> {/* Use helper */}
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
                      <CheckCircle className={`w-4 h-4 ${firebaseUserEducationData.courseProgress[selectedCourse.id]?.includes(index) ? 'text-green-500' : 'text-gray-300'}`} /> {/* Use Firebase data */}
                      <span className={firebaseUserEducationData.courseProgress[selectedCourse.id]?.includes(index) ? 'text-gray-800' : 'text-gray-500'}> {/* Use Firebase data */}
                        {lesson}
                      </span>
                       {/* Add a button here to mark lesson as complete */}
                         {!firebaseUserEducationData.courseProgress[selectedCourse.id]?.includes(index) && (
                            <Button size="sm" variant="outline" onClick={() => handleCompleteLesson(selectedCourse.id, index)}>Mark Complete</Button>
                         )}
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
               {isArticleRead(selectedArticle.id) && ( // Display "Read" badge
                   <Badge className="bg-green-500 text-white">Read</Badge>
               )}
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
                    <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
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

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
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

                    {/* Use getCourseProgress helper and isCourseCompleted helper */}
                    {(getCourseProgress(course.id) > 0 || isCourseCompleted(course.id)) && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{(firebaseUserEducationData.courseProgress[course.id]?.length || 0)}/{course.lessons} lessons</span>
                        </div>
                        <Progress value={getCourseProgress(course.id)} className="h-2" />
                      </div>
                    )}

                    <Button
                      className="w-full"
                      variant={isCourseCompleted(course.id) ? 'default' : (getCourseProgress(course.id) > 0 ? 'secondary' : 'default')}
                      onClick={() => isCourseCompleted(course.id) ? setSelectedCourse(course) : (getCourseProgress(course.id) > 0 ? handleContinueLearning(course) : handleStartCourse(course))}
                      disabled={isCourseCompleted(course.id)} // Disable button if completed
                    >
                      {isCourseCompleted(course.id) ? 'Completed' : (getCourseProgress(course.id) > 0 ? 'Continue Learning' : 'Start Course')}
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
                         {isArticleRead(article.id) ? 'Read Again' : 'Read Article'} {/* Change button text */}
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
                      {webinar.status === 'upcoming' ? (
                           <Button size="sm" onClick={() => handleRegisterWebinar(webinar.id)}>
                              {isWebinarRegistered(webinar.id) ? 'Registered' : 'Register'} {/* Change button text */}
                           </Button>
                      ) : (
                           <Button size="sm" onClick={() => handleAttendWebinar(webinar.id)}>
                               {isWebinarAttended(webinar.id) ? 'Attended' : 'Mark as Attended'} {/* Change button text */}
                           </Button>
                      )}
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
                  <span className="font-semibold">{firebaseUserEducationData.completedCourses.length}/10</span> {/* Use Firebase data */}
                </div>
                {/* Progress value will be based on a total goal, not necessarily the count of completed courses */}
                {/* <Progress value={(firebaseUserEducationData.completedCourses.length / 10) * 100} className="h-2" /> */}

                <div className="flex items-center justify-between">
                  <span>Articles Read</span>
                  <span className="font-semibold">{firebaseUserEducationData.readArticles.length}/50</span> {/* Use Firebase data */}
                </div>
                 {/* Progress value will be based on a total goal, not necessarily the count of read articles */}
                {/* <Progress value={(firebaseUserEducationData.readArticles.length / 50) * 100} className="h-2" /> */}

                <div className="flex items-center justify-between">
                  <span>Webinars Attended</span>
                  <span className="font-semibold">{firebaseUserEducationData.attendedWebinars.length}/5</span> {/* Use Firebase data */}
                </div>
                 {/* Progress value will be based on a total goal, not necessarily the count of attended webinars */}
                {/* <Progress value={(firebaseUserEducationData.attendedWebinars.length / 5) * 100} className="h-2" /> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EducationCenter;