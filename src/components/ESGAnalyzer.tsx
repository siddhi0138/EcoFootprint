import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Search,
  TrendingUp,
  TrendingDown,
  Leaf,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Globe,
  Star,
  Target,
  BarChart3,
  Award,
  ExternalLink,
  Download,
  FileText,
} from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

const ESGAnalyzer = () => {
  const { user } = useAuth(); // Get user from useAuth
  const { incrementESGReport, addPoints } = useUserData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [firebaseAnalyzedCompanies, setFirebaseAnalyzedCompanies] = useState(new Set<string>()); // Store tickers
  const [firebaseComparisonList, setFirebaseComparisonList] = useState<any[]>([]); // Store company objects or tickers

  // Fetch user's ESG analysis data
  useEffect(() => {
    if (!user) {
      setFirebaseAnalyzedCompanies(new Set());
      setFirebaseComparisonList([]);
      return;
    }

    const userEsgRef = doc(db, 'users', user.uid, 'esgAnalysis', 'data');
    const unsubscribeEsg = onSnapshot(userEsgRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirebaseAnalyzedCompanies(new Set(data.analyzedCompanies || []));
        // Fetch full company data for comparison list if storing tickers
        if (data.comparisonList && data.comparisonList.length > 0) {
             const companiesToCompare = companies.filter(company => data.comparisonList.includes(company.ticker));
             setFirebaseComparisonList(companiesToCompare);
        } else {
             setFirebaseComparisonList([]);
        }

      } else {
        // Initialize if no data exists
        setFirebaseAnalyzedCompanies(new Set());
        setFirebaseComparisonList([]);
        // Optionally create the document with initial empty values
         setDoc(userEsgRef, {
           analyzedCompanies: [],
           comparisonList: []
         }).catch(error => console.error("Error initializing user ESG analysis data:", error));
      }
    }, (error) => {
      console.error('Error fetching user ESG analysis data:', error);
    });

    return () => unsubscribeEsg();
  }, [user]);


  const companies = [
    {
      name: 'Microsoft Corporation',
      ticker: 'MSFT',
      esgScore: 91,
      environmental: 88,
      social: 92,
      governance: 93,
      rating: 'AAA',
      trend: 'up',
      marketCap: '2.8T',
      sector: 'Technology',
      initiatives: [
        'Carbon negative by 2030',
        '100% renewable energy by 2025',
        'Inclusive hiring practices',
        'AI for Good programs',
      ],
      risks: ['Data privacy regulations', 'Antitrust scrutiny'],
      certifications: ['B-Corp', 'UN Global Compact', 'CDP A-List'],
      report: {
        sustainability: 'Leading carbon reduction initiatives with measurable impact',
        governance: 'Strong board diversity and transparent reporting',
        social: 'Comprehensive diversity and inclusion programs',
      },
    },
    {
      name: 'Tesla, Inc.',
      ticker: 'TSLA',
      esgScore: 85,
      environmental: 95,
      social: 78,
      governance: 82,
      rating: 'AA',
      trend: 'up',
      marketCap: '800B',
      sector: 'Automotive',
      initiatives: [
        'Accelerating sustainable transport',
        'Solar energy solutions',
        'Battery recycling program',
        'Gigafactory renewable energy',
      ],
      risks: ['Labor relations', 'Executive governance'],
      certifications: ['ISO 14001', 'LEED Certified Facilities'],
    },
    {
      name: 'ExxonMobil Corporation',
      ticker: 'XOM',
      esgScore: 42,
      environmental: 35,
      social: 48,
      governance: 44,
      rating: 'C',
      trend: 'down',
      marketCap: '450B',
      sector: 'Energy',
      initiatives: [
        'Low-carbon solutions research',
        'Methane reduction targets',
        'Community investment programs',
      ],
      risks: ['Climate litigation', 'Stranded assets', 'Regulatory pressure'],
      certifications: ['API Environmental Excellence'],
    },
  ];

  const handleCompanySelect = async (company) => { // Make async
    setSelectedCompany(company);
    if (!user) return;

    const userEsgRef = doc(db, 'users', user.uid, 'esgAnalysis', 'data');

    if (!firebaseAnalyzedCompanies.has(company.ticker)) {
      await updateDoc(userEsgRef, {
         analyzedCompanies: arrayUnion(company.ticker) // Add ticker to analyzedCompanies array
      });
      incrementESGReport(); // This will update userStats in Firebase via useUserData
    }
  };

  const handleAnalyze = () => {
    if (searchQuery.trim()) {
      // Simulate analysis of searched company
      // In a real application, you would call an API here to get ESG data
      addPoints(20); // This will update userStats in Firebase via useUserData
      alert(`Analyzing ${searchQuery}... Analysis complete!`);
    }
  };

  const handleViewFullReport = (company) => {
    addPoints(15); // This will update userStats in Firebase via useUserData
    alert(`Full ESG report for ${company.name} downloaded! This would typically open a detailed PDF report.`);
  };

  const handleCompareCompanies = async (company) => { // Make async
    if (!user) return;

    const userEsgRef = doc(db, 'users', user.uid, 'esgAnalysis', 'data');
    const comparisonTickers = firebaseComparisonList.map(c => c.ticker); // Get tickers from comparison list

    const existingIndex = comparisonTickers.findIndex(ticker => ticker === company.ticker);

    if (existingIndex >= 0) {
      // Remove from comparison
      await updateDoc(userEsgRef, {
        comparisonList: arrayRemove(company.ticker) // Remove ticker from comparisonList array
      });
    } else if (comparisonTickers.length < 3) {
      // Add to comparison
       await updateDoc(userEsgRef, {
         comparisonList: arrayUnion(company.ticker) // Add ticker to comparisonList array
      });
      addPoints(10); // This will update userStats in Firebase via useUserData
    } else {
      alert('You can compare up to 3 companies at once.');
      return;
    }

    // State will be updated by the onSnapshot listener
  };

   const handleClearComparison = async () => { // Make async
       if (!user) return;
       const userEsgRef = doc(db, 'users', user.uid, 'esgAnalysis', 'data');
       await updateDoc(userEsgRef, {
           comparisonList: [] // Clear the comparisonList array
       });
   };


  const getScoreColor = (score) => {
    if (score >= 80) return 'text-slate-800 bg-slate-100';
    if (score >= 60) return 'text-slate-700 bg-slate-200';
    return 'text-slate-600 bg-slate-300';
  };

  const getRatingColor = (rating) => {
    if (rating.startsWith('A')) return 'bg-slate-800';
    if (rating.startsWith('B')) return 'bg-slate-600';
    if (rating.startsWith('C')) return 'bg-slate-400';
    return 'bg-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Company Comparison Panel */}
      {firebaseComparisonList.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Company Comparison ({firebaseComparisonList.length}/3)</span>
              <Button variant="outline" onClick={handleClearComparison}> {/* Use new handler */}
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {firebaseComparisonList.map((company, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{company.name}</h4>
                    <Badge className={`text-white ${getRatingColor(company.rating)}`}>
                      {company.rating}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ESG Score</span>
                      <span className="font-semibold">{company.esgScore}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Environmental</span>
                      <span>{company.environmental}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Social</span>
                      <span>{company.social}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Governance</span>
                      <span>{company.governance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-lg rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Corporate ESG Analyzer</span>
                <p className="text-sm text-slate-600 font-normal">Professional-grade ESG assessment</p>
              </div>
            </div>
            <Badge variant="outline" className="border-slate-300 text-slate-700 bg-slate-50">
              <BarChart3 className="w-3 h-3 mr-1" />
              Professional
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Interface */}
          <div className="flex space-x-3">
            <Input
              placeholder="Search companies by name or ticker symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-slate-300 focus:border-slate-500 bg-white"
            />
            <Button className="bg-slate-800 hover:bg-slate-700 px-6" onClick={handleAnalyze}>
              <Search className="w-4 h-4 mr-2" />
              Analyze
            </Button>
          </div>

          {/* Company Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-slate-300"
                onClick={() => handleCompanySelect(company)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">{company.name}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs border-slate-300 text-slate-700">
                        {company.ticker}
                      </Badge>
                      <Badge className={`text-xs text-white ${getRatingColor(company.rating)}`}>
                        {company.rating}
                      </Badge>
                      <span className="text-xs text-slate-500">{company.sector}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{company.esgScore}</div>
                    {company.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-slate-600 ml-auto" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-slate-400 ml-auto" />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Environmental</span>
                    <span className="font-semibold text-slate-800">
                      {company.environmental}
                    </span>
                  </div>
                  <Progress value={company.environmental} className="h-1.5" />

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Social</span>
                    <span className="font-semibold text-slate-800">{company.social}</span>
                  </div>
                  <Progress value={company.social} className="h-1.5" />

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Governance</span>
                    <span className="font-semibold text-slate-800">{company.governance}</span>
                  </div>
                  <Progress value={company.governance} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Company Analysis */}
          {selectedCompany && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedCompany.name}</h2>
                  <div className="flex items-center space-x-3 mt-3">
                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                      {selectedCompany.ticker}
                    </Badge>
                    <Badge className={`text-white ${getRatingColor(selectedCompany.rating)}`}>
                      ESG Rating: {selectedCompany.rating}
                    </Badge>
                    <span className="text-sm text-slate-600">
                      Market Cap: ${selectedCompany.marketCap}
                    </span>
                    <span className="text-sm text-slate-600">{selectedCompany.sector}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-slate-800">{selectedCompany.esgScore}</div>
                  <div className="text-sm text-slate-600">ESG Score</div>
                </div>
              </div>

              {/* ESG Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200/50">
                  <Leaf className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                  <div className="text-3xl font-bold text-slate-800">{selectedCompany.environmental}</div>
                  <div className="text-sm text-slate-600 font-medium">Environmental</div>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200/50">
                  <Users className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                  <div className="text-3xl font-bold text-slate-800">{selectedCompany.social}</div>
                  <div className="text-sm text-slate-600 font-medium">Social</div>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200/50">
                  <Shield className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                  <div className="text-3xl font-bold text-slate-800">{selectedCompany.governance}</div>
                  <div className="text-sm text-slate-600 font-medium">Governance</div>
                </div>
              </div>

              {/* Key Initiatives */}
              <div className="mb-8">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center text-lg">
                  <Target className="w-5 h-5 mr-2 text-slate-600" />
                  Key ESG Initiatives
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCompany.initiatives.map((initiative, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200/50"
                    >
                      <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      <span className="text-sm text-slate-800">{initiative}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div className="mb-8">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center text-lg">
                  <AlertTriangle className="w-5 h-5 mr-2 text-slate-600" />
                  Key Risk Factors
                </h3>
                <div className="space-y-3">
                  {selectedCompany.risks.map((risk, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200/50"
                    >
                      <AlertTriangle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      <span className="text-sm text-slate-800">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications & Standards */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center text-lg">
                  <Award className="w-5 h-5 mr-2 text-slate-600" />
                  Certifications & Standards
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedCompany.certifications.map((cert, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-slate-300 text-slate-700 bg-white px-4 py-2"
                    >
                      <CheckCircle className="w-3 h-3 mr-2" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-8 pt-6 border-t border-slate-200">
                <Button
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-50 text-slate-700"
                  onClick={() => handleViewFullReport(selectedCompany)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Report
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-50 text-slate-700"
                  onClick={() => handleCompareCompanies(selectedCompany)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {firebaseComparisonList.find((c) => c.ticker === selectedCompany.ticker)
                    ? 'Remove from Comparison'
                    : 'Compare Companies'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ESGAnalyzer;
