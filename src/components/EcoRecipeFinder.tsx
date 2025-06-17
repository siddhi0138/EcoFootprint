
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Globe
} from 'lucide-react';

const EcoRecipeFinder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activeTab, setActiveTab] = useState('recipes');

  const recipes = [
    {
      id: 1,
      name: "Rainbow Quinoa Buddha Bowl",
      image: "/placeholder.svg",
      sustainabilityScore: 95,
      carbonFootprint: "0.8 kg CO₂",
      waterUsage: "250L",
      cookTime: "25 min",
      servings: 4,
      difficulty: "Easy",
      tags: ["Vegan", "Gluten-Free", "Local"],
      ingredients: [
        "1 cup quinoa (locally sourced)",
        "2 cups seasonal vegetables",
        "1/2 cup chickpeas",
        "Tahini dressing",
        "Mixed greens"
      ],
      instructions: [
        "Cook quinoa according to package directions",
        "Roast seasonal vegetables with olive oil",
        "Prepare tahini dressing",
        "Assemble bowl with all ingredients"
      ],
      nutrition: {
        calories: 420,
        protein: "18g",
        carbs: "52g",
        fat: "16g"
      },
      sustainability: {
        seasonal: true,
        local: true,
        organic: true,
        lowWaste: true
      }
    },
    {
      id: 2,
      name: "Plant-Based Lentil Shepherd's Pie",
      image: "/placeholder.svg",
      sustainabilityScore: 92,
      carbonFootprint: "1.2 kg CO₂",
      waterUsage: "180L",
      cookTime: "45 min",
      servings: 6,
      difficulty: "Medium",
      tags: ["Vegan", "Protein-Rich", "Comfort Food"],
      ingredients: [
        "2 cups green lentils",
        "3 lbs local potatoes",
        "Seasonal root vegetables",
        "Vegetable broth",
        "Fresh herbs"
      ],
      instructions: [
        "Cook lentils with vegetables and herbs",
        "Prepare mashed potato topping",
        "Layer in baking dish",
        "Bake until golden brown"
      ],
      nutrition: {
        calories: 385,
        protein: "16g",
        carbs: "58g",
        fat: "12g"
      },
      sustainability: {
        seasonal: true,
        local: true,
        organic: false,
        lowWaste: true
      }
    },
    {
      id: 3,
      name: "Zero-Waste Vegetable Broth",
      image: "/placeholder.svg",
      sustainabilityScore: 98,
      carbonFootprint: "0.2 kg CO₂",
      waterUsage: "50L",
      cookTime: "60 min",
      servings: 8,
      difficulty: "Easy",
      tags: ["Zero-Waste", "Vegan", "Base Recipe"],
      ingredients: [
        "Vegetable scraps and peels",
        "Herb stems",
        "Onion skins",
        "Mushroom stems",
        "Bay leaves"
      ],
      instructions: [
        "Collect vegetable scraps in freezer",
        "Simmer scraps in water for 1 hour",
        "Strain and store broth",
        "Compost remaining solids"
      ],
      nutrition: {
        calories: 15,
        protein: "1g",
        carbs: "3g",
        fat: "0g"
      },
      sustainability: {
        seasonal: true,
        local: true,
        organic: true,
        lowWaste: true
      }
    }
  ];

  const sustainabilityTips = [
    {
      title: "Choose Seasonal Produce",
      description: "Seasonal fruits and vegetables have a 60% lower carbon footprint",
      icon: Apple,
      impact: "60% less CO₂"
    },
    {
      title: "Reduce Food Waste",
      description: "Use vegetable scraps for broths and composting",
      icon: TreePine,
      impact: "40% waste reduction"
    },
    {
      title: "Plant-Based Proteins",
      description: "Legumes and grains use 75% less water than meat",
      icon: Droplets,
      impact: "75% water savings"
    },
    {
      title: "Local Sourcing",
      description: "Local ingredients reduce transportation emissions",
      icon: Globe,
      impact: "50% transport reduction"
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-emerald-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
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
                        src={recipe.image} 
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className={`text-white ${getScoreColor(recipe.sustainabilityScore)}`}>
                          {recipe.sustainabilityScore}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Button size="sm" variant="ghost" className="bg-white/80 hover:bg-white">
                          <Heart className="w-4 h-4" />
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

                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        View Recipe
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recipe Detail Modal */}
              {selectedRecipe && (
                <div className="bg-white/95 rounded-xl p-6 border border-green-100 mt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{selectedRecipe.name}</h2>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={`text-white ${getScoreColor(selectedRecipe.sustainabilityScore)}`}>
                          Sustainability: {selectedRecipe.sustainabilityScore}
                        </Badge>
                        <Badge variant="outline">{selectedRecipe.difficulty}</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => setSelectedRecipe(null)}>
                      ✕
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Ingredients:</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <li key={index}>• {ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Instructions:</h3>
                      <ol className="text-sm text-gray-700 space-y-1">
                        {selectedRecipe.instructions.map((step, index) => (
                          <li key={index}>{index + 1}. {step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <div className="font-semibold text-green-700">{selectedRecipe.nutrition.calories}</div>
                      <div className="text-xs text-green-600">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-700">{selectedRecipe.nutrition.protein}</div>
                      <div className="text-xs text-green-600">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-700">{selectedRecipe.carbonFootprint}</div>
                      <div className="text-xs text-green-600">Carbon</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-700">{selectedRecipe.waterUsage}</div>
                      <div className="text-xs text-green-600">Water</div>
                    </div>
                  </div>
                </div>
              )}
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
                      <Badge className="bg-green-500 text-white">
                        Impact: {tip.impact}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="planner" className="mt-6">
              <div className="bg-white/80 rounded-xl p-6 border border-gray-100 text-center">
                <ChefHat className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Weekly Meal Planner</h3>
                <p className="text-gray-600 mb-4">Plan sustainable meals for the week based on seasonal ingredients and your dietary preferences.</p>
                <Button className="bg-green-600 hover:bg-green-700">
                  Create Meal Plan
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EcoRecipeFinder;
