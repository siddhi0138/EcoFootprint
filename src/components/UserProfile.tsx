
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Leaf, Database, Award, LogOut } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const UserProfile = () => {
  const { user, logout } = useUser();

  if (!user) return null;

  const getGreenScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 rounded-full">
                <User className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">{user.name}</CardTitle>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-emerald-600" />
              <span>Green Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold rounded-lg py-2 px-4 text-center ${getGreenScoreColor(user.greenScore)}`}>
              {user.greenScore}/100
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Based on your choices and contributions
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-emerald-600" />
              <span>Analyses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 text-center">
              {user.analysisCount}
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Products analyzed
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-emerald-600" />
              <span>Contributions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 text-center">
              {user.contributedData}
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Data points contributed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.analysisCount >= 10 && (
              <Badge className="bg-emerald-100 text-emerald-700">
                🔍 Analyzer - 10+ products analyzed
              </Badge>
            )}
            {user.contributedData >= 5 && (
              <Badge className="bg-blue-100 text-blue-700">
                🤝 Contributor - 5+ data contributions
              </Badge>
            )}
            {user.greenScore >= 70 && (
              <Badge className="bg-green-100 text-green-700">
                🌱 Eco Champion - 70+ green score
              </Badge>
            )}
            {user.analysisCount >= 50 && (
              <Badge className="bg-purple-100 text-purple-700">
                🏆 Expert - 50+ analyses
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
