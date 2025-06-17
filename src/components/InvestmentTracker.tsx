
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Leaf, 
  PieChart,
  ArrowUp,
  ArrowDown,
  Plus,
  Target,
  Globe,
  Zap
} from 'lucide-react';

const InvestmentTracker = () => {
  const [activeTab, setActiveTab] = useState('portfolio');

  const portfolio = {
    totalValue: 125000,
    sustainabilityScore: 78,
    greenPercentage: 65,
    carbonOffset: 15.2,
    monthlyReturn: 8.5,
    esgRating: 'AA'
  };

  const investments = [
    {
      name: "Tesla Inc.",
      symbol: "TSLA",
      value: 45000,
      percentage: 36,
      change: +12.5,
      sustainabilityScore: 92,
      category: "Clean Energy",
      impact: "15,000 kg CO₂ offset"
    },
    {
      name: "NextEra Energy",
      symbol: "NEE",
      value: 32000,
      percentage: 25.6,
      change: +6.8,
      sustainabilityScore: 88,
      category: "Renewable Energy",
      impact: "12,500 kg CO₂ offset"
    },
    {
      name: "Unilever PLC",
      symbol: "UL",
      value: 28000,
      percentage: 22.4,
      change: -2.1,
      sustainabilityScore: 84,
      category: "Sustainable Consumer",
      impact: "8,200 kg CO₂ offset"
    },
    {
      name: "Microsoft Corp",
      symbol: "MSFT",
      value: 20000,
      percentage: 16,
      change: +4.3,
      sustainabilityScore: 86,
      category: "Green Tech",
      impact: "6,800 kg CO₂ offset"
    }
  ];

  const sustainableFunds = [
    {
      name: "Vanguard ESG International",
      type: "ETF",
      score: 94,
      return: "12.8%",
      minInvestment: 1000
    },
    {
      name: "iShares MSCI KLD 400 Social",
      type: "ETF", 
      score: 91,
      return: "15.2%",
      minInvestment: 500
    },
    {
      name: "Green Century Balanced Fund",
      type: "Mutual Fund",
      score: 89,
      return: "10.5%",
      minInvestment: 2500
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-700">
            <TrendingUp className="w-6 h-6" />
            <span>Sustainability Investment Tracker</span>
            <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700">
              ESG Portfolio
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Portfolio Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 rounded-xl p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
              <div className="text-2xl font-bold text-gray-800">${portfolio.totalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 text-center">
              <Leaf className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-gray-800">{portfolio.sustainabilityScore}</div>
              <div className="text-sm text-gray-600">ESG Score</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-800">+{portfolio.monthlyReturn}%</div>
              <div className="text-sm text-gray-600">Monthly Return</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 text-center">
              <Globe className="w-6 h-6 mx-auto mb-2 text-teal-600" />
              <div className="text-2xl font-bold text-gray-800">{portfolio.carbonOffset}T</div>
              <div className="text-sm text-gray-600">CO₂ Offset</div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
              <TabsTrigger value="discover">Discover ESG</TabsTrigger>
              <TabsTrigger value="impact">Impact Report</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Current Holdings</h3>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Investment
                </Button>
              </div>

              {investments.map((investment, index) => (
                <div key={index} className="bg-white/80 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{investment.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">{investment.symbol}</Badge>
                        <Badge className="text-xs bg-emerald-100 text-emerald-700">{investment.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">${investment.value.toLocaleString()}</div>
                      <div className={`text-sm flex items-center ${investment.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {investment.change > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                        {Math.abs(investment.change)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Portfolio Weight</span>
                      <span className="font-medium">{investment.percentage}%</span>
                    </div>
                    <Progress value={investment.percentage} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500 text-white text-xs">
                        ESG: {investment.sustainabilityScore}
                      </Badge>
                      <span className="text-sm text-gray-600">{investment.impact}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="discover" className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-800">Recommended Sustainable Funds</h3>
              {sustainableFunds.map((fund, index) => (
                <div key={index} className="bg-white/80 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{fund.name}</h4>
                      <Badge variant="outline" className="mt-1">{fund.type}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{fund.return}</div>
                      <div className="text-sm text-gray-600">Annual Return</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-emerald-500 text-white">
                        ESG: {fund.score}
                      </Badge>
                      <span className="text-sm text-gray-600">Min: ${fund.minInvestment}</span>
                    </div>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Invest Now
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="impact" className="space-y-4 mt-6">
              <div className="bg-white/80 rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Environmental Impact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Globe className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">Carbon Offset Progress</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Annual Goal: 20T CO₂</span>
                        <span>{portfolio.carbonOffset}T achieved</span>
                      </div>
                      <Progress value={(portfolio.carbonOffset / 20) * 100} className="h-3" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">ESG Alignment</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Target: 80% Green</span>
                        <span>{portfolio.greenPercentage}% achieved</span>
                      </div>
                      <Progress value={portfolio.greenPercentage} className="h-3" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">Impact Summary</span>
                  </div>
                  <p className="text-sm text-emerald-700">
                    Your sustainable investments have offset the equivalent of 42,500 kg of CO₂ this year, 
                    equal to planting 1,900 trees or driving 105,000 fewer miles.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentTracker;
