// TODO: Implement data fetching from Firestore

import React, { useState } from 'react';
import { getApp } from 'firebase/app'; // Import getApp
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'; // Import Timestamp
import { useUser } from '@/contexts/UserContext'; // Assuming UserContext provides the authenticated user
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Car, Home, Plane, ShoppingBag, Leaf, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CarbonCalculator = () => {
  const [formData, setFormData] = useState({
    transportation: { car: '', publicTransport: '', flights: '' },
    energy: { electricity: '', heating: '', homeSize: '' },
    consumption: { shopping: '', food: '', diet: 'mixed' },
    lifestyle: { recycling: 'sometimes', renewable: 'no' },
    waste: { paper: '', plastic: '', glass: '', compost: 'no' } // Added waste category
  });
  const [result, setResult] = useState<number | null>(null);
  const { toast } = useToast();
  // Ensure useUser hook correctly provides the Firebase User object or null
  const { user } = useUser(); // Get the authenticated user from context
  const db = getFirestore(getApp()); // Get Firestore instance

  const calculateFootprint = async () => {
    // Carbon footprint calculation (kg CO2/year)
    // Emission factors are approximate and based on general averages.
    // For more accuracy, these should be specific to region, energy source, etc.
    // Consider fetching from a reliable API for a production application.

    const carMiles = parseFloat(formData.transportation.car) || 0;
    const flights = parseFloat(formData.transportation.flights) || 0;
    const electricity = parseFloat(formData.energy.electricity) || 0;
    const shopping = parseFloat(formData.consumption.shopping) || 0;

    // Added waste category
    const paperWaste = parseFloat(formData.waste.paper) || 0;
    const plasticWaste = parseFloat(formData.waste.plastic) || 0;
    const glassWaste = parseFloat(formData.waste.glass) || 0;

    let total = 0;

    // Transportation:
    // Average passenger car: ~0.404 kg CO2 per mile (source: EPA, 2021)
    total += carMiles * 12 * 0.404;

    // Flights: Short-haul flights have higher emissions per mile than long-haul.
    // Using an average estimate: ~0.2 kg CO2 per passenger mile (source: various estimates)
    total += flights * 0.2;

    // Home Energy - Electricity:
    // US Average: ~0.42 kg CO2 per kWh (source: EIA, varies greatly by region)
    total += electricity * 12 * 0.42;

    // Note: Heating is not currently calculated but could be added based on fuel type (natural gas, oil, etc.)

    // Consumption: Highly variable, this is a very rough estimate based on spending.
    // Shopping (estimate): This factor is a broad average and can vary significantly.
    total += shopping * 12 * 2;
    
    // Diet adjustments
    // Dietary emissions vary widely based on type and source of food.
    // These multipliers are approximate.
    const dietMultiplier = formData.consumption.diet === 'vegetarian' ? 0.8 : 
                          formData.consumption.diet === 'vegan' ? 0.6 : 1;
    total *= dietMultiplier;

    // Waste Generation:
    // Emission factors for waste vary based on waste type and disposal method (landfill, recycling, composting).
    // These are simplified estimates for landfill disposal.
    // Paper: ~1.5 kg CO2e per kg (includes production and disposal)
    total += paperWaste * 1.5;
    // Plastic: ~3 kg CO2e per kg (includes production and disposal)
    total += plasticWaste * 3;
    // Glass: ~0.5 kg CO2e per kg (primarily from production)
    total += glassWaste * 0.5;

    // Renewable energy reduction: This is a simplified reduction.
    // A more accurate calculation would consider the percentage of renewable energy used.
    if (formData.lifestyle.renewable === 'yes') {
      // Assume a significant reduction for 100% renewable
      total *= 0.7;
    }

    // Save data to Firestore
    if (user) {
      try {
        const carbonFootprintsCollection = collection(db, 'carbonFootprints');
        await addDoc(carbonFootprintsCollection, {
          userId: user.uid,
          timestamp: Timestamp.now(), // Use Firestore Timestamp
          footprint: Math.round(total),
          formData: formData, // Save the form data for potential future use
        });
        console.log('Carbon footprint data saved to Firestore');
      } catch (error) {
        console.error('Error saving carbon footprint data: ', error);
        toast({
          title: "Error saving data",
          description: "Failed to save your footprint data. Please try again.",
          variant: "destructive",
        });
      }
    }

    setResult(Math.round(total));
    
    toast({
      description: `Your estimated annual footprint: ${Math.round(total)} kg CO2`,
    });
  };

  const getFootprintLevel = (footprint: number) => {
    if (footprint < 4000) return { level: 'Excellent', color: 'text-green-600', emoji: '🌟' };
    if (footprint < 8000) return { level: 'Good', color: 'text-emerald-600', emoji: '🌱' };
    if (footprint < 12000) return { level: 'Average', color: 'text-yellow-600', emoji: '⚠️' };
    return { level: 'High', color: 'text-red-600', emoji: '🚨' };
  };

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-emerald-600" />
            <span>Personal Carbon Footprint Calculator</span>
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Calculate your annual carbon footprint and get personalized recommendations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Transportation */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Car className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium">Transportation</h4>
              </div>
              <div>
                <Label htmlFor="car">Miles driven per month</Label>
                <Input
                  id="car"
                  type="number"
                  placeholder="e.g., 1000"
                  value={formData.transportation.car}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    transportation: { ...prev.transportation, car: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="flights">Flight miles per year</Label>
                <Input
                  id="flights"
                  type="number"
                  placeholder="e.g., 2500"
                  value={formData.transportation.flights}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    transportation: { ...prev.transportation, flights: e.target.value }
                  }))}
                />
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Home className="h-4 w-4 text-orange-600" />
                <h4 className="font-medium">Home Energy</h4>
              </div>
              <div>
                <Label htmlFor="electricity">Monthly electricity (kWh)</Label>
                <Input
                  id="electricity"
                  type="number"
                  placeholder="e.g., 800"
                  value={formData.energy.electricity}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    energy: { ...prev.energy, electricity: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Renewable energy source?</Label>
                <Select value={formData.lifestyle.renewable} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle, renewable: value } }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="partial">Partially</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Consumption */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <ShoppingBag className="h-4 w-4 text-purple-600" />
                <h4 className="font-medium">Consumption</h4>
              </div>
              <div>
                <Label htmlFor="shopping">Monthly shopping ($)</Label>
                <Input
                  id="shopping"
                  type="number"
                  placeholder="e.g., 500"
                  value={formData.consumption.shopping}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    consumption: { ...prev.consumption, shopping: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Diet type</Label>
                <Select value={formData.consumption.diet} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, consumption: { ...prev.consumption, diet: value } }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="mixed">Mixed diet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lifestyle */}
             <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Leaf className="h-4 w-4 text-green-600"/>
                <h4 className="font-medium">Lifestyle</h4>
              </div>
              <div>
                <Label>Recycling habits</Label>
                <Select value={formData.lifestyle.recycling} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle, recycling: value } }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always recycle</SelectItem>
                    <SelectItem value="sometimes">Sometimes recycle</SelectItem>
                    <SelectItem value="rarely">Rarely recycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button 
            onClick={calculateFootprint}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Calculate My Carbon Footprint
          </Button>

          {result !== null && (
            <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
              <div className="text-center">
                <div className="text-3xl mb-2">{getFootprintLevel(result).emoji}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {result.toLocaleString()} kg CO₂/year
                </h3>
                <p className={`text-lg font-medium ${getFootprintLevel(result).color}`}>
                  {getFootprintLevel(result).level} Impact Level
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Global average: ~4,800 kg CO₂/year • Paris Agreement target: ~2,300 kg CO₂/year
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CarbonCalculator;
