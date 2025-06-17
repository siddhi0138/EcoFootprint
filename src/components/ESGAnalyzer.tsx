
import React, { useState } from 'react';
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
  Target
} from 'lucide-react';

const ESGAnalyzer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const companies = [
    {
      name: "Microsoft Corporation",
      ticker: "MSFT",
      esgScore: 91,
      environmental: 88,
      social: 92,
      governance: 93,
      rating: "AAA",
      trend: "up",
      marketCap: "2.8T",
      initiatives: [
        "Carbon negative by 2030",
        "100% renewable energy",
        "Inclusive hiring practices",
        "AI for Good programs"
      ],
      risks: ["Data privacy concerns", "Regulatory scrutiny"],
      certifications: ["B-Corp", "UN Global Compact", "CDP A-List"]
    },
    {
      name: "Tesla, Inc.",
      ticker: "TSLA", 
      esgScore: 85,
      environmental: 95,
      social: 78,
      governance: 82,
      rating: "AA",
      trend: "up",
      marketCap: "800B",
      initiatives: [
        "Accelerating sustainable transport",
        "Solar energy solutions",
        "Battery recycling program",
        "Gigafactory renewable energy"
      ],
      risks: ["Labor disputes", "CEO governance concerns"],
      certifications: ["ISO 14001", "LEED Certified Facilities"]
    },
    {
      name: "ExxonMobil Corporation",
      ticker: "XOM",
      esgScore: 42,
      environmental: 35,
      social: 48,
      governance: 44,
      rating: "C",
      trend: "down",
      marketCap: "450B",
      initiatives: [
        "Low-carbon solutions research",
        "Methane reduction targets",
        "Community investment programs"
      ],
      risks: ["Climate litigation", "Stranded assets", "Regulatory pressure"],
      certifications: ["API Environmental Excellence"]
    }
  ];

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getRatingColor = (rating) => {
    if (rating.startsWith('A')) return "bg-green-500";
    if (rating.startsWith('B')) return "bg-blue-500";
    if (rating.startsWith('C')) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-700">
            <Building2 className="w-6 h-6" />
            <span>Corporate ESG Analyzer</span>
            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700">
              Professional Grade
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex space-x-2 mb-6">
            <Input
              placeholder="Search companies by name or ticker symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-blue-200 focus:border-blue-400"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4 mr-2" />
              Analyze
            </Button>
          </div>

          {/* Company List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {companies.map((company, index) => (
              <div 
                key={index} 
                className="bg-white/80 rounded-xl p-4 border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCompanySelect(company)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{company.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">{company.ticker}</Badge>
                      <Badge className={`text-xs text-white ${getRatingColor(company.rating)}`}>
                        {company.rating}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(company.esgScore).split(' ')[0]}`}>
                      {company.esgScore}
                    </div>
                    {company.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 ml-auto" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 ml-auto" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Environmental</span>
                    <span className="font-medium">{company.environmental}</span>
                  </div>
                  <Progress value={company.environmental} className="h-1" />
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Social</span>
                    <span className="font-medium">{company.social}</span>
                  </div>
                  <Progress value={company.social} className="h-1" />
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Governance</span>
                    <span className="font-medium">{company.governance}</span>
                  </div>
                  <Progress value={company.governance} className="h-1" />
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Analysis */}
          {selectedCompany && (
            <div className="bg-white/90 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedCompany.name}</h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline">{selectedCompany.ticker}</Badge>
                    <Badge className={`text-white ${getRatingColor(selectedCompany.rating)}`}>
                      ESG Rating: {selectedCompany.rating}
                    </Badge>
                    <span className="text-sm text-gray-600">Market Cap: ${selectedCompany.marketCap}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{selectedCompany.esgScore}</div>
                  <div className="text-sm text-gray-600">ESG Score</div>
                </div>
              </div>

              {/* ESG Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Leaf className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-700">{selectedCompany.environmental}</div>
                  <div className="text-sm text-green-600">Environmental</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-700">{selectedCompany.social}</div>
                  <div className="text-sm text-blue-600">Social</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-700">{selectedCompany.governance}</div>
                  <div className="text-sm text-purple-600">Governance</div>
                </div>
              </div>

              {/* Key Initiatives */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Key ESG Initiatives
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedCompany.initiatives.map((initiative, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800">{initiative}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
                  Risk Factors
                </h3>
                <div className="space-y-2">
                  {selectedCompany.risks.map((risk, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-amber-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-amber-800">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-blue-600" />
                  Certifications & Memberships
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="border-blue-200 text-blue-700">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ESGAnalyzer;
