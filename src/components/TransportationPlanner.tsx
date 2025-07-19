import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, collection, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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
  Zap,
  TreePine,
  Loader2
} from 'lucide-react';

import { OPEN_ROUTE_SERVICE_API_KEY } from '../config/openRouteConfig';
import { db, auth } from '../firebase';
import { useNotifications } from '../contexts/NotificationsContextNew';

const TransportationPlanner = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiKey = OPEN_ROUTE_SERVICE_API_KEY;
  const { toast } = useToast();
  const { addNotification } = useNotifications();


  // Geocoding function using Nominatim (free)
  const geocodeLocation = async (location: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          display_name: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Route calculation using OpenRouteService API
  const calculateRoute = async (fromCoords: { lat: number; lon: number }, toCoords: { lat: number; lon: number }, profile: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouteService API key to calculate real routes.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/${profile}?start=${fromCoords.lon},${fromCoords.lat}&end=${toCoords.lon},${toCoords.lat}`,
        {
          headers: {
            'Authorization': apiKey,
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
          }
        }
      );
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error: ${response.status} - ${errorBody}`);
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
      }
      
      const data = await response.json();
      return data.features[0].properties.segments[0];
    } catch (error) {
      console.error('Route calculation error:', error);
      return null;
    }
  };

  // Calculate emissions based on distance and transport mode
  const calculateEmissions = (distance, mode) => {
    const emissionFactors = {
      'foot-walking': 0,
      'cycling-regular': 0,
      'driving-car': 0.21, // kg CO2 per km
      'bus': 0.089, // kg CO2 per km per person
      'train': 0.041 // kg CO2 per km per person
    };
    return ((distance / 1000) * (emissionFactors[mode] || 0)).toFixed(2);
  };

  // Calculate cost based on distance and transport mode
  const calculateCost = (distance, mode) => {
    const costFactors = {
      'foot-walking': 0,
      'cycling-regular': 0,
      'driving-car': 0.15, // $ per km (fuel + maintenance)
      'bus': 0.12, // $ per km
      'train': 0.08 // $ per km
    };
    return ((distance / 1000) * (costFactors[mode] || 0)).toFixed(2);
  };

  // Calculate calories burned
  const calculateCalories = (distance, mode) => {
    const calorieFactors = {
      'foot-walking': 50, // calories per km
      'cycling-regular': 30, // calories per km
      'driving-car': 0,
      'bus': 0,
      'train': 0
    };
    return Math.round((distance / 1000) * (calorieFactors[mode] || 0));
  };

  // Get sustainability score
  const getSustainabilityScore = (mode) => {
    const scores = {
      'foot-walking': 100,
      'cycling-regular': 98,
      'bus': 85,
      'train': 90,
      'driving-car': 25
    };
    return scores[mode] || 50;
  };

  // Get transport mode details
  const getTransportModeDetails = (profile) => {
    const modeDetails = {
      'foot-walking': {
        icon: Footprints,
        name: 'Walking',
        color: 'bg-green-500',
        benefits: ['Zero emissions', 'Great exercise', 'No cost']
      },
      'cycling-regular': {
        icon: Bike,
        name: 'Cycling',
        color: 'bg-emerald-500',
        benefits: ['Zero emissions', 'Fast & healthy', 'Bike-friendly route']
      },
      'driving-car': {
        icon: Car,
        name: 'Driving',
        color: 'bg-red-500',
        benefits: ['Door to door', 'Weather independent', 'Fastest option']
      }
    };
    return modeDetails[profile] || {
      icon: Navigation,
      name: profile,
      color: 'bg-gray-500',
      benefits: ['Transportation option']
    };
  };

  // Function to calculate haversine distance between two coordinates in meters
  const haversineDistance = (coords1: { lat: number; lon: number }, coords2: { lat: number; lon: number }) => {
    const toRad = (x: number) => (x * Math.PI) / 180;

    const R = 6371000; // Earth radius in meters
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const planRoute = async () => {
    if (!fromLocation || !toLocation) {
      toast({
        title: "Missing Information",
        description: "Please enter both starting and destination locations.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setRoutes([]);

    try {
      // Geocode both locations
      const fromCoords = await geocodeLocation(fromLocation);
      const toCoords = await geocodeLocation(toLocation);

      if (!fromCoords || !toCoords) {
        toast({
          title: "Location Not Found",
          description: "Could not find one or both locations. Please check your input.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate coordinates
      if (
        typeof fromCoords.lat !== 'number' || typeof fromCoords.lon !== 'number' ||
        typeof toCoords.lat !== 'number' || typeof toCoords.lon !== 'number'
      ) {
        toast({
          title: "Invalid Coordinates",
          description: "Geocoding returned invalid coordinates.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if distance exceeds OpenRouteService limit (6,000,000 meters)
      const distanceBetweenPoints = haversineDistance(fromCoords, toCoords);
      if (distanceBetweenPoints > 6000000) {
        toast({
          title: "Route Too Long",
          description: "The requested route distance exceeds the 6,000 km limit of the routing service. Please choose closer locations.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Calculate routes for different transport modes
      const transportModes = ['foot-walking', 'cycling-regular', 'driving-car'];
      const calculatedRoutes = [];

      for (const mode of transportModes) {
        const routeData = await calculateRoute(fromCoords, toCoords, mode);
        if (routeData) {
          const modeDetails = getTransportModeDetails(mode);
          const distance = routeData.distance;
          const duration = routeData.duration;
          const emissions = calculateEmissions(distance, mode);
          const cost = calculateCost(distance, mode);
          const calories = calculateCalories(distance, mode);
          const sustainability = getSustainabilityScore(mode);

          calculatedRoutes.push({
            mode,
            icon: modeDetails.icon,
            name: modeDetails.name,
          duration: `${Math.round(duration / 60)} min`,
          distance: `${(distance / 1000).toFixed(1)} km`,
          cost: `$${cost}`,
          emissions: parseFloat(emissions),
          calories,
          color: modeDetails.color,
          sustainability,
          benefits: modeDetails.benefits
        });
      } else {
        toast({
          title: `Route Calculation Failed`,
          description: `Failed to calculate route for mode: ${mode}. Please try a different location or mode.`,
          variant: "destructive",
        });
      }
    }

      if (calculatedRoutes.length === 0) {
        toast({
          title: "No Routes Found",
          description: "Could not calculate routes between these locations.",
          variant: "destructive",
        });
      } else {
        setRoutes(calculatedRoutes);
        toast({
          title: "Routes Calculated",
          description: `Found ${calculatedRoutes.length} route options.`,
        });
        addNotification({
          type: 'suggestion',
          title: 'Routes Calculated',
          message: `Found ${calculatedRoutes.length} route options for your trip.`,
          read: false,
          source: 'travelPlanner',
          actionable: false,
        });
      }
    } catch (error) {
      console.error('Error planning route:', error);
      toast({
        title: "Error",
        description: "Failed to calculate routes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSustainabilityBadge = (score) => {
    if (score >= 90) return { color: 'bg-green-500', label: 'Excellent' };
    if (score >= 70) return { color: 'bg-emerald-500', label: 'Good' };
    if (score >= 50) return { color: 'bg-yellow-500', label: 'Fair' };
    return { color: 'bg-red-500', label: 'Poor' };
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-900 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-400">
            <Navigation className="w-6 h-6" />
            <span>Real-Time Transportation Planner</span>
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <Leaf className="w-4 h-4 mr-1" />
              Live Data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* API Key Input */}
          {/* Removed API key input UI as API key is now imported from config and hidden from UI */}
          {/* {!apiKey && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">API Key Required</h3>
              <p className="text-sm text-blue-700 mb-3">
                To calculate real routes, please get a free API key from OpenRouteService and enter it below:
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your OpenRouteService API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => window.open('https://openrouteservice.org/dev/#/signup', '_blank')}
                  variant="outline"
                  size="sm"
                >
                  Get Free API Key
                </Button>
              </div>
            </div>
          )} 
          */}

          {/* Route Input */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Enter starting location (e.g., New York, NY)"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="pl-10 border-green-200 focus:border-green-400 dark:border-green-700 dark:focus:border-green-500 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Enter destination (e.g., Boston, MA)"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="pl-10 border-green-200 focus:border-green-400 dark:border-green-700 dark:focus:border-green-500 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={planRoute}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 mr-2" />
                    Plan Route
                  </>
                )}
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
                  <div className="text-2xl font-bold text-green-600">
                    {Math.min(...routes.map(r => r.emissions))}kg
                  </div>
                  <div className="text-sm text-gray-600">Best Option CO₂</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {Math.max(...routes.map(r => r.emissions))}kg
                  </div>
                  <div className="text-sm text-gray-600">Worst Option CO₂</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(Math.max(...routes.map(r => r.emissions)) - Math.min(...routes.map(r => r.emissions))).toFixed(2)}kg
                  </div>
                  <div className="text-sm text-gray-600">CO₂ Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {Math.round((Math.max(...routes.map(r => r.emissions)) - Math.min(...routes.map(r => r.emissions))) * 0.02)}
                  </div>
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

  const saveRouteToFirestore = async (routeToSave) => {
    try {
      if (!auth.currentUser) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to save routes.',
          variant: 'destructive',
        });
        return;
      }
      const userRoutesCollection = collection(db, 'users', auth.currentUser.uid, 'savedRoutes');
      await addDoc(userRoutesCollection, {
        mode: routeToSave.mode,
        name: routeToSave.name,
        duration: routeToSave.duration,
        distance: routeToSave.distance,
        cost: routeToSave.cost,
        emissions: routeToSave.emissions,
        calories: routeToSave.calories,
        sustainability: routeToSave.sustainability,
        timestamp: new Date()
      });
      toast({
        title: 'Route Saved',
        description: 'Your route has been saved successfully.',
        variant: 'default',
      });
      addNotification({
        type: 'suggestion',
        title: 'Route Saved',
        message: `Your route "${routeToSave.name}" has been saved.`,
        read: false,
        source: 'travelPlanner',
        actionable: false,
      });
    } catch (error) {
      console.error('Error saving route:', error);
      if (error.code === 'permission-denied') {
        toast({
          title: 'Permission Denied',
          description: 'You do not have permission to save routes. Please check your account permissions.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Save Failed',
          description: 'Failed to save the route. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

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
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => saveRouteToFirestore(route)}>
                    Save
                  </Button>
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

          {/* Quick Tips */}
          <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <h3 className="font-semibold text-emerald-800 mb-2 flex items-center">
              <Leaf className="w-5 h-5 mr-2" />
              Eco-Friendly Travel Tips
            </h3>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• Walking and cycling produce zero emissions and improve health</li>
              <li>• Combine multiple trips to reduce overall transportation needs</li>
              <li>• Choose direct routes to minimize fuel consumption</li>
              <li>• Consider weather and traffic conditions when planning</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransportationPlanner;