import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  TrendingUp,
  ArrowUp,
  ArrowDownLeft,
  ArrowDown,
  Plus,
  Target,
  Leaf,
  Globe,
  Zap,
  DollarSign,
  Search,
  Filter
} from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';

const InvestmentTracker = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [portfolio, setPortfolio] = useState({ 
    totalValue: 0, 
    sustainabilityScore: 0, 
    greenPercentage: 0, 
    carbonOffset: 0, 
    monthlyReturn: 0, 
    esgRating: 'N/A' 
  } as any);
  const [userInvestments, setUserInvestments] = useState([]);
  const { incrementInvestment, addPoints, userStats } = useUserData();
  const { currentUser } = useAuth() as { currentUser: any };

  // Calculate portfolio metrics from userInvestments
  useEffect(() => {
    const investmentsCollectionRef = collection(db, `users/${currentUser.uid}/investments`);
    const unsubscribe = onSnapshot(investmentsCollectionRef, (snapshot: any) => {
      const investmentsData: any = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserInvestments(investmentsData);

      // Calculate portfolio data from investmentsData
      const portfolioData = investmentsData.reduce((acc: any, investment: any) => {
        acc.totalValue += investment.value || 0;
        acc.sustainabilityScore += (investment.sustainabilityScore || 0) * (investment.value || 0);
        acc.greenPercentage += (investment.category === 'Clean Energy' || investment.category === 'Renewable Energy' || investment.category === 'Green Tech') ? investment.value : 0;
        acc.carbonOffset += parseFloat(investment.impact?.replace(/[^0-9.-]+/g,"") || 0); // Assuming impact is in kg CO2 and converting to tonnes
        // You'll need to implement logic to calculate monthlyReturn and esgRating based on your investment data structure and goals. This is a placeholder.
        return acc;
      }, {
        totalValue: 0, 
        sustainabilityScore: 0, 
        greenPercentage: 0, 
        carbonOffset: 0, 
        monthlyReturn: 0, 
        esgRating: 'N/A' 
      });

      // Calculate weighted averages for scores/percentages
      if (portfolioData.totalValue > 0) {
        portfolioData.sustainabilityScore = portfolioData.sustainabilityScore / portfolioData.totalValue;
        portfolioData.greenPercentage = portfolioData.greenPercentage / portfolioData.totalValue;
      }

      // You'll need to implement logic to calculate monthlyReturn and esgRating based on your investment data structure and goals. This is a placeholder.

      setPortfolio(portfolioData);
    });
    return () => unsubscribe();
  }, [userInvestments, currentUser]); // Depend on userInvestments and currentUser

  const investments = [
    {
      name: "Tesla Inc.",
      symbol: "TSLA",
      value: 45000,
      percentage: 36,
      change: +12.5,
      sustainabilityScore: 92,
      category: "Clean Energy",
      impact: "15,000 kg CO₂ offset",
      description: "Leading electric vehicle and clean energy company",
      minInvestment: 1000
    },
    {
      name: "NextEra Energy",
      symbol: "NEE",
      value: 32000,
      percentage: 25.6,
      change: +6.8,
      sustainabilityScore: 88,
      category: "Renewable Energy",
      impact: "12,500 kg CO₂ offset",
      description: "Largest utility company focused on renewable energy",
      minInvestment: 500
    },
    {
      name: "Unilever PLC",
      symbol: "UL",
      value: 28000,
      percentage: 22.4,
      change: -2.1,
      sustainabilityScore: 84,
      category: "Sustainable Consumer",
      impact: "8,200 kg CO₂ offset",
      description: "Consumer goods with strong sustainability commitment",
      minInvestment: 750
    },
    {
      name: "Microsoft Corp",
      symbol: "MSFT",
      value: 20000,
      percentage: 16,
      change: +4.3,
      sustainabilityScore: 86,
      category: "Green Tech",
      impact: "6,800 kg CO₂ offset",
      description: "Technology leader with carbon negative goals",
      minInvestment: 1200
    }
  ];

  const sustainableFunds = [
    {
      name: "Vanguard ESG International",
      type: "ETF",
      score: 94,
      return: "12.8%",
      minInvestment: 1000,
      description: "Diversified international sustainability fund",
      holdings: "850 companies across 22 countries",
      expenseRatio: "0.20%"
    },
    {
      name: "iShares MSCI KLD 400 Social",
      type: "ETF", 
      score: 91,
      return: "15.2%",
      minInvestment: 500,
      description: "US companies with strong ESG characteristics",
      holdings: "400 large-cap US companies",
      expenseRatio: "0.25%"
    },
    {
      name: "Green Century Balanced Fund",
      type: "Mutual Fund",
      score: 89,
      return: "10.5%",
      minInvestment: 2500,
      description: "Balanced fund avoiding fossil fuel investments",
      holdings: "Mix of stocks and bonds",
      expenseRatio: "0.90%"
    }
  ];

  const handleViewDetails = (investment: any) => {
    setSelectedInvestment(investment);
    addPoints(5);
  };

  const addInvestmentToFirestore = async (investmentData: any) => {
    if (currentUser) {
      try {
        const investmentsCollectionRef = collection(db, `users/${currentUser.uid}/investments`);
        await addDoc(investmentsCollectionRef, investmentData);
        addPoints(100); // Award points for adding an investment
      } catch (error) {
        console.error("Error adding investment to Firestore: ", error);
      }
    }
  };

  const handleAddInvestment = async (investment: any) => {
    if (investmentAmount && parseFloat(investmentAmount) >= investment.minInvestment) {
      const newInvestment = {
        name: investment.name,
        symbol: investment.symbol,
        value: parseFloat(investmentAmount),
        sustainabilityScore: investment.sustainabilityScore,
        category: investment.category,
        impact: investment.impact, // You might want to calculate actual impact based on amount
        type: 'Stock', // Or determine type based on source
        timestamp: new Date(),
      };
      await addInvestmentToFirestore(newInvestment);
      incrementInvestment();
      alert(`Successfully added $${investmentAmount} to ${investment.name}!`);
      setInvestmentAmount('');
      setSelectedInvestment(null);
    } else {
      alert(`Minimum investment for ${investment.name} is $${investment.minInvestment}`);
    }
  };

  const handleInvestNow = async (fund: any) => {
    if (investmentAmount && parseFloat(investmentAmount) >= fund.minInvestment) {
      const newInvestment = {
        name: fund.name,
        type: fund.type,
        value: parseFloat(investmentAmount),
        sustainabilityScore: fund.score,
        description: fund.description,
        timestamp: new Date(),
      };
      await addInvestmentToFirestore(newInvestment);
      incrementInvestment();
      alert(`Successfully invested $${investmentAmount} in ${fund.name}!`);
      setInvestmentAmount('');
    } else {
      alert(`Minimum investment for ${fund.name} is $${fund.minInvestment}`);
    }
  };
  
  const filteredInvestments = userInvestments.filter((investment: any) =>
    investment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    investment.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFunds = sustainableFunds.filter(fund =>
    fund.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Investment Detail Modal */}
      {selectedInvestment && (
        <Card className="bg-white/95 rounded-xl border border-emerald-100 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedInvestment.name}</h2>
                <p className="text-gray-600 mt-2">{selectedInvestment.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-emerald-500 text-white">
                    ESG: {selectedInvestment.sustainabilityScore}
                  </Badge>
                  <Badge variant="outline">{selectedInvestment.category}</Badge>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedInvestment(null)}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3">Investment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current Value:</span>
                    <span className="font-semibold">${selectedInvestment.value?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <span className={`font-semibold ${selectedInvestment.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedInvestment.change > 0 ? '+' : ''}{selectedInvestment.change}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Investment:</span>
                    <span className="font-semibold">${selectedInvestment.minInvestment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Environmental Impact:</span>
                    <span className="font-semibold text-green-600">{selectedInvestment.impact}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Add Investment</h3>
                <div className="space-y-3">
                  <Input
                    type="number"
                    placeholder="Investment amount"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    min={selectedInvestment.minInvestment}
                  />
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleAddInvestment(selectedInvestment)}
                  >
                    Add to Portfolio
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              <div className="text-2xl font-bold text-gray-800">${portfolio?.totalValue?.toLocaleString() || '0'}</div>
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

          {/* Tabs for Portfolio, Discover, and Impact */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
              <TabsTrigger value="discover">Discover ESG</TabsTrigger>
              <TabsTrigger value="impact">Impact Report</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="space-y-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Current Holdings</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search investments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Investment
                  </Button>
                </div>
              </div>

              {filteredInvestments.map((investment, index) => (
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
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(investment)}>
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="discover" className="space-y-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Recommended Sustainable Funds</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search funds..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>

              {filteredFunds.map((fund, index) => (
                <div key={index} className="bg-white/80 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{fund.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{fund.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{fund.type}</Badge>
                        <span className="text-xs text-gray-500">{fund.holdings}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{fund.return}</div>
                      <div className="text-sm text-gray-600">Annual Return</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">ESG Score:</span>
                      <div className="font-semibold">{fund.score}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Min Investment:</span>
                      <div className="font-semibold">${fund.minInvestment}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Expense Ratio:</span>
                      <div className="font-semibold">{fund.expenseRatio}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <div className="font-semibold">{fund.type}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Badge className="bg-emerald-500 text-white">
                      ESG: {fund.score}
                    </Badge>
                    <div className="flex space-x-2 ml-auto">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        className="w-32"
                        min={fund.minInvestment}
                      />
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleInvestNow(fund)}
                      >
                        Invest Now
                      </Button>
                    </div>
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
                      <div className="flex justify-between text-sm text-gray-700">
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
                      <div className="flex justify-between text-sm text-gray-700">
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
                    Your sustainable investments have offset the equivalent of {Math.round(portfolio.carbonOffset * 2800)} kg of CO₂ this year, 
                    equal to planting {Math.round(portfolio.carbonOffset * 125)} trees or driving {Math.round(portfolio.carbonOffset * 6900)} fewer miles.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-emerald-600">{userStats.investmentsMade}</div>
                    <div className="text-sm text-gray-600">Investments Added</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">{portfolio.esgRating}</div>
                    <div className="text-sm text-gray-600">ESG Rating</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">{portfolio.sustainabilityScore}</div>
                    <div className="text-sm text-gray-600">Sustainability Score</div>
                  </div>
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