import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import {
  ChefHat,
  Search,
  Leaf,
  Clock,
  Users,
  Star,
  Droplets,
  TreePine,
  Apple,
  Filter,
  Heart,
  Globe,
  Calendar,
  Plus,
  X,
} from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';
import { useToast } from '@/hooks/use-toast';
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { useNotificationHelper } from '@/hooks/useNotificationHelper';

interface Recipe {
  id: number;
  name: string;
  image: string;
  sustainabilityScore: number;
  carbonFootprint: string;
  waterUsage: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  sustainability: {
    seasonal: boolean;
    local: boolean;
    organic: boolean;
    lowWaste: boolean;
  };
}

interface MealPlanEntry {
  day: string;
  recipeId: number; // Store recipe ID instead of full object
}

export const EcoRecipeFinder = () => {
  const { user } = useAuth(); // Get user from useAuth
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null); // Specify type
  const [activeTab, setActiveTab] = useState('recipes');
  const [firebaseFavoriteRecipes, setFirebaseFavoriteRecipes] = useState<Set<number>>(new Set()); // Specify type
  const [firebaseMealPlan, setFirebaseMealPlan] = useState<MealPlanEntry[]>([]); // Specify type
  const [selectedDayToAdd, setSelectedDayToAdd] = useState<string>('Monday'); // New state for day selection
  const { incrementRecipeViewed, addPoints } = useUserData();
  const { toast } = useToast();
  const { addGeneralNotification } = useNotificationHelper();

  // Fetch user recipe data
  useEffect(() => {
    if (!user) {
      setFirebaseFavoriteRecipes(new Set());
      setFirebaseMealPlan([]);
      return;
    }

    const userRecipeRef = doc(db, 'users', user.uid, 'recipeData', 'data');
    const unsubscribeRecipeData = onSnapshot(userRecipeRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirebaseFavoriteRecipes(new Set(data.favoriteRecipes || []));
        setFirebaseMealPlan(data.mealPlan || []);
        // Optionally set activeTab and searchQuery here if you want to persist them
      } else {
        // Initialize if no data exists
        setFirebaseFavoriteRecipes(new Set());
        setFirebaseMealPlan([]);
        // Optionally create the document with initial empty values
        setDoc(userRecipeRef, {
          favoriteRecipes: [],
          mealPlan: []
        }).catch(error => console.error("Error initializing user recipe data:", error));
      }
    }, (error) => {
      console.error('Error fetching user recipe data:', error);
    });

    return () => unsubscribeRecipeData();
  }, [user]);

  const recipes: Recipe[] = [ // Specify type
    {
      id: 1,
      name: 'Rainbow Quinoa Buddha Bowl',
      image: 'photo-1512621776951-a57141f2eefd',
      sustainabilityScore: 95,
      carbonFootprint: '0.8 kg CO₂',
      waterUsage: '250L',
      cookTime: '25 min',
      servings: 4,
      difficulty: 'Easy',
      tags: ['Vegan', 'Gluten-Free', 'Local'],
      ingredients: [
        '1 cup quinoa (locally sourced)',
        '2 cups seasonal vegetables',
        '1/2 cup chickpeas',
        'Tahini dressing',
        'Mixed greens',
      ],
      instructions: [
        'Cook quinoa according to package directions',
        'Roast seasonal vegetables with olive oil',
        'Prepare tahini dressing',
        'Assemble bowl with all ingredients',
      ],
      nutrition: {
        calories: 420,
        protein: '18g',
        carbs: '52g',
        fat: '16g',
      },
      sustainability: {
        seasonal: true,
        local: true,
        organic: true,
        lowWaste: true,
      },
    },
    {
      id: 2,
      name: 'Plant-Based Lentil Shepherd\'s Pie',
      image: 'photo-1574484284002-952d92456975',
      sustainabilityScore: 92,
      carbonFootprint: '1.2 kg CO₂',
      waterUsage: '180L',
      cookTime: '45 min',
      servings: 6,
      difficulty: 'Medium',
      tags: ['Vegan', 'Protein-Rich', 'Comfort Food'],
      ingredients: [
        '2 cups green lentils',
        '3 lbs local potatoes',
        'Seasonal root vegetables',
        'Vegetable broth',
        'Fresh herbs',
      ],
      instructions: [
        'Cook lentils with vegetables and herbs',
        'Prepare mashed potato topping',
        'Layer in baking dish',
        'Bake until golden brown',
      ],
      nutrition: {
        calories: 385,
        protein: '16g',
        carbs: '58g',
        fat: '12g',
      },
      sustainability: {
        seasonal: true,
        local: true,
        organic: false,
        lowWaste: true,
      },
    },
    {
      id: 3,
      name: 'Zero-Waste Vegetable Broth',
      image: 'photo-1547592180-85f173990554',
      sustainabilityScore: 98,
      carbonFootprint: '0.2 kg CO₂',
      waterUsage: '50L',
      cookTime: '60 min',
      servings: 8,
      difficulty: 'Easy',
      tags: ['Zero-Waste', 'Vegan', 'Base Recipe'],
      ingredients: [
        'Vegetable scraps and peels',
        'Herb stems',
        'Onion skins',
        'Mushroom stems',
        'Bay leaves',
      ],
      instructions: [
        'Collect vegetable scraps in freezer',
        'Simmer scraps in water for 1 hour',
        'Strain and store broth',
        'Compost remaining solids',
      ],
      nutrition: {
        calories: 15,
        protein: '1g',
        carbs: '3g',
        fat: '0g',
      },
      sustainability: {
        seasonal: true,
        local: true,
        organic: true,
        lowWaste: true,
      },
    },
  ];

  const sustainabilityTips = [
    {
      title: 'Choose Seasonal Produce',
      description: 'Seasonal fruits and vegetables have a 60% lower carbon footprint',
      icon: Apple,
      impact: '60% less CO₂',
    },
    {
      title: 'Reduce Food Waste',
      description: 'Use vegetable scraps for broths and composting',
      icon: TreePine,
      impact: '40% waste reduction',
    },
    {
      title: 'Plant-Based Proteins',
      description: 'Legumes and grains use 75% less water than meat',
      icon: Droplets,
      impact: '75% water savings',
    },
    {
      title: 'Local Sourcing',
      description: 'Local ingredients reduce transportation emissions',
      icon: Globe,
      impact: '50% transport reduction',
    },
  ];

  const handleViewRecipe = (recipe: Recipe) => { // Specify recipe type
    setSelectedRecipe(recipe);
    try {
      incrementRecipeViewed(); // This will update userStats in Firebase via useUserData
      console.log('incrementRecipeViewed called successfully');
    } catch (error) {
      console.error('Error calling incrementRecipeViewed:', error);
    }
    try {
      addPoints(5); // This will update userStats in Firebase via useUserData
      console.log('addPoints called successfully');
    } catch (error) {
      console.error('Error calling addPoints:', error);
    }
    toast({
      title: 'Recipe Viewed!',
      description: 'You earned 5 points for viewing a recipe!',
    });
    addGeneralNotification(
      'Recipe Viewed',
      `You viewed the recipe: ${recipe.name}`,
      'suggestion'
    );
  };

  const handleFavoriteRecipe = async (recipeId: number) => { // Make async, specify type
    if (!user) return;

    const userRecipeRef = doc(db, 'users', user.uid, 'recipeData', 'data');
    const newFavorites = new Set(firebaseFavoriteRecipes);

    if (newFavorites.has(recipeId)) {
      // Unfavorite
      newFavorites.delete(recipeId);
      await updateDoc(userRecipeRef, {
        favoriteRecipes: arrayRemove(recipeId) // Remove from Firebase array
      });
      toast({
        title: 'Recipe Removed',
        description: 'Recipe removed from favorites.',
      });
      addGeneralNotification(
        'Recipe Removed',
        `You removed the recipe from favorites.`,
        'suggestion'
      );
    } else {
      // Favorite
      newFavorites.add(recipeId);
       await updateDoc(userRecipeRef, {
        favoriteRecipes: arrayUnion(recipeId) // Add to Firebase array
      });
      addPoints(5); // This will update userStats in Firebase via useUserData
      toast({
        title: 'Recipe Favorited!',
        description: 'You earned 5 points for favoriting a recipe!',
      });
      addGeneralNotification(
        'Recipe Favorited',
        `You favorited a recipe.`,
        'suggestion'
      );
    }
     // State will be updated by the onSnapshot listener
  };

  const handleAddToMealPlan = async (recipe: Recipe, day: string = 'Monday') => { // Make async, specify types
    if (!user) return;

    const userRecipeRef = doc(db, 'users', user.uid, 'recipeData', 'data');
    const newMealPlan = [...firebaseMealPlan];
    const existingIndex = newMealPlan.findIndex(meal => meal.day === day);

    const mealPlanEntry: MealPlanEntry = { // Create meal plan entry object
      day,
      recipeId: recipe.id,
    };

    if (existingIndex >= 0) {
      newMealPlan[existingIndex] = mealPlanEntry;
    } else {
      newMealPlan.push(mealPlanEntry);
    }

    await updateDoc(userRecipeRef, {
      mealPlan: newMealPlan // Update entire mealPlan array in Firebase
    });

    addPoints(10); // This will update userStats in Firebase via useUserData
    toast({
      title: 'Added to Meal Plan!',
      description: 'You earned 10 points for meal planning!',
    });
    addGeneralNotification(
      'Added to Meal Plan',
      `You added a recipe to your meal plan for ${day}.`,
      'suggestion'
    );
    // State will be updated by the onSnapshot listener
  };

  const generateMealPlan = async () => { // Make async
    if (!user) return;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const newMealPlan: MealPlanEntry[] = days.map(day => ({ // Specify type
      day,
      recipeId: recipes[Math.floor(Math.random() * recipes.length)].id // Store recipe ID
    }));

    const userRecipeRef = doc(db, 'users', user.uid, 'recipeData', 'data');
    await updateDoc(userRecipeRef, {
      mealPlan: newMealPlan // Update entire mealPlan array in Firebase
      });

    addPoints(25); // This will update userStats in Firebase via useUserData
    toast({
      title: 'Meal Plan Generated!',
      description: 'You earned 25 points for generating a meal plan!',
    });
    addGeneralNotification(
      'Meal Plan Generated',
      'You generated a new meal plan for the week.',
      'suggestion'
    );
     // State will be updated by the onSnapshot listener
  };

   const getRecipeForMealPlanEntry = (entry: MealPlanEntry) => { // Helper to get recipe from meal plan entry
       return recipes.find(r => r.id === entry.recipeId);
   }

  const getScoreColor = (score: number) => { // Specify type
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-lime-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <ChefHat className="w-6 h-6" />
            <span>Eco-Friendly Recipe Finder</span>
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
              <Leaf className="w-4 h-4 mr-1" />
              Sustainable Cooking
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recipes">Recipe Library</TabsTrigger>
              <TabsTrigger value="tips">Sustainability Tips</TabsTrigger>
              <TabsTrigger value="planner">Meal Planner</TabsTrigger>
            </TabsList>

            <TabsContent value="recipes" className="space-y-6 mt-6">
              {/* Search and Filter */}
              <div className="flex space-x-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search recipes by ingredients, diet, or cuisine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-green-200 focus:border-green-400"
                  />
                </div>
                <Button variant="outline" className="border-green-200">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Recipe Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white/80 rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200 relative">
                      <img
                        src={`https://images.unsplash.com/${recipe.image}?w=400&h=300&fit=crop`}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className={`text-white ${getScoreColor(recipe.sustainabilityScore)}`}>
                          {recipe.sustainabilityScore}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-white/80 hover:bg-white"
                          onClick={() => handleFavoriteRecipe(recipe.id)}
                        >
                          <Heart className={`w-4 h-4 ${firebaseFavoriteRecipes.has(recipe.id) ? 'fill-current text-red-500' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">{recipe.name}</h3>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.cookTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{recipe.servings}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span>{recipe.difficulty}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <TreePine className="w-3 h-3 text-green-600" />
                          <span>{recipe.carbonFootprint}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Droplets className="w-3 h-3 text-blue-600" />
                          <span>{recipe.waterUsage}</span>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleViewRecipe(recipe)}
                          >
                            View Recipe
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                              <span>{recipe.name}</span>
                              <div className="flex items-center space-x-2">
                                <Badge className={`text-white ${getScoreColor(recipe.sustainabilityScore)}`}>
                                  Sustainability: {recipe.sustainabilityScore}
                                </Badge>
                                <Badge variant="outline">{recipe.difficulty}</Badge>
                              </div>
                            </DialogTitle>
                            <DialogDescription>
                              Detailed recipe information and sustainability analysis
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <img
                                src={`https://images.unsplash.com/${recipe.image}?w=600&h=400&fit=crop`}
                                alt={recipe.name}
                                className="w-full h-64 object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop';
                                }}
                              />

                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4 text-green-600" />
                                    <span>{recipe.cookTime}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    <span>{recipe.servings} servings</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <TreePine className="w-4 h-4 text-green-600" />
                                    <span>{recipe.carbonFootprint}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Droplets className="w-4 h-4 text-blue-600" />
                                    <span>{recipe.waterUsage}</span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  {recipe.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>

                                <div className="grid grid-cols-4 gap-2 p-3 bg-green-50 rounded-lg text-center text-xs">
                                  <div>
                                    <div className="font-semibold text-green-700">{recipe.nutrition.calories}</div>
                                    <div className="text-green-600">Calories</div>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-green-700">{recipe.nutrition.protein}</div>
                                    <div className="text-green-600">Protein</div>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-green-700">{recipe.nutrition.carbs}</div>
                                    <div className="text-green-600">Carbs</div>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-green-700">{recipe.nutrition.fat}</div>
                                    <div className="text-green-600">Fat</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h3 className="font-semibold mb-2">Ingredients:</h3>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {recipe.ingredients.map((ingredient, index) => (
                                    <li key={index}>• {ingredient}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-2">Instructions:</h3>
                                <ol className="text-sm text-gray-700 space-y-1">
                                  {recipe.instructions.map((step, index) => (
                                    <li key={index}>
                                      {index + 1}. {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                              <Button
                                variant="outline"
                                onClick={() => handleFavoriteRecipe(recipe.id)}
                                className={firebaseFavoriteRecipes.has(recipe.id) ? 'bg-red-50 text-red-600' : ''}
                              >
                                <Heart
                                  className={`w-4 h-4 mr-2 ${
                                    firebaseFavoriteRecipes.has(recipe.id) ? 'fill-current' : ''
                                  }`}
                                />
                                {firebaseFavoriteRecipes.has(recipe.id) ? 'Favorited' : 'Add to Favorites'}
                              </Button>
                              <div className="flex items-center space-x-2 mt-2">
                                <select
                                  value={selectedDayToAdd}
                                  onChange={(e) => setSelectedDayToAdd(e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                  <option value="Monday">Monday</option>
                                  <option value="Tuesday">Tuesday</option>
                                  <option value="Wednesday">Wednesday</option>
                                  <option value="Thursday">Thursday</option>
                                  <option value="Friday">Friday</option>
                                  <option value="Saturday">Saturday</option>
                                  <option value="Sunday">Sunday</option>
                                </select>
                                <Button onClick={() => handleAddToMealPlan(recipe, selectedDayToAdd)}>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add to Meal Plan
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-800">Sustainable Cooking Tips</h3>
              {sustainabilityTips.map((tip, index) => (
                <div key={index} className="bg-white/80 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <tip.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-2">{tip.title}</h4>
                      <p className="text-gray-600 mb-2">{tip.description}</p>
                      <Badge className="bg-green-500 text-white">Impact: {tip.impact}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="planner" className="mt-6">
              <div className="space-y-6">
                <div className="bg-white/80 rounded-xl p-6 border border-gray-100 text-center">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Weekly Meal Planner</h3>
                  <p className="text-gray-600 mb-4">Plan sustainable meals for the week based on seasonal ingredients and your dietary preferences.</p>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={generateMealPlan}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate Meal Plan
                  </Button>
                </div>

                {firebaseMealPlan.length > 0 && ( // Use firebaseMealPlan state
                  <div className="bg-white/80 rounded-xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Weekly Meal Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {firebaseMealPlan.map((meal, index) => {
                          const recipe = getRecipeForMealPlanEntry(meal); // Get recipe using helper
                          if (!recipe) return null; // Handle case where recipe is not found

                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-800">{meal.day}</h4>
                            <Badge className={`text-white ${getScoreColor(recipe.sustainabilityScore)}`}>
                              {recipe.sustainabilityScore}
                            </Badge>
                          </div>
                          <img
                            src={`https://images.unsplash.com/${recipe.image}?w=300&h=200&fit=crop`}
                            alt={recipe.name}
                            className="w-full h-32 object-cover rounded mb-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop';
                            }}
                          />
                          <h5 className="font-medium text-sm">{recipe.name}</h5>
                          <p className="text-xs text-gray-600">{recipe.cookTime} • {recipe.servings} servings</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => handleViewRecipe(recipe)}
                          >
                            View Recipe
                          </Button>
                        </div>
                       );
                       })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EcoRecipeFinder;