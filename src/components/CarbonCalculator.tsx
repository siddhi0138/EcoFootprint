
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Car, Home, Plane, ShoppingBag, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CarbonCalculator = () => {
  const [formData, setFormData] = useState({
    transportation: { car: '', publicTransport: '', flights: '' },
    energy: { electricity: '', heating: '', homeSize: '' },
    consumption: { shopping: '', food: '', diet: 'mixed' },
    lifestyle: { recycling: 'sometimes', renewable: 'no' }
  });
  const [result, setResult] = useState<number | null>(null);
  const { toast } = useToast();

  const calculateFootprint = () => {
    // Simplified carbon footprint calculation (kg CO2/year)
    const carMiles = parseFloat(formData.transportation.car) || 0;
    const flights = parseFloat(formData.transportation.flights) || 0;
    const electricity = parseFloat(formData.energy.electricity) || 0;
    const shopping = parseFloat(formData.consumption.shopping) || 0;

    let total = 0;
    
    // Transportation (0.4 kg CO2 per mile for average car)
    total += carMiles * 12 * 0.4;
    
    // Flights (0.9 kg CO2 per mile)
    total += flights * 0.9;
    
    // Electricity (0.5 kg CO2 per kWh)
    total += electricity * 12 * 0.5;
    
    // Shopping (estimate)
    total += shopping * 12 * 2;
    
    // Diet adjustments
    const dietMultiplier = formData.consumption.diet === 'vegetarian' ? 0.8 : 
                          formData.consumption.diet === 'vegan' ? 0.6 : 1;
    total *= dietMultiplier;
    
    // Renewable energy reduction
    if (formData.lifestyle.renewable === 'yes') {
      total *= 0.7;
    }

    setResult(Math.round(total));
    
    toast({
      title: "Carbon footprint calculated!",
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
                <Leaf className="h-4 w-4 text-green-600" />
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
