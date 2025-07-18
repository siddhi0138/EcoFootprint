import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import Navbar from '../components/Navbar';
import {
  ArrowLeft,
  Plus,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit3,
  Zap,
  Leaf,
  Droplets,
  Recycle,
  Trophy,
  Clock,
  Filter,
  Search,
  BarChart3,
  Lightbulb,
  Settings,
  Star,
  Award,
  Activity,
  Flame,
  Users,
  Globe,
  Loader2
} from 'lucide-react';

interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: string;
  priority: string;
  deadline: string;
  createdAt: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  milestones: number[];
  completedMilestones: number[];
  notes: string;
  tags: string[];
  estimatedSavings: string;
  completed: boolean;
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('deadline');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();

  const [newGoal, setNewGoal] = useState<{
    title: string;
    description: string;
    target: string;
    unit: string;
    category: string;
    priority: string;
    deadline: string;
    estimatedSavings: string;
    tags: string;
  }>({
    title: '',
    description: '',
    target: '',
    unit: '%',
    category: 'Energy',
    priority: 'Medium',
    deadline: '',
    estimatedSavings: '',
    tags: ''
  });

  const [editingGoal, setEditingGoal] = useState<Partial<Omit<Goal, 'tags'>> & { tags?: string | string[] } | null>(null);

  const [achievements, setAchievements] = useState([
    { id: 1, title: "First Goal", description: "Created your first optimization goal", unlocked: false, icon: Target },
    { id: 2, title: "Goal Achiever", description: "Completed your first goal", unlocked: false, icon: Trophy },
    { id: 3, title: "Milestone Master", description: "Reached 5 milestones", unlocked: false, icon: Star },
    { id: 4, title: "Eco Warrior", description: "Completed 3 environmental goals", unlocked: false, icon: Globe },
    { id: 5, title: "Streak Master", description: "Updated progress for 7 days straight", unlocked: false, icon: Flame }
  ]);

  const categories = [
    { name: 'Energy', icon: Zap, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900', borderColor: 'border-yellow-200 dark:border-yellow-700' },
    { name: 'Carbon', icon: Leaf, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900', borderColor: 'border-green-200 dark:border-green-700' },
    { name: 'Water', icon: Droplets, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900', borderColor: 'border-blue-200 dark:border-blue-700' },
    { name: 'Waste', icon: Recycle, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900', borderColor: 'border-purple-200 dark:border-purple-700' }
  ];

  const priorities = ['Low', 'Medium', 'High'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchGoals(currentUser.uid);
      } else {
        setGoals([]); // Clear goals if user logs out
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNavigation = (tab: string) => {
    console.log(`Navigating to: ${tab}`);
  };

  const fetchGoals = async (userId: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users', userId, 'goals'), orderBy('deadline', 'asc'));
      const querySnapshot = await getDocs(q);
      const fetchedGoals: Goal[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const categoryData = categories.find(cat => cat.name === data.category) || categories[0];
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description || '',
          target: data.target,
          current: data.current || 0,
          unit: data.unit || '%',
          category: data.category,
          priority: data.priority || 'Medium',
          deadline: data.deadline,
          createdAt: data.createdAt || new Date().toISOString().split('T')[0],
          icon: categoryData.icon,
          color: categoryData.color,
          bgColor: categoryData.bgColor,
          borderColor: categoryData.borderColor,
          milestones: data.milestones || [],
          completedMilestones: data.completedMilestones || [],
          notes: data.notes || '',
          tags: data.tags || [],
          estimatedSavings: data.estimatedSavings || '',
          completed: data.completed || false,
        };
      });
      setGoals(fetchedGoals);
      checkAchievements(fetchedGoals);
      toast({ title: "Goals Loaded", description: `Fetched ${fetchedGoals.length} goals.`, duration: 3000 });
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      toast({ title: "Error", description: `Failed to load goals: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = (currentGoals: Goal[]) => {
    const completedGoalsCount = currentGoals.filter(goal => goal.completed).length;
    const totalMilestonesCompleted = currentGoals.reduce((sum, goal) => sum + goal.completedMilestones.length, 0);
    const environmentalCategories = ['Carbon', 'Water', 'Waste']; // Assuming these are environmental
    const environmentalGoalsCompleted = currentGoals.filter(goal => goal.completed && environmentalCategories.includes(goal.category)).length;

    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === 1 && currentGoals.length > 0) return { ...achievement, unlocked: true };
      if (achievement.id === 2 && completedGoalsCount > 0) return { ...achievement, unlocked: true };
      if (achievement.id === 3 && totalMilestonesCompleted >= 5) return { ...achievement, unlocked: true };
      if (achievement.id === 4 && environmentalGoalsCompleted >= 3) return { ...achievement, unlocked: true };
      // Streak Master requires more complex logic tracking daily updates
      return achievement;
    }));
  };


  const handleAddGoal = async () => {
    if (!user || !newGoal.title || !newGoal.target || !newGoal.deadline) {
      toast({ title: "Missing Information", description: "Please fill in required fields (Title, Target, Deadline).", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const categoryData = categories.find(cat => cat.name === newGoal.category) || categories[0];
      const targetNum = parseFloat(newGoal.target);
      const milestones = Array.from({ length: Math.floor(targetNum / 5) }, (_, i) => (i + 1) * 5)
        .filter(m => m <= targetNum);

      const goalData = {
        userId: user.uid,
        title: newGoal.title,
        description: newGoal.description,
        target: targetNum,
        current: 0,
        unit: newGoal.unit,
        category: newGoal.category,
        priority: newGoal.priority,
        deadline: newGoal.deadline,
        createdAt: new Date().toISOString().split('T')[0],
        color: categoryData.color,
        bgColor: categoryData.bgColor,
        borderColor: categoryData.borderColor,
        milestones: milestones,
        completedMilestones: [],
        notes: "",
        tags: newGoal.tags ? newGoal.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        estimatedSavings: newGoal.estimatedSavings,
        completed: false,
      };

      const docRef = await addDoc(collection(db, 'users', user.uid, 'goals'), goalData);
      const addedGoal = { ...goalData, id: docRef.id } as Goal;
      setGoals([...goals, addedGoal]);
      checkAchievements([...goals, addedGoal]);
      setNewGoal({ title: '', description: '', target: '', unit: '%', category: 'Energy', priority: 'Medium', deadline: '', estimatedSavings: '', tags: '' });
      setShowAddForm(false);
      toast({ title: "Goal Added", description: "Your new goal has been created.", duration: 3000 });
    } catch (error: any) {
      console.error('Error adding goal:', error);
      toast({ title: "Error", description: `Failed to add goal: ${error.message}`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!user) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
      setGoals(goals.filter(goal => goal.id !== id));
      checkAchievements(goals.filter(goal => goal.id !== id));
      toast({ title: "Goal Deleted", description: "The goal has been removed.", duration: 3000 });
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      toast({ title: "Error", description: `Failed to delete goal: ${error.message}`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditingGoal(goal);
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
    setEditingGoal(null);
  };

  const handleUpdateGoal = async () => {
    if (!user || !editingGoalId || !editingGoal || !editingGoal.title || !editingGoal.target || !editingGoal.deadline) {
      toast({ title: "Missing Information", description: "Please fill in required fields (Title, Target, Deadline).", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const goalRef = doc(db, 'users', user.uid, 'goals', editingGoalId);
      const targetNum = parseFloat(editingGoal.target as any);
      const currentNum = parseFloat(editingGoal.current as any);
      const completed = currentNum >= targetNum;

      const categoryData = categories.find(cat => cat.name === editingGoal.category) || categories[0];
      const milestones = Array.from({ length: Math.floor(targetNum / 5) }, (_, i) => (i + 1) * 5)
        .filter(m => m <= targetNum);
      const completedMilestones = milestones.filter(m => m <= currentNum);

      const updatedData: Partial<Goal> = {
        title: editingGoal.title,
        description: editingGoal.description,
        target: targetNum,
        current: currentNum,
        unit: editingGoal.unit,
        category: editingGoal.category,
        priority: editingGoal.priority,
        deadline: editingGoal.deadline,
        color: categoryData.color,
        bgColor: categoryData.bgColor,
        borderColor: categoryData.borderColor,
        milestones: milestones,
        completedMilestones: completedMilestones,
        notes: editingGoal.notes,
        tags: Array.isArray(editingGoal.tags) ? editingGoal.tags : (typeof editingGoal.tags === 'string' && editingGoal.tags.length > 0 ? editingGoal.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
        estimatedSavings: editingGoal.estimatedSavings,
        completed: completed,
      };

      await updateDoc(goalRef, updatedData);

      setGoals(goals.map(goal =>
        goal.id === editingGoalId ? {
          ...goal, ...updatedData, tags: Array.isArray(updatedData.tags) ? updatedData.tags : []
        } as Goal : goal
      ));

      checkAchievements(goals.map(goal =>
        goal.id === editingGoalId
          ? { ...goal, ...updatedData as Goal }
          : goal
      ));
      cancelEditing();
      toast({ title: "Goal Updated", description: "Your goal has been updated.", duration: 3000 });
    } catch (error: any) {
      console.error('Error updating goal:', error);
      toast({ title: "Error", description: `Failed to update goal: ${error.message}`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    if (!user) return;
    setSaving(true);
    try {
      const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
      const goalToUpdate = goals.find(goal => goal.id === goalId);

      if (goalToUpdate) {
        const updatedProgress = Math.min(newProgress, goalToUpdate.target);
        const completed = updatedProgress >= goalToUpdate.target;
        const newCompletedMilestones = goalToUpdate.milestones.filter(m => m <= updatedProgress);

        const updatedData = {
          current: updatedProgress,
          completed: completed,
          completedMilestones: newCompletedMilestones,
        };

        await updateDoc(goalRef, updatedData);

        setGoals(goals.map(goal =>
          goal.id === goalId ? { ...goal, ...updatedData } : goal
        ));
        checkAchievements(goals.map(goal =>
          goal.id === goalId ? { ...goal, ...updatedData } : goal
        ));
        toast({ title: "Progress Updated", description: "Goal progress has been updated.", duration: 3000 });
      }
    } catch (error: any) {
      console.error('Error updating goal progress:', error);
      toast({ title: "Error", description: `Failed to update progress: ${error.message}`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filteredAndSortedGoals = goals
    .filter(goal => {
      const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'All' || goal.category === filterCategory;
      const matchesPriority = filterPriority === 'All' || goal.priority === filterPriority;
      return matchesSearch && matchesCategory && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'progress':
          return (b.current / b.target) - (a.current / a.target);
        case 'priority':
          const priorityOrder: { [key: string]: number } = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500 dark:bg-green-400';
    if (progress >= 75) return 'bg-blue-500 dark:bg-blue-400';
    if (progress >= 50) return 'bg-yellow-500 dark:bg-yellow-400';
    return 'bg-red-500 dark:bg-red-400';
  };

  const getStatusBadge = (current: number, target: number, deadline: string) => {
    const progress = (current / target) * 100;
    const isOverdue = new Date(deadline) < new Date() && progress < 100;

    if (progress >= 100) {
      return <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-400 dark:border-green-700 animate-pulse"><Trophy className="w-3 h-3 mr-1" />Completed</Badge>;
    }
    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-400 dark:border-red-700"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
    }
    if (progress >= 75) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-400 dark:border-blue-700"><TrendingUp className="w-3 h-3 mr-1" />On Track</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-400 dark:border-yellow-700"><Activity className="w-3 h-3 mr-1" />In Progress</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: { [key: string]: string } = {
      'High': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-400 dark:border-red-700',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-400 dark:border-yellow-700',
      'Low': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700'
    };
    return <Badge className={colors[priority]}>{priority} Priority</Badge>;
  };

  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.completed).length;
  const averageProgress = totalGoals > 0 ? goals.reduce((sum, goal) => sum + (goal.current / goal.target) * 100, 0) / totalGoals : 0;
  const totalMilestones = goals.reduce((sum, goal) => sum + goal.completedMilestones.length, 0);
  const overdueGoals = goals.filter(goal => new Date(goal.deadline) < new Date() && !goal.completed).length;


  return (
    <>
      <Navbar onNavigate={handleNavigation} activeTab="goals" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-950 pt-32 p-6 z-10">
        <Card className="mb-6 shadow-xl border-indigo-200 bg-white/90 backdrop-blur-md dark:border-indigo-700 dark:bg-gray-800/90">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 dark:text-gray-300" />
                <span className="dark:text-gray-200">Back</span>
              </Button>
              <div>
                <CardTitle className="text-indigo-700 dark:text-indigo-300 text-3xl font-bold flex items-center gap-3">
                  <Target className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                  Optimization Goals
                </CardTitle>
                <p className="text-indigo-600 dark:text-indigo-400 mt-1">Track, optimize, and achieve your sustainability targets</p>
              </div>
            </div>
            {user && (
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-2 shadow-lg"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4" />}
                  Add Goal
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>

        {!user ? (
          <Card className="shadow-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="text-center py-16">
              <div className="space-y-4">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                  <Users className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Login Required</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Please log in to view and manage your optimization goals.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6 shadow-lg border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search goals, tags, or descriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="min-w-[250px]"
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(cat => <option key={cat.name} value={cat.name} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">{cat.name}</option>)}
                  </select>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <option value="All">All Priorities</option>
                    {priorities.map(priority => <option key={priority} value={priority} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">{priority}</option>)}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <option value="deadline">Sort by Deadline</option>
                    <option value="progress">Sort by Progress</option>
                    <option value="priority">Sort by Priority</option>
                    <option value="created">Sort by Creation Date</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {showAddForm && (
              <Card className="mb-6 shadow-lg border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <Plus className="w-6 h-6" />
                    Add New Optimization Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title" className="dark:text-gray-200">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Reduce electricity consumption"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="dark:text-gray-200">Category</Label>
                    <select
                      id="category"
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                      className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      {categories.map(cat => <option key={cat.name} value={cat.name} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-gray-700 dark:text-gray-200">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Details about your goal..."
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="target" className="dark:text-gray-200">Target Value</Label>
                    <Input
                      id="target"
                      type="number"
                      placeholder="e.g., 15"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit" className="dark:text-gray-200">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="e.g., kWh, %, gallons"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority" className="dark:text-gray-200">Priority</Label>
                    <select
                      id="priority"
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                      className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      {priorities.map(priority => <option key={priority} value={priority} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">{priority}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="deadline" className="dark:text-gray-200">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="estimatedSavings" className="dark:text-gray-200">Estimated Savings (Optional)</Label>
                    <Input
                      id="estimatedSavings"
                      placeholder="e.g., $20/month or 100 lbs CO2/year"
                      value={newGoal.estimatedSavings}
                      onChange={(e) => setNewGoal({ ...newGoal, estimatedSavings: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="tags" className="dark:text-gray-200">Tags (Optional, comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., home, appliance, travel"
                      value={newGoal.tags}
                      onChange={(e) => setNewGoal({ ...newGoal, tags: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddGoal}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      Create Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedGoals.length > 0 ? (
                filteredAndSortedGoals.map(goal => (
                  <Card
                    key={goal.id}
                    className={`shadow-lg hover:shadow-xl transition-shadow border-l-4 ${goal.borderColor} ${goal.bgColor} dark:bg-gray-800 dark:border-gray-700`}
                  >
                    <CardContent className="p-6">
                      {editingGoalId === goal.id && editingGoal ? (
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <Edit3 className="w-5 h-5" /> Edit Goal
                          </h3>
                          <div className="dark:text-gray-200">
                            <Label htmlFor={`edit-title-${goal.id}`}>Title</Label>
                            <Input
                              id={`edit-title-${goal.id}`}
                              value={editingGoal.title || ''}
                              onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-description-${goal.id}`}>Description (Optional)</Label>
                            <Textarea
                              id={`edit-description-${goal.id}`}
                              value={editingGoal.description || ''}
                              onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`edit-target-${goal.id}`}>Target</Label>
                              <Input
                                id={`edit-target-${goal.id}`}
                                type="number"
                                value={editingGoal.target || ''}
                                onChange={(e) => setEditingGoal({ ...editingGoal, target: parseFloat(e.target.value) })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-current-${goal.id}`}>Current</Label>
                              <Input
                                id={`edit-current-${goal.id}`}
                                type="number"
                                value={editingGoal.current || ''}
                                onChange={(e) => setEditingGoal({ ...editingGoal, current: parseFloat(e.target.value) })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`edit-unit-${goal.id}`}>Unit</Label>
                            <Input
                              id={`edit-unit-${goal.id}`}
                              value={editingGoal.unit || ''}
                              onChange={(e) => setEditingGoal({ ...editingGoal, unit: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-category-${goal.id}`}>Category</Label>
                            <select
                              id={`edit-category-${goal.id}`}
                              value={editingGoal.category || 'Energy'}
                              onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value })}
                              className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                            >
                              {categories.map(cat => <option key={cat.name} value={cat.name} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">{cat.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`edit-priority-${goal.id}`}>Priority</Label>
                            <select
                              id={`edit-priority-${goal.id}`}
                              value={editingGoal.priority || 'Medium'}
                              onChange={(e) => setEditingGoal({ ...editingGoal, priority: e.target.value })}
                              className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                            >
                              {priorities.map(priority => <option key={priority} value={priority} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">{priority}</option>)}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`edit-deadline-${goal.id}`}>Deadline</Label>
                            <Input
                              id={`edit-deadline-${goal.id}`}
                              type="date"
                              value={editingGoal.deadline || ''}
                              onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-estimatedSavings-${goal.id}`}>Estimated Savings (Optional)</Label>
                            <Input
                              id={`edit-estimatedSavings-${goal.id}`}
                              placeholder="e.g., $20/month"
                              value={editingGoal.estimatedSavings || ''}
                              onChange={(e) => setEditingGoal({ ...editingGoal, estimatedSavings: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-tags-${goal.id}`}>Tags (Optional, comma-separated)</Label>
                            <Input
                              id={`edit-tags-${goal.id}`}
                              placeholder="e.g., home, appliance"
                              value={typeof editingGoal.tags === 'string' ? editingGoal.tags : Array.isArray(editingGoal.tags) ? editingGoal.tags.join(', ') : ''}
                              onChange={(e) => setEditingGoal({ ...editingGoal, tags: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`edit-notes-${goal.id}`}>Notes (Optional)</Label>
                            <Textarea
                              id={`edit-notes-${goal.id}`}
                              placeholder="Any notes for this goal..."
                              value={editingGoal.notes || ''}
                              onChange={(e) => setEditingGoal({ ...editingGoal, notes: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex justify-end gap-3 md:col-span-2">
                            <Button variant="outline" onClick={cancelEditing} disabled={saving}>Cancel</Button>
                            <Button onClick={handleUpdateGoal} disabled={saving} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                               {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {React.createElement(goal.icon, { className: `w-8 h-8 ${goal.color} dark:text-gray-300` })}
                              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{goal.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(goal.current, goal.target, goal.deadline)}
                              {getPriorityBadge(goal.priority)}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>

                          <div className="space-y-1">
                            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                              <span>Progress</span>
                              <span>{goal.current} / {goal.target} {goal.unit} ({(goal.current / goal.target * 100).toFixed(1)}%)</span>
                            </div>
                            <Progress value={(goal.current / goal.target) * 100} className={`h-2 ${getProgressColor((goal.current / goal.target) * 100)} dark:bg-gray-700`} />
                          </div>

                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            Deadline: {goal.deadline}
                            {new Date(goal.deadline) < new Date() && !goal.completed && (
                              <Badge variant="destructive" className="ml-2 dark:bg-red-900 dark:text-red-400 dark:border-red-700">Overdue</Badge>
                            )}
                          </div>

                          {goal.estimatedSavings && (
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              Est. Savings: {goal.estimatedSavings}
                            </div>
                          )}

                          {goal.tags && goal.tags.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              Tags: {/* This text color is handled by the parent div */}
                              {goal.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600">{tag}</Badge>
                              ))}
                            </div>
                          )}

                          {goal.notes && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1" />
                              Notes: <p className="text-gray-700 dark:text-gray-300">{goal.notes}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            Created: {goal.createdAt}
                          </div>

                          <div className="flex flex-wrap justify-between items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`progress-input-${goal.id}`} className="sr-only dark:text-gray-200">Update Progress</Label>
                              <Input
                                id={`progress-input-${goal.id}`}
                                type="number"
                                value={goal.current}
                                onChange={(e) => {
                                  const newProgress = parseFloat(e.target.value);
                                  if (!isNaN(newProgress)) {
                                    setGoals(goals.map(g => g.id === goal.id ? { ...g, current: newProgress } : g));
                                  }
                                }}
                                onBlur={(e) => {
                                  const newProgress = parseFloat(e.target.value);
                                  if (!isNaN(newProgress)) {
                                    handleUpdateProgress(goal.id, newProgress);
                                  } else {
                                    setGoals(goals.map(g => g.id === goal.id ? { ...g, current: goal.current } : g));
                                  }
                                }}
                                className="w-24"
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{goal.unit}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateProgress(goal.id, goal.current + 1)}
                                disabled={goal.current >= goal.target || saving}
                                className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900"
                              >
                                <Plus className="w-3 h-3" />
                                Add 1
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditing(goal)}
                                disabled={saving}
                                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900"
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteGoal(goal.id)}
                                disabled={saving}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="md:col-span-3 text-center py-16">
                  <div className="space-y-4 text-gray-600 dark:text-gray-400">
                    <Target className="mx-auto w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                    <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No Goals Yet!</h3>
                    <p className="max-w-md mx-auto">
                      Start tracking your sustainability journey by adding your first optimization goal.
                    </p>
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-2 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Goal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Goals;
