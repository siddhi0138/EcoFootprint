import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  TrendingUp,
  Plus
} from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationHelper } from '@/hooks/useNotificationHelper';
import { sendEmail } from '@/services/emailApi';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const EducationCenter = () => {
  const { currentUser, requestCalendarAccess } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  // Tracks which lesson indices are done, per course, so checkmarks + progress reflect reality.
  const [completedLessons, setCompletedLessons] = useState<Record<string, Set<number>>>({});

  // Real, Firestore-backed content - loaded live instead of hardcoded, same pattern as Community
  // Hub's groups/events/challenges. Anyone can add a course/article/webinar; it shows up for
  // everyone immediately via onSnapshot.
  const [courses, setCourses] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [webinars, setWebinars] = useState<any[]>([]);

  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '', description: '', category: 'lifestyle', level: 'Beginner', duration: '', instructor: '', price: 'Free', skills: '',
  });
  const [newLessons, setNewLessons] = useState([{ title: '', duration: '', body: '' }]);

  const [showCreateArticle, setShowCreateArticle] = useState(false);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', excerpt: '', category: 'waste-reduction', readTime: '', tags: '', content: '' });

  const [showCreateWebinar, setShowCreateWebinar] = useState(false);
  const [isCreatingWebinar, setIsCreatingWebinar] = useState(false);
  const [newWebinar, setNewWebinar] = useState({
    title: '', speaker: '', date: '', time: '', duration: '', description: '', topics: '', price: 'Free', maxAttendees: '',
  });

  const {
    enrolledCourses,
    courseProgress,
    enrollInCourse,
    updateCourseProgress,
    userStats,
    incrementCourseCompleted,
    incrementArticlesRead,
  } = useUserData();
  const { addCourseCompletionNotification, addGeneralNotification } = useNotificationHelper();
  // Remove local state for likedArticles, bookmarkedArticles, registeredWebinars
  // const [likedArticles, setLikedArticles] = useState(new Set());
  // const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  // const [registeredWebinars, setRegisteredWebinars] = useState(new Set());

  // Use from context instead
  const {
    likedArticles,
    bookmarkedArticles,
    bookmarkedCourses,
    registeredWebinars,
    likeArticle,
    bookmarkArticle,
    bookmarkCourse,
    registerWebinar,
  } = useUserData();
  const { toast } = useToast();

  // Real, Firestore-backed courses/articles/webinars - loaded live (same pattern as Community
  // Hub's groups/events/challenges) instead of hardcoded, so anything added via the Create
  // forms below shows up for everyone immediately.
  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    }, (error) => console.error('Error loading courses:', error));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setArticles(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    }, (error) => console.error('Error loading articles:', error));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'webinars'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWebinars(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    }, (error) => console.error('Error loading webinars:', error));
    return () => unsubscribe();
  }, []);


  const achievements = [
    { id: 1, name: 'Course Completion Badge', earned: userStats.coursesCompleted >= 1, description: 'Complete your first course' },
    { id: 2, name: 'Sustainability Advocate', earned: userStats.coursesCompleted >= 2, description: 'Complete 2 courses' },
    { id: 3, name: 'Carbon Warrior', earned: userStats.coursesCompleted >= 3, description: 'Complete the Carbon Footprint course' },
    { id: 4, name: 'Eco Expert', earned: userStats.coursesCompleted >= 5, description: 'Complete 5 courses' },
    { id: 5, name: 'Knowledge Seeker', earned: userStats.articlesRead >= 10, description: 'Read 10 articles' },
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

  const addLessonRow = () => setNewLessons(prev => [...prev, { title: '', duration: '', body: '' }]);
  const removeLessonRow = (index: number) => setNewLessons(prev => prev.filter((_, i) => i !== index));
  const updateLessonRow = (index: number, field: 'title' | 'duration' | 'body', value: string) =>
    setNewLessons(prev => prev.map((lesson, i) => (i === index ? { ...lesson, [field]: value } : lesson)));

  const handleCreateCourse = async () => {
    if (!currentUser) {
      toast({ title: 'Login Required', description: 'Please log in to add a course.', variant: 'destructive' });
      return;
    }
    if (!newCourse.title.trim() || !newCourse.description.trim() || !newCourse.instructor.trim()) {
      toast({ title: 'Missing Information', description: 'Please fill in the title, description, and instructor.', variant: 'destructive' });
      return;
    }
    const validLessons = newLessons.filter(l => l.title.trim() && l.body.trim());
    if (validLessons.length === 0) {
      toast({ title: 'Add at Least One Lesson', description: 'A course needs at least one lesson with a title and content.', variant: 'destructive' });
      return;
    }
    setIsCreatingCourse(true);
    try {
      await addDoc(collection(db, 'courses'), {
        title: newCourse.title.trim(),
        description: newCourse.description.trim(),
        category: newCourse.category,
        level: newCourse.level,
        duration: newCourse.duration.trim() || 'Self-paced',
        instructor: newCourse.instructor.trim(),
        price: newCourse.price.trim() || 'Free',
        thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
        rating: 0,
        students: 0,
        content: validLessons.map(l => ({ title: l.title.trim(), duration: l.duration.trim() || '10 min', body: l.body.trim() })),
        skills: newCourse.skills.split(',').map(s => s.trim()).filter(Boolean),
        creatorId: currentUser.uid,
        creatorName: currentUser.name || currentUser.email,
        createdAt: serverTimestamp(),
      });
      setNewCourse({ title: '', description: '', category: 'lifestyle', level: 'Beginner', duration: '', instructor: '', price: 'Free', skills: '' });
      setNewLessons([{ title: '', duration: '', body: '' }]);
      setShowCreateCourse(false);
      toast({ title: 'Course Added!', description: `"${newCourse.title}" is now live in the Education Center.` });
    } catch (error) {
      console.error('Error creating course:', error);
      toast({ title: 'Could Not Add Course', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleCreateArticle = async () => {
    if (!currentUser) {
      toast({ title: 'Login Required', description: 'Please log in to add an article.', variant: 'destructive' });
      return;
    }
    if (!newArticle.title.trim() || !newArticle.excerpt.trim() || !newArticle.content.trim()) {
      toast({ title: 'Missing Information', description: 'Please fill in the title, excerpt, and content.', variant: 'destructive' });
      return;
    }
    setIsCreatingArticle(true);
    try {
      await addDoc(collection(db, 'articles'), {
        title: newArticle.title.trim(),
        excerpt: newArticle.excerpt.trim(),
        content: newArticle.content.trim(),
        category: newArticle.category,
        readTime: newArticle.readTime.trim() || '5 min read',
        author: currentUser.name || currentUser.email || 'EcoScope Member',
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
        tags: newArticle.tags.split(',').map(t => t.trim()).filter(Boolean),
        likes: 0,
        comments: 0,
        publishDate: new Date().toISOString().slice(0, 10),
        creatorId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setNewArticle({ title: '', excerpt: '', category: 'waste-reduction', readTime: '', tags: '', content: '' });
      setShowCreateArticle(false);
      toast({ title: 'Article Published!', description: `"${newArticle.title}" is now live in the Education Center.` });
    } catch (error) {
      console.error('Error creating article:', error);
      toast({ title: 'Could Not Publish Article', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsCreatingArticle(false);
    }
  };

  const handleCreateWebinar = async () => {
    if (!currentUser) {
      toast({ title: 'Login Required', description: 'Please log in to add a webinar.', variant: 'destructive' });
      return;
    }
    if (!newWebinar.title.trim() || !newWebinar.speaker.trim() || !newWebinar.date || !newWebinar.time.trim()) {
      toast({ title: 'Missing Information', description: 'Please fill in the title, speaker, date, and time.', variant: 'destructive' });
      return;
    }
    setIsCreatingWebinar(true);
    try {
      const status = new Date(newWebinar.date) >= new Date(new Date().toDateString()) ? 'upcoming' : 'recorded';
      await addDoc(collection(db, 'webinars'), {
        title: newWebinar.title.trim(),
        speaker: newWebinar.speaker.trim(),
        date: newWebinar.date,
        time: newWebinar.time.trim(),
        duration: newWebinar.duration.trim() || '1 hour',
        description: newWebinar.description.trim(),
        topics: newWebinar.topics.split(',').map(t => t.trim()).filter(Boolean),
        price: newWebinar.price.trim() || 'Free',
        maxAttendees: parseInt(newWebinar.maxAttendees, 10) || 100,
        attendees: 0,
        status,
        thumbnail: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400',
        creatorId: currentUser.uid,
        creatorName: currentUser.name || currentUser.email,
        createdAt: serverTimestamp(),
      });
      setNewWebinar({ title: '', speaker: '', date: '', time: '', duration: '', description: '', topics: '', price: 'Free', maxAttendees: '' });
      setShowCreateWebinar(false);
      toast({ title: 'Webinar Added!', description: `"${newWebinar.title}" is now live in the Education Center.` });
    } catch (error) {
      console.error('Error creating webinar:', error);
      toast({ title: 'Could Not Add Webinar', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsCreatingWebinar(false);
    }
  };

  const handleEnrollCourse = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    enrollInCourse(courseId, course ? { title: course.title, instructor: course.instructor, level: course.level, category: course.category } : undefined);

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

  // Marks a specific lesson complete, tracks it per-course, and derives course progress from the
  // number of lessons actually finished (so the % and checkmarks always agree).
  const handleWatchLesson = (lesson, courseId, lessonIndex) => {
    const course = courses.find(c => c.id === courseId);
    const totalLessons = course?.content?.length || course?.lessons || 8;
    const already = completedLessons[courseId] || new Set<number>();
    if (already.has(lessonIndex)) return;
    const updated = new Set(already);
    updated.add(lessonIndex);
    setCompletedLessons(prev => ({ ...prev, [courseId]: updated }));

    const newProgress = Math.min(Math.round((updated.size / totalLessons) * 100), 100);
    updateCourseProgress(courseId, newProgress, course ? { title: course.title } : undefined);

    if (newProgress >= 100) {
      incrementCourseCompleted();
      addCourseCompletionNotification(course?.title || 'Course');
      toast({
        title: "Course Completed! 🎉",
        description: "Congratulations! You've completed the course. Download your certificate below.",
      });
    } else {
      toast({
        title: "Lesson Complete",
        description: `Great job completing "${lesson.title}"! Continue to the next lesson.`,
      });
    }
  };
  
  const handleLikeArticle = (articleId) => {
    const article = articles.find(a => a.id === articleId);
    const meta = article ? { title: article.title, author: article.author, category: article.category } : undefined;
    if (likedArticles.has(articleId)) {
      likeArticle(articleId, meta);
      toast({
        title: "Like Removed",
        description: "Article removed from your liked articles.",
      });
    } else {
      likeArticle(articleId, meta);
      if (article) {
        addGeneralNotification("Article Liked", `You liked "${article.title}".`, "info");
        toast({
          title: "Article Liked!",
          description: "Article added to your liked articles.",
        });
      }
    }
  };

  const handleBookmarkCourse = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    const meta = course ? { title: course.title, instructor: course.instructor, level: course.level, category: course.category } : undefined;
    if (bookmarkedCourses.has(courseId)) {
      bookmarkCourse(courseId, meta);
      toast({
        title: "Bookmark Removed",
        description: "Course removed from your bookmarks.",
      });
    } else {
      bookmarkCourse(courseId, meta);
      if (course) {
        addGeneralNotification("Course Bookmarked", `"${course.title}" has been saved to your bookmarks.`, "info");
        toast({
          title: "Course Bookmarked!",
          description: "Course saved to your bookmarks.",
        });
      }
    }
  };

  const handleBookmarkArticle = (articleId) => {
    const article = articles.find(a => a.id === articleId);
    const meta = article ? { title: article.title, author: article.author, category: article.category } : undefined;
    if (bookmarkedArticles.has(articleId)) {
      bookmarkArticle(articleId, meta);
      toast({
        title: "Bookmark Removed",
        description: "Article removed from your bookmarks.",
      });
    } else {
      bookmarkArticle(articleId, meta);
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
      registerWebinar(webinarId, webinar ? { title: webinar.title, speaker: webinar.speaker, date: webinar.date, time: webinar.time } : undefined);
      if (webinar) {
        addGeneralNotification("Webinar Registration", `You're now registered for "${webinar.title}" on ${webinar.date}.`, "info");
        toast({
          title: "Registration Successful!",
          description: `You're registered for "${webinar.title}" on ${webinar.date} at ${webinar.time}.`,
        });
      }
    }
  };

  // Inserts the event directly into the user's own Google Calendar via the Calendar API - fully
  // automatic, no manual "save" step. The first click needs a one-time consent popup (Google
  // requires explicit permission before any app can write to a calendar - unavoidable), captured
  // via requestCalendarAccess(); every click after that in the same session reuses the cached
  // token and inserts silently.
  const handleAddToCalendar = async (webinar) => {
    const hasAccess = await requestCalendarAccess();
    if (!hasAccess) {
      toast({
        title: 'Calendar Access Needed',
        description: 'Please approve calendar access using the same Google account you\'re logged into EcoScope with, then try again.',
        variant: 'destructive',
      });
      return;
    }

    let start = new Date(`${webinar.date} ${(webinar.time || '').replace(/\s*[A-Z]{2,4}$/, '')}`);
    if (isNaN(start.getTime())) start = new Date(webinar.date);
    if (isNaN(start.getTime())) start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const accessToken = sessionStorage.getItem('googleCalendarAccessToken');
    try {
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: webinar.title,
          description: `${webinar.description || ''}\n\nSpeaker: ${webinar.speaker || ''}\nHosted via EcoScope`,
          location: 'Online webinar',
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
          // Daily countdown reminders: 3 days before, 2 days before, 1 day before, and the
          // morning of the event (Google Calendar allows up to 5 custom overrides per event).
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 3 * 24 * 60 },
              { method: 'popup', minutes: 2 * 24 * 60 },
              { method: 'popup', minutes: 1 * 24 * 60 },
              { method: 'popup', minutes: 60 },
            ],
          },
        }),
      });
      if (res.ok) {
        toast({ title: 'Added to Google Calendar', description: `"${webinar.title}" was added with daily reminders starting 3 days before the event.` });
        return;
      }
      const errText = await res.text();
      console.error('Calendar API error:', errText);
      // Token likely expired/invalid - drop it so the next click re-requests fresh consent.
      sessionStorage.removeItem('googleCalendarAccessToken');
      toast({ title: 'Could Not Add Event', description: 'Calendar access may have expired - click Add to Calendar again to reauthorize.', variant: 'destructive' });
    } catch (err) {
      console.error('Failed to add event via Calendar API:', err);
      toast({ title: 'Could Not Add Event', description: 'Something went wrong adding this to your calendar. Please try again.', variant: 'destructive' });
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

  // Builds a real landscape PDF certificate with jsPDF.
  const buildCertificatePdf = (course, recipientName: string, completionDate: string) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    // Border
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(6);
    doc.rect(24, 24, w - 48, h - 48);
    doc.setLineWidth(1);
    doc.rect(36, 36, w - 72, h - 72);

    doc.setTextColor(5, 150, 105);
    doc.setFont('times', 'bold');
    doc.setFontSize(34);
    doc.text('Certificate of Completion', w / 2, 130, { align: 'center' });

    doc.setTextColor(60, 60, 60);
    doc.setFont('times', 'normal');
    doc.setFontSize(16);
    doc.text('This certifies that', w / 2, 185, { align: 'center' });

    doc.setTextColor(17, 24, 39);
    doc.setFont('times', 'bold');
    doc.setFontSize(28);
    doc.text(recipientName, w / 2, 230, { align: 'center' });
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(1.5);
    const nameWidth = doc.getTextWidth(recipientName);
    doc.line(w / 2 - nameWidth / 2 - 20, 240, w / 2 + nameWidth / 2 + 20, 240);

    doc.setTextColor(60, 60, 60);
    doc.setFont('times', 'normal');
    doc.setFontSize(16);
    doc.text('has successfully completed', w / 2, 285, { align: 'center' });

    doc.setTextColor(5, 150, 105);
    doc.setFont('times', 'italic');
    doc.setFontSize(22);
    doc.text(course.title, w / 2, 325, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('times', 'normal');
    doc.setFontSize(13);
    doc.text(`Instructor: ${course.instructor}  •  ${course.duration}`, w / 2, 365, { align: 'center' });
    doc.text(`Completed on ${completionDate}`, w / 2, 385, { align: 'center' });
    doc.setFontSize(11);
    doc.text('EcoScope — Sustainability Education', w / 2, h - 60, { align: 'center' });
    return doc;
  };

  const handleDownloadCertificate = async (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!(course && courseProgress.get(courseId) === 100)) {
      toast({ title: 'Complete Course First', description: 'You need to complete the course to get the certificate.' });
      return;
    }
    const recipientName = currentUser?.name || currentUser?.email || 'EcoScope Learner';
    const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // 1) Download the real PDF certificate.
    const pdf = buildCertificatePdf(course, recipientName, completionDate);
    const fileName = `${course.title.replace(/[^a-z0-9]+/gi, '-')}-certificate.pdf`;
    pdf.save(fileName);
    toast({ title: 'Certificate Downloaded!', description: `Your certificate for "${course.title}" was saved as a PDF.` });

    // 2) Also email it - with the SAME PDF attached (not just an HTML copy) - if email delivery
    // is configured. datauristring's payload is already base64, just strip the data: URI prefix.
    if (currentUser?.email) {
      const dataUri = pdf.output('datauristring');
      const attachmentBase64 = dataUri.split(',')[1];
      const html = `
        <div style="font-family:Georgia,serif;text-align:center;border:8px solid #059669;padding:40px;max-width:640px;margin:0 auto">
          <h1 style="color:#059669;margin:0 0 8px">Certificate of Completion</h1>
          <p style="color:#374151">This certifies that</p>
          <div style="font-size:24px;margin:16px 0;border-bottom:2px solid #059669;display:inline-block;padding-bottom:6px">${recipientName}</div>
          <p style="color:#374151">has successfully completed</p>
          <div style="font-size:20px;font-style:italic;color:#059669;margin:12px 0">${course.title}</div>
          <p style="color:#64748b">Instructor: ${course.instructor} &bull; ${course.duration}</p>
          <p style="color:#64748b;margin-top:24px">Completed on ${completionDate}</p>
          <p style="color:#9ca3af;font-size:13px;margin-top:16px">Your downloadable PDF certificate is attached to this email.</p>
        </div>`;
      const text = `Certificate of Completion\n\nThis certifies that ${recipientName} has successfully completed "${course.title}".\nInstructor: ${course.instructor} • ${course.duration}\nCompleted on ${completionDate}\n- EcoScope\n\nYour downloadable PDF certificate is attached.`;
      sendEmail({
        to_email: currentUser.email,
        subject: `Your Certificate: ${course.title}`,
        html,
        text,
        attachment_base64: attachmentBase64,
        attachment_filename: fileName,
      })
        .then(() => toast({ title: 'Certificate emailed', description: `A downloadable PDF was also sent to ${currentUser.email}.` }))
        .catch((err) => {
          console.error('Failed to email certificate:', err);
          const message = /configured/i.test(err?.message || '')
            ? "Certificate downloaded; server email isn't configured to also send it."
            : "Certificate downloaded, but emailing it failed - the server may be unreachable. Please try again shortly.";
          toast({ title: 'Email Not Sent', description: message, variant: 'destructive' });
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
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
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
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-slate-800 dark:text-slate-200">
            <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Education Center</span>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">Learn, grow, and become a sustainability champion</p>
            </div>
          </CardTitle>
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
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border rounded-md dark:bg-background dark:border-border dark:text-foreground"
                aria-label="Filter courses by level"
              >
                <option value="all" className="dark:bg-background dark:text-foreground">All Levels</option>
                <option value="Beginner" className="dark:bg-background dark:text-foreground">Beginner</option>
                <option value="Intermediate" className="dark:bg-background dark:text-foreground">Intermediate</option>
                <option value="Advanced" className="dark:bg-background dark:text-foreground">Advanced</option>
              </select>
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
            <div className="flex justify-end">
              <Button onClick={() => setShowCreateCourse(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>

            {showCreateCourse && (
              <Card className="dark:bg-background dark:border-border">
                <CardHeader><CardTitle className="dark:text-foreground">Add a New Course</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Course title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} className="dark:bg-background dark:text-foreground" />
                  <Textarea placeholder="Description" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} className="dark:bg-background dark:text-foreground" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <select value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} className="px-3 py-2 border rounded-md dark:bg-background dark:border-border dark:text-foreground">
                      {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <select value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })} className="px-3 py-2 border rounded-md dark:bg-background dark:border-border dark:text-foreground">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <Input placeholder="Duration (e.g. 2 hours)" value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })} className="dark:bg-background dark:text-foreground" />
                    <Input placeholder="Price (e.g. Free, $29)" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })} className="dark:bg-background dark:text-foreground" />
                  </div>
                  <Input placeholder="Instructor name" value={newCourse.instructor} onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })} className="dark:bg-background dark:text-foreground" />
                  <Input placeholder="Skills, comma-separated (e.g. Energy Efficiency, Green Living)" value={newCourse.skills} onChange={(e) => setNewCourse({ ...newCourse, skills: e.target.value })} className="dark:bg-background dark:text-foreground" />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm dark:text-foreground">Lessons</h4>
                    {newLessons.map((lesson, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2 dark:border-border">
                        <div className="flex gap-2">
                          <Input placeholder={`Lesson ${index + 1} title`} value={lesson.title} onChange={(e) => updateLessonRow(index, 'title', e.target.value)} className="dark:bg-background dark:text-foreground" />
                          <Input placeholder="Duration (e.g. 15 min)" value={lesson.duration} onChange={(e) => updateLessonRow(index, 'duration', e.target.value)} className="w-40 dark:bg-background dark:text-foreground" />
                          {newLessons.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removeLessonRow(index)}>✕</Button>
                          )}
                        </div>
                        <Textarea placeholder="Lesson content (markdown supported)" value={lesson.body} onChange={(e) => updateLessonRow(index, 'body', e.target.value)} className="dark:bg-background dark:text-foreground" />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addLessonRow}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Another Lesson
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateCourse} disabled={isCreatingCourse} className="bg-emerald-600 hover:bg-emerald-700">
                      {isCreatingCourse ? 'Publishing...' : 'Publish Course'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateCourse(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
            {filteredCourses.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-muted-foreground">
                No courses yet - be the first to add one!
              </div>
            )}

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
                    <h3 className="font-semibold mb-3">Course Content <span className="text-xs font-normal text-gray-500">(click a lesson to read it)</span></h3>
                    <div className="space-y-2">
                      {selectedCourse.content?.map((lesson, index) => {
                        const isDone = completedLessons[selectedCourse.id]?.has(index) || false;
                        return (
                        <div key={index} className="bg-gray-50 rounded-lg dark:bg-gray-800 overflow-hidden">
                          <div
                            className="flex items-center justify-between p-3 hover:bg-gray-100 transition-colors dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => setExpandedLesson(expandedLesson === index ? null : index)}
                          >
                            <div className="flex items-center space-x-3">
                              <CheckCircle className={`w-4 h-4 ${isDone ? 'text-green-500' : 'text-gray-300 dark:text-gray-500'}`} />
                              <div>
                                <span className={isDone ? 'text-gray-800 dark:text-gray-200' : 'text-gray-700 dark:text-gray-300'}>
                                  {lesson.title}
                                </span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{lesson.duration}</div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); handleWatchLesson(lesson, selectedCourse.id, index); }}
                              disabled={isDone}
                              className="dark:text-foreground"
                            >
                              <PlayCircle className="w-4 h-4 mr-1" />
                              {isDone ? 'Completed' : 'Mark Complete'}
                            </Button>
                          </div>
                          {expandedLesson === index && lesson.body && (
                            <div className="px-4 pb-4 pt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-200 dark:border-gray-700 [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mt-3 [&>h1]:mb-2 [&>h2]:text-base [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-2 [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-3 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mb-3 [&>ol]:space-y-1 [&_strong]:font-semibold [&_strong]:text-gray-900 dark:[&_strong]:text-gray-100">
                              <ReactMarkdown>{lesson.body}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                        );
                      })}
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
                    onClick={() => handleBookmarkCourse(selectedCourse.id)}
                    className={`dark:border-border ${bookmarkedCourses.has(selectedCourse.id) ? 'text-blue-500 dark:text-blue-400' : 'dark:text-foreground'}`}
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${bookmarkedCourses.has(selectedCourse.id) ? 'fill-current' : ''}`} />
                    {bookmarkedCourses.has(selectedCourse.id) ? 'Bookmarked' : 'Bookmark'}
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
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateArticle(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Article
            </Button>
          </div>

          {showCreateArticle && (
            <Card className="dark:bg-background dark:border-border">
              <CardHeader><CardTitle className="dark:text-foreground">Publish a New Article</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Article title" value={newArticle.title} onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <Input placeholder="Short excerpt (shown on the card)" value={newArticle.excerpt} onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={newArticle.category} onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })} className="px-3 py-2 border rounded-md dark:bg-background dark:border-border dark:text-foreground">
                    {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <Input placeholder="Read time (e.g. 5 min read)" value={newArticle.readTime} onChange={(e) => setNewArticle({ ...newArticle, readTime: e.target.value })} className="dark:bg-background dark:text-foreground" />
                </div>
                <Input placeholder="Tags, comma-separated (e.g. Plastic, Zero Waste)" value={newArticle.tags} onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <Textarea placeholder="Full article content (markdown supported)" value={newArticle.content} onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })} className="min-h-[160px] dark:bg-background dark:text-foreground" />
                <div className="flex gap-2">
                  <Button onClick={handleCreateArticle} disabled={isCreatingArticle} className="bg-emerald-600 hover:bg-emerald-700">
                    {isCreatingArticle ? 'Publishing...' : 'Publish Article'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateArticle(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmarkArticle(article.id)}
                          className={bookmarkedArticles.has(article.id) ? 'text-blue-500' : ''}
                          aria-label="Bookmark article"
                        >
                          <Bookmark className={`w-4 h-4 ${bookmarkedArticles.has(article.id) ? 'fill-current' : ''}`} />
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
                  incrementArticlesRead();
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
          {filteredArticles.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-muted-foreground">
              No articles yet - be the first to publish one!
            </div>
          )}

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
                
                <div className="mb-6 text-gray-700 dark:text-muted-foreground leading-relaxed [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mt-4 [&>h1]:mb-2 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:font-semibold [&>h3]:mt-3 [&>h3]:mb-1 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-3 [&_strong]:font-semibold [&_a]:text-emerald-600 [&_a]:underline">
                  <ReactMarkdown>{selectedArticle.content || selectedArticle.excerpt}</ReactMarkdown>
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
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateWebinar(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Webinar
            </Button>
          </div>

          {showCreateWebinar && (
            <Card className="dark:bg-background dark:border-border">
              <CardHeader><CardTitle className="dark:text-foreground">Add a New Webinar</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Webinar title" value={newWebinar.title} onChange={(e) => setNewWebinar({ ...newWebinar, title: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <Input placeholder="Speaker name" value={newWebinar.speaker} onChange={(e) => setNewWebinar({ ...newWebinar, speaker: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Input type="date" value={newWebinar.date} onChange={(e) => setNewWebinar({ ...newWebinar, date: e.target.value })} className="dark:bg-background dark:text-foreground" />
                  <Input placeholder="Time (e.g. 2:00 PM EST)" value={newWebinar.time} onChange={(e) => setNewWebinar({ ...newWebinar, time: e.target.value })} className="dark:bg-background dark:text-foreground" />
                  <Input placeholder="Duration (e.g. 1 hour)" value={newWebinar.duration} onChange={(e) => setNewWebinar({ ...newWebinar, duration: e.target.value })} className="dark:bg-background dark:text-foreground" />
                  <Input placeholder="Max attendees" type="number" value={newWebinar.maxAttendees} onChange={(e) => setNewWebinar({ ...newWebinar, maxAttendees: e.target.value })} className="dark:bg-background dark:text-foreground" />
                </div>
                <Textarea placeholder="Description" value={newWebinar.description} onChange={(e) => setNewWebinar({ ...newWebinar, description: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <Input placeholder="Topics, comma-separated" value={newWebinar.topics} onChange={(e) => setNewWebinar({ ...newWebinar, topics: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <Input placeholder="Price (e.g. Free, $19)" value={newWebinar.price} onChange={(e) => setNewWebinar({ ...newWebinar, price: e.target.value })} className="dark:bg-background dark:text-foreground" />
                <div className="flex gap-2">
                  <Button onClick={handleCreateWebinar} disabled={isCreatingWebinar} className="bg-emerald-600 hover:bg-emerald-700">
                    {isCreatingWebinar ? 'Adding...' : 'Add Webinar'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateWebinar(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

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
          {filteredWebinars.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-muted-foreground">
              No webinars yet - be the first to add one!
            </div>
          )}

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
                  <Button variant="outline" onClick={() => handleAddToCalendar(selectedWebinar)}>
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
                    <span className="font-semibold text-green-600">{userStats.articlesRead}/50</span>
                  </div>
                  <Progress value={(userStats.articlesRead / 50) * 100} className="h-3" />
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
                    <span className="font-medium">Overall Activity Streak</span>
                    <span className="font-semibold text-orange-600">{userStats.streakDays} {userStats.streakDays === 1 ? 'day' : 'days'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(userStats.streakDays, 14))].map((_, i) => (
                      <div key={i} className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                    ))}
                    {userStats.streakDays === 0 && (
                      <span className="text-sm text-gray-500 dark:text-muted-foreground">No active streak yet</span>
                    )}
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
