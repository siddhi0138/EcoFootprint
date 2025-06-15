
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  ExternalLink,
  PlayCircle,
  FileText,
  Lightbulb
} from 'lucide-react';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const tutorials = [
    {
      title: 'Getting Started with EcoAnalyzer',
      description: 'Learn the basics of analyzing products and understanding environmental scores',
      duration: '5 min',
      type: 'video',
      difficulty: 'Beginner'
    },
    {
      title: 'Advanced Analysis Features',
      description: 'Discover file upload, barcode scanning, and comparison tools',
      duration: '8 min',
      type: 'video',
      difficulty: 'Intermediate'
    },
    {
      title: 'Understanding Environmental Impact',
      description: 'Deep dive into what makes a product environmentally friendly',
      duration: '12 min',
      type: 'article',
      difficulty: 'Advanced'
    },
    {
      title: 'Building Your Green Profile',
      description: 'Tips for improving your sustainability score and tracking progress',
      duration: '6 min',
      type: 'guide',
      difficulty: 'Beginner'
    }
  ];

  const faqs = [
    {
      question: 'How are environmental scores calculated?',
      answer: 'Our AI analyzes multiple factors including manufacturing processes, materials used, transportation methods, packaging, end-of-life disposal, and company sustainability practices. The score is weighted based on scientific research and environmental impact studies.'
    },
    {
      question: 'Can I analyze products by uploading images?',
      answer: 'Yes! You can upload product images, and our AI will identify the product and provide environmental analysis. The system works best with clear images showing the product and any visible branding or labeling.'
    },
    {
      question: 'How accurate is the barcode scanning feature?',
      answer: 'Our barcode scanner has a 95%+ accuracy rate for identifying products. Once identified, we cross-reference multiple databases to provide comprehensive environmental impact analysis.'
    },
    {
      question: 'What makes a product score high vs low?',
      answer: 'High-scoring products typically use sustainable materials, have minimal packaging, are produced locally, come from environmentally responsible companies, and are designed for longevity. Low scores indicate higher environmental impact.'
    },
    {
      question: 'Can I trust the sustainable alternatives suggested?',
      answer: 'Our alternative suggestions are based on verified environmental certifications, third-party sustainability ratings, and comprehensive impact analysis. We prioritize products with proven environmental benefits.'
    },
    {
      question: 'How often is the environmental data updated?',
      answer: 'We update our database weekly with new product information, company sustainability reports, and the latest environmental research to ensure accuracy and relevance.'
    },
    {
      question: 'Is my analysis history private?',
      answer: 'Yes, all your data is private and secure. We use industry-standard encryption and never share personal analysis data with third parties. You can export or delete your data at any time.'
    },
    {
      question: 'How do I improve my Green Score?',
      answer: 'Your Green Score improves by consistently choosing products with higher environmental ratings, completing eco-challenges, reducing your carbon footprint, and sharing sustainable alternatives with others.'
    }
  ];

  const quickActions = [
    {
      title: 'Start Your First Analysis',
      description: 'Try analyzing a product to see how it works',
      icon: <Search className="h-5 w-5" />,
      action: 'Try Demo'
    },
    {
      title: 'Watch Tutorial Videos',
      description: 'Learn through step-by-step video guides',
      icon: <Video className="h-5 w-5" />,
      action: 'Watch Now'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our sustainability experts',
      icon: <MessageCircle className="h-5 w-5" />,
      action: 'Contact Us'
    },
    {
      title: 'Download Guide',
      description: 'Get our comprehensive sustainability guide',
      icon: <FileText className="h-5 w-5" />,
      action: 'Download'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'border-green-300 text-green-700 bg-green-50';
      case 'Intermediate': return 'border-yellow-300 text-yellow-700 bg-yellow-50';
      case 'Advanced': return 'border-red-300 text-red-700 bg-red-50';
      default: return 'border-gray-300 text-gray-700 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'guide': return <BookOpen className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-6 w-6 text-emerald-600" />
            <span className="text-2xl">Help & Support</span>
          </CardTitle>
          <p className="text-gray-600">
            Everything you need to know about using EcoAnalyzer effectively
          </p>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-emerald-600" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <div key={index} className="p-4 border border-emerald-200 rounded-lg hover:border-emerald-300 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-full">
                    {action.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  {action.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tutorials */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <span>Tutorials & Guides</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {tutorials.map((tutorial, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-emerald-100 rounded-full">
                    {getTypeIcon(tutorial.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{tutorial.title}</h4>
                    <p className="text-sm text-gray-600">{tutorial.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className={getDifficultyColor(tutorial.difficulty)}>
                        {tutorial.difficulty}
                      </Badge>
                      <span className="text-xs text-gray-500">{tutorial.duration}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <PlayCircle className="h-4 w-4" />
                  <span>Start</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            <span>Frequently Asked Questions</span>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {filteredFaqs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No FAQs found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            <span>Still Need Help?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Can't find what you're looking for? Our sustainability experts are here to help!
            </p>
            <div className="flex justify-center space-x-4">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Contact Support
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span>Community Forum</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
