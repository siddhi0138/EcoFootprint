import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChefHat, Navigation } from 'lucide-react';
import { EcoRecipeFinder } from './EcoRecipeFinder';
import TransportationPlanner from './TransportationPlanner';

// Product Lifecycle now lives as a tab inside Product Analysis (the "Deep Analysis" page)
// instead of here, so lifecycle data sits next to the rest of a product's real analysis
// instead of being a separate destination.
const LifestyleHub = ({ product }: { product?: any }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="recipes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recipes" className="flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            <span className="hidden sm:inline">Eco Recipes</span>
          </TabsTrigger>
          <TabsTrigger value="transport" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            <span className="hidden sm:inline">Transport Planner</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipes">
          <EcoRecipeFinder />
        </TabsContent>

        <TabsContent value="transport">
          <TransportationPlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LifestyleHub;
