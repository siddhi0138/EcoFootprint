
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Newspaper, ExternalLink, Clock, TrendingUp, Search, BookmarkPlus, Share2 } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  publishedAt: string;
  readTime: string;
  trending: boolean;
  url: string;
  saved: boolean;
}

const EcoNewsFeed = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    // Enhanced mock news data with URLs
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'Revolutionary Carbon Capture Technology Deployed in Major Cities',
        summary: 'New atmospheric processors can remove 1000 tons of CO2 daily from urban environments, marking a significant breakthrough in climate technology.',
        category: 'Technology',
        source: 'EcoTech Daily',
        publishedAt: '2 hours ago',
        readTime: '3 min read',
        trending: true,
        url: '#',
        saved: false
      },
      {
        id: '2',
        title: 'Global Renewable Energy Capacity Reaches Historic Milestone',
        summary: 'Renewable energy now accounts for 40% of global electricity generation, surpassing coal for the first time in history.',
        category: 'Energy',
        source: 'Green Energy Report',
        publishedAt: '5 hours ago',
        readTime: '2 min read',
        trending: true,
        url: '#',
        saved: true
      },
      {
        id: '3',
        title: 'Major Corporations Pledge Carbon Neutrality by 2030',
        summary: 'Over 500 Fortune 500 companies have committed to achieving net-zero emissions within the next decade, accelerating corporate climate action.',
        category: 'Business',
        source: 'Sustainability Business',
        publishedAt: '8 hours ago',
        readTime: '4 min read',
        trending: false,
        url: '#',
        saved: false
      },
      {
        id: '4',
        title: 'Breakthrough in Sustainable Packaging Materials',
        summary: 'Scientists develop biodegradable packaging that dissolves in water within 24 hours, potentially revolutionizing e-commerce shipping.',
        category: 'Innovation',
        source: 'Material Science Today',
        publishedAt: '12 hours ago',
        readTime: '3 min read',
        trending: false,
        url: '#',
        saved: false
      },
      {
        id: '5',
        title: 'Ocean Cleanup Project Removes 100,000 Pounds of Plastic',
        summary: 'Latest deployment of ocean cleanup arrays successfully extracts massive amounts of plastic waste from the Pacific Garbage Patch.',
        category: 'Conservation',
        source: 'Ocean Guardian',
        publishedAt: '1 day ago',
        readTime: '2 min read',
        trending: false,
        url: '#',
        saved: true
      },
      {
        id: '6',
        title: 'Solar Panel Efficiency Reaches 30% in Laboratory Tests',
        summary: 'New perovskite-silicon tandem cells achieve record efficiency, bringing us closer to widespread affordable solar adoption.',
        category: 'Technology',
        source: 'Solar Tech Weekly',
        publishedAt: '2 days ago',
        readTime: '4 min read',
        trending: false,
        url: '#',
        saved: false
      }
    ];
    setNews(mockNews);
  }, []);

  const categories = ['all', 'Technology', 'Energy', 'Business', 'Innovation', 'Conservation'];

  const toggleSave = (id: string) => {
    setNews(prev => prev.map(item => 
      item.id === id ? { ...item, saved: !item.saved } : item
    ));
  };

  const shareArticle = (article: NewsItem) => {
    const shareText = `Check out this environmental news: ${article.title}`;
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: shareText,
        url: article.url
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${article.url}`);
    }
  };

  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSaved = !savedOnly || item.saved;
    return matchesCategory && matchesSearch && matchesSaved;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: 'border-blue-300 text-blue-700 bg-blue-50',
      Energy: 'border-yellow-300 text-yellow-700 bg-yellow-50',
      Business: 'border-purple-300 text-purple-700 bg-purple-50',
      Innovation: 'border-green-300 text-green-700 bg-green-50',
      Conservation: 'border-teal-300 text-teal-700 bg-teal-50'
    };
    return colors[category] || 'border-gray-300 text-gray-700 bg-gray-50';
  };

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Newspaper className="h-5 w-5 text-emerald-600" />
          <span>Environmental News</span>
        </CardTitle>
        <p className="text-gray-600 text-sm">
          Stay updated with the latest environmental developments
        </p>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search news articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                    : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  }
                >
                  {category === 'all' ? 'All News' : category}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSavedOnly(!savedOnly)}
              className={savedOnly ? "bg-emerald-50 border-emerald-300" : ""}
            >
              <BookmarkPlus className="h-4 w-4 mr-1" />
              {savedOnly ? 'Show All' : 'Saved Only'}
            </Button>
          </div>
        </div>

        {/* News Items */}
        <div className="space-y-4">
          {filteredNews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No articles found matching your criteria.
            </div>
          ) : (
            filteredNews.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <Badge variant="outline" className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                    {item.trending && (
                      <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    {item.saved && (
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                        Saved
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleSave(item.id)}
                      className={`${item.saved ? 'text-emerald-600' : 'text-gray-400'} hover:text-emerald-700`}
                    >
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => shareArticle(item)}
                      className="text-gray-400 hover:text-emerald-700"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-emerald-600 cursor-pointer">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3">
                  {item.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{item.source}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{item.publishedAt}</span>
                    </div>
                    <span>{item.readTime}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
            Load More News
          </Button>
          <div className="text-sm text-gray-500">
            Showing {filteredNews.length} of {news.length} articles
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EcoNewsFeed;
