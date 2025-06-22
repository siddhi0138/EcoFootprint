
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Building, TrendingUp, TrendingDown, Award, Users, Globe, Search } from 'lucide-react';
import { db } from '../firebase'; // Adjust the path if necessary
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const CompanyProfile = () => {
  const [selectedCompany, setSelectedCompany] = useState('patagonia');
  const [searchQuery, setSearchQuery] = useState('');

  const companies = {
    // NOTE: Use consistent IDs like 'patagonia', 'unilever' that match the keys
    //       This is important for storing and retrieving in Firebase
    patagonia: {
      name: "Patagonia",
      logo: "🏔️",
      industry: "Outdoor Apparel",
      founded: 1973,
      headquarters: "Ventura, CA",
      employees: "3,000+",
      sustainability: {
        overall: 94,
        carbon: 96,
        water: 92,
        waste: 95,
        energy: 93,
        ethics: 97
      },
      trend: "+2",
      initiatives: [
        "1% for the Planet founding member",
        "100% renewable energy in facilities",
        "Fair Trade Certified products",
        "Regenerative agriculture support",
        "Circular economy practices"
      ],
      certifications: ["B Corp", "Fair Trade", "Bluesign", "1% for the Planet"],
      products: 145,
      avgProductScore: 89,
      description: "Leading outdoor clothing company with strong environmental and social mission.",
      recentNews: [
        "Commits to carbon neutrality by 2025",
        "Launches regenerative cotton initiative",
        "Donates $1M to climate action groups"
      ]
    },
    unilever: {
      name: "Unilever",
      logo: "🏭",
      industry: "Consumer Goods",
      founded: 1929,
      headquarters: "London, UK",
      employees: "190,000+",
      sustainability: {
        overall: 76,
        carbon: 74,
        water: 78,
        waste: 75,
        energy: 77,
        ethics: 79
      },
      trend: "-1",
      initiatives: [
        "Sustainable Living Plan",
        "Zero waste to landfill factories",
        "Sustainable sourcing program",
        "Clean water access projects",
        "Gender equality initiatives"
      ],
      certifications: ["Rainforest Alliance", "Fair Trade", "RSPO"],
      products: 2847,
      avgProductScore: 71,
      description: "Global consumer goods company transforming business for sustainability.",
      recentNews: [
        "Reduces plastic packaging by 15%",
        "Expands sustainable sourcing",
        "Invests in clean energy projects"
      ]
    }
  };

  const company = companies[selectedCompany];
  const [following, setFollowing] = useState<string[]>([]); // Initialize as string array

  const { currentUser } = useAuth(); // Get currentUser from useAuth context

  const handleFollowToggle = async () => { // Define the async function
    if (!currentUser) return; // Ensure user is authenticated

    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      if (following.includes(selectedCompany)) {
        // Unfollow
        await updateDoc(userDocRef, {
          following: arrayRemove(selectedCompany)
        });
      } else {
        // Follow
        await updateDoc(userDocRef, {
          following: arrayUnion(selectedCompany)
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) return; // Use currentUser from context

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setFollowing(userData.following || []);
      } else {
        setFollowing([]);
      }
    });

    return () => unsubscribe();
  }, [currentUser]); // Depend on currentUser

  const isFollowing = currentUser && following.includes(selectedCompany); // Check following status

  const performanceData = [
    { month: 'Jan', score: 91 },
    { month: 'Feb', score: 92 },
    { month: 'Mar', score: 93 },
    { month: 'Apr', score: 94 },
    { month: 'May', score: 93 },
    { month: 'Jun', score: 94 }
  ];

  const categoryData = [
    { category: 'Carbon', score: company.sustainability.carbon, color: '#22c55e' },
    { category: 'Water', score: company.sustainability.water, color: '#3b82f6' },
    { category: 'Waste', score: company.sustainability.waste, color: '#f59e0b' },
    { category: 'Energy', score: company.sustainability.energy, color: '#8b5cf6' },
    { category: 'Ethics', score: company.sustainability.ethics, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Search and Company Selection */}
      <Card className="bg-white/60 backdrop-blur-sm border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-600" />
            <span>Company Sustainability Profiles</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button>
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(companies).map(([key, comp]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCompany === key ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedCompany(key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{comp.logo}</span>
                      <div>
                        <h3 className="font-semibold">{comp.name}</h3>
                        <p className="text-sm text-gray-600">{comp.industry}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{comp.sustainability.overall}</div>
                      <div className="flex items-center space-x-1">
                        {comp.trend.startsWith('+') ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                        <span className="text-xs">{comp.trend}</span>
                      </div>
                    </div>
                  </div>
                  <Progress value={comp.sustainability.overall} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Overview */}
        <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm border-green-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{company.logo}</span>
                <div>
                  <CardTitle className="text-2xl">{company.name}</CardTitle>
                  <p className="text-gray-600">{company.industry}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{company.sustainability.overall}</div>
                <Badge className="bg-green-500 text-white">
                  Industry Leader
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Follow Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleFollowToggle}
                disabled={!currentUser} // Disable if not authenticated
                variant={isFollowing ? 'outline' : 'default'}
              >
                {isFollowing ? 'Following' : 'Follow Company'}
              </Button>
            </div>

            {/* Company Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Founded</span>
                <p className="font-medium">{company.founded}</p>
              </div>
              <div>
                <span className="text-gray-500">Headquarters</span>
                <p className="font-medium">{company.headquarters}</p>
              </div>
              <div>
                <span className="text-gray-500">Employees</span>
                <p className="font-medium">{company.employees}</p>
              </div>
              <div>
                <span className="text-gray-500">Products Analyzed</span>
                <p className="font-medium">{company.products}</p>
              </div>
            </div>

            <p className="text-gray-700">{company.description}</p>

            {/* Category Breakdown */}
            <div>
              <h4 className="font-semibold mb-3">Sustainability Breakdown</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Score']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="score" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Certifications */}
            <div>
              <h4 className="font-semibold mb-3">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {company.certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="border-green-200 text-green-700">
                    <Award className="w-3 h-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-white/60 backdrop-blur-sm border-green-100">
            <CardContent className="p-4 flex justify-center">
              {/* This button seems redundant, remove or replace with other info */}
              {/* Keeping the button for now, ensure it uses `currentUser` */}
              {/* <Button
                onClick={handleFollowToggle} // Use the correct handler
                disabled={!user} // Disable if not authenticated
                variant={isFollowing ? 'outline' : 'default'}
              >
                {isFollowing ? 'Following' : 'Follow Company'}
              </Button> */}
            </CardContent> {/* Close CardContent */}
        </Card>
        </div>
        <div className="space-y-6">
          {/* Performance Trend */}
          <Card className="bg-white/60 backdrop-blur-sm border-green-100">
            <CardHeader>
              <CardTitle className="text-lg">Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={performanceData}>
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Score']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Initiatives */}
          <Card className="bg-white/60 backdrop-blur-sm border-green-100">
            <CardHeader>
              <CardTitle className="text-lg">Key Initiatives</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {company.initiatives.map((initiative, index) => (
                  <li key={index} className="text-sm flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>{initiative}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recent News */}
          <Card className="bg-white/60 backdrop-blur-sm border-green-100">
            <CardHeader>
              <CardTitle className="text-lg">Recent News</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {company.recentNews.map((news, index) => (
                  <li key={index} className="text-sm p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    {news}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
