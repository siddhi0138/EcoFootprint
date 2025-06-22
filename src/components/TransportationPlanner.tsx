
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Car, 
  Bike, 
  Bus,
  Train,
  Footprints,
  Leaf,
  Clock,
  DollarSign,
  Navigation,
  Bookmark,
  Zap,
  TreePine
} from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot, collection, addDoc, deleteDoc } from 'firebase/firestore';

const TransportationPlanner = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [routes, setRoutes] = useState([]);

  const mockRoutes = [
    {
      mode: 'walking',
      icon: Footprints,
      name: 'Walking',
      duration: '23 min',
      distance: '1.8 km',
      cost: '$0',
      emissions: 0,
      calories: 120,
      color: 'bg-green-500',
      sustainability: 100,
      benefits: ['Zero emissions', 'Great exercise', 'No cost']
    },
    {
      mode: 'cycling',
      icon: Bike,
      name: 'Cycling',
      duration: '8 min',
      distance: '1.8 km',
      cost: '$0',
      emissions: 0,
      calories: 45,
      color: 'bg-emerald-500',
      sustainability: 98,
      benefits: ['Zero emissions', 'Fast & healthy', 'Bike-friendly route']
    },
    {
      mode: 'transit',
      icon: Bus,
      name: 'Public Transit',
      duration: '15 min',
      distance: '2.1 km',
      cost: '$2.50',
      emissions: 0.12,
      calories: 15,
      color: 'bg-blue-500',
      sustainability: 85,
      benefits: ['Low emissions', 'Cost effective', '2 bus transfers']
    },
    {
      mode: 'train',
      icon: Train,
      name: 'Metro Rail',
      duration: '12 min',
      distance: '2.3 km',
      cost: '$3.00',
      emissions: 0.08,
      calories: 10,
      color: 'bg-indigo-500',
      sustainability: 90,
      benefits: ['Very low emissions', 'Reliable timing', 'Direct route']
    },
    {
      mode: 'rideshare',
      icon: Car,
      name: 'Rideshare (Shared)',
      duration: '7 min',
      distance: '1.9 km',
      cost: '$8.50',
      emissions: 0.35,
      calories: 0,
      color: 'bg-yellow-500',
      sustainability: 60,
      benefits: ['Door to door', 'Shared ride', 'No parking needed']
    },
    {
      mode: 'car',
      icon: Car,
      name: 'Private Car',
      duration: '6 min',
      distance: '1.9 km',
      cost: '$4.20',
      emissions: 0.85,
      calories: 0,
      color: 'bg-red-500',
      sustainability: 25,
      benefits: ['Fastest option', 'Private', 'Direct route']
    }
  ];

  const { currentUser } = useAuth();
  const [savedRoutes, setSavedRoutes] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const savedRoutesCollectionRef = collection(userDocRef, 'savedRoutes');
      const unsubscribe = onSnapshot(savedRoutesCollectionRef, (snapshot) => {
        const routesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as any,
        }));
        setSavedRoutes(routesData);
      }, (error) => {
        console.error("Error fetching saved routes: ", error);
        toast({
          title: "Error",
          description: "Failed to load saved routes.",
          variant: "destructive",
        });
      });
      return () => unsubscribe();
    } else {
      setSavedRoutes([]);
    }
  }, [currentUser, toast]);

  const planRoute = () => {
    if (fromLocation && toLocation) {
      setRoutes(mockRoutes);
    }
  };

  const getSustainabilityBadge = (score) => {
    if (score >= 90) return { color: 'bg-green-500', label: 'Excellent' };
    if (score >= 70) return { color: 'bg-emerald-500', label: 'Good' };
    if (score >= 50) return { color: 'bg-yellow-500', label: 'Fair' };
    return { color: 'bg-red-500', label: 'Poor' };
  };

  const handleSaveRoute = async (routeToSave) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save routes.",
 variant: "default",
      });
      return;
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const savedRoutesCollectionRef = collection(userDocRef, 'savedRoutes');
      await addDoc(savedRoutesCollectionRef, {
        fromLocation,
        toLocation,
        route: routeToSave,
        savedAt: new Date(),
      });
      toast({
        title: "Route Saved",
        description: `${routeToSave.name} route from ${fromLocation} to ${toLocation} saved successfully.`,
      });
    } catch (error) {
      console.error("Error saving route: ", error);
      toast({
        title: "Error",
        description: "Failed to save route.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoute = async (routeId) => {
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'savedRoutes', routeId));
      toast({ title: "Route Deleted", description: "Route removed from saved list." });
    } catch (error) {
      console.error("Error deleting route: ", error);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <Navigation className="w-6 h-6" />
            <span>Green Transportation Planner</span>
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
              <Leaf className="w-4 h-4 mr-1" />
              Eco-Friendly
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Route Input */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter starting location"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="pl-10 border-green-200 focus:border-green-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter destination"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="pl-10 border-green-200 focus:border-green-400"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={planRoute}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Plan Route
              </Button>
            </div>
          </div>

          {/* Carbon Impact Summary */}
          {routes.length > 0 && (
            <div className="bg-white/80 rounded-xl p-4 mb-6 border border-green-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <TreePine className="w-5 h-5 mr-2 text-green-600" />
                Environmental Impact Comparison
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0kg</div>
                  <div className="text-sm text-gray-600">Best Option CO₂</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">0.85kg</div>
                  <div className="text-sm text-gray-600">Worst Option CO₂</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0.85kg</div>
                  <div className="text-sm text-gray-600">CO₂ Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">4</div>
                  <div className="text-sm text-gray-600">Trees Equivalent</div>
                </div>
              </div>
            </div>
          )}

          {/* Route Options */}
          {routes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Route Options</h3>
              {routes.map((route, index) => {
                const sustainabilityBadge = getSustainabilityBadge(route.sustainability);
                return (
                  <div key={index} className="bg-white/80 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${route.color} rounded-xl flex items-center justify-center`}>
                          <route.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{route.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={`text-white text-xs ${sustainabilityBadge.color}`}>
                              {sustainabilityBadge.label}
                            </Badge>
                            <span className="text-sm text-gray-600">{route.sustainability}/100</span>
                          </div>
                        </div>
                      </div>
                      {currentUser && (
                        <Button
                          size="sm"
                          onClick={() => handleSaveRoute(route)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-2" /> Save Route
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{route.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Navigation className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{route.distance}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{route.cost}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Leaf className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{route.emissions}kg CO₂</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{route.calories} cal</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-800">Benefits:</h5>
                      <div className="flex flex-wrap gap-2">
                        {route.benefits.map((benefit, benefitIndex) => (
                          <Badge key={benefitIndex} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Saved Routes */}
          {currentUser && savedRoutes.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <Bookmark className="w-5 h-5 text-purple-600" />
                <span>Saved Routes</span>
              </h3>
              {savedRoutes.map((savedRoute) => {
                const route = savedRoute.route;
                const sustainabilityBadge = getSustainabilityBadge(route.sustainability);
                return (
                  <div key={savedRoute.id} className="bg-white/80 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 ${route.color} rounded-lg flex items-center justify-center`}>
                        <route.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{route.name} from {savedRoute.fromLocation} to {savedRoute.toLocation}</div>
                        <div className="text-sm text-gray-600 flex items-center space-x-3 mt-1">
                          <span>{route.duration}</span>
                          <span>{route.distance}</span>
                          <Badge className={`text-white text-xs ${sustainabilityBadge.color}`}>{sustainabilityBadge.label}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteRoute(savedRoute.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Tips */}
          <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <h3 className="font-semibold text-emerald-800 mb-2 flex items-center">
              <Leaf className="w-5 h-5 mr-2" />
              Eco-Friendly Travel Tips
            </h3>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• Walking and cycling produce zero emissions and improve health</li>
              <li>• Public transit can reduce your carbon footprint by up to 85%</li>
              <li>• Shared rides are more sustainable than private car trips</li>
              <li>• Plan trips during off-peak hours for better transit efficiency</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransportationPlanner;
