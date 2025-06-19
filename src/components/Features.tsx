
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Scan, 
  Brain, 
  BarChart3, 
  Users, 
  Globe, 
  Camera, 
  FileText, 
  Upload,
  Zap,
  Shield,
  Award,
  TrendingUp,
  TreePine,
  Droplet,
  Wind,
  Sun
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Nature Intelligence',
      description: 'Advanced machine learning models analyze products through the lens of natural ecosystems with 98% accuracy.',
      badge: 'Core Feature',
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      icon: Scan,
      title: 'Multi-Input Harmony',
      description: 'Scan barcodes, upload images, take photos, or describe products naturally. Our AI understands it all like nature intended.',
      badge: 'Smart Tech',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      icon: BarChart3,
      title: 'Ecosystem Impact Score',
      description: 'Comprehensive scoring for carbon footprint, water usage, biodiversity impact, energy efficiency, and ethical sourcing.',
      badge: 'Comprehensive',
      gradient: 'from-teal-500 to-blue-500'
    },
    {
      icon: Users,
      title: 'Green Community',
      description: 'Join a global forest of conscious consumers. Share insights, nurture knowledge, and grow together sustainably.',
      badge: 'Social Impact',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Globe,
      title: 'Earth\'s Database',
      description: 'Access sustainability data from major environmental databases and nature-centered lifecycle assessments.',
      badge: 'Data Rich',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Growth Tracking',
      description: 'Track your environmental impact like a growing tree with detailed analytics and personalized eco-recommendations.',
      badge: 'Personal Growth',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  const scanMethods = [
    {
      icon: Camera,
      title: 'Vision Capture',
      description: 'Take a photo like capturing nature\'s moment'
    },
    {
      icon: Scan,
      title: 'Instant Recognition',
      description: 'Barcode scanning as swift as a leaf falling'
    },
    {
      icon: Upload,
      title: 'Memory Upload',
      description: 'Share existing images from your digital garden'
    },
    {
      icon: FileText,
      title: 'Natural Language',
      description: 'Describe products as you would to a friend'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-sage-50 via-emerald-50 to-green-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Nature Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <TreePine className="absolute top-20 left-10 w-32 h-32 text-emerald-600 animate-pulse" />
        <Droplet className="absolute top-40 right-20 w-24 h-24 text-blue-600 animate-bounce" style={{ animationDelay: '1s' }} />
        <Wind className="absolute bottom-40 left-1/4 w-28 h-28 text-teal-600 animate-pulse" style={{ animationDelay: '2s' }} />
        <Sun className="absolute bottom-20 right-1/3 w-36 h-36 text-amber-500 animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Features */}
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 dark:bg-gradient-to-r dark:from-emerald-700 dark:to-green-700 dark:text-emerald-200 border-emerald-200 px-6 py-2 text-lg">
            🌱 Powerful Features
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-slate-800 dark:text-slate-200">
            Everything You Need for
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent block mt-2">
              Harmonious Living
            </span>
          </h2>
          <p className="text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed font-light">
            Our comprehensive platform combines cutting-edge AI with earth's wisdom 
            to give you unprecedented insights into product sustainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                <Badge variant="outline" className="text-xs bg-white/70 dark:bg-gray-700/70 border-emerald-200 text-emerald-700 dark:text-emerald-300">
                  {feature.badge}
                </Badge>
              </div>
              <CardTitle className="text-2xl group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-300">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                {feature.description}
              </p>
            </CardContent>
          </Card>
          ))}
        </div>

        {/* Scan Methods with Nature Theme */}
        <div className="bg-gradient-to-r from-emerald-100/80 to-green-100/80 backdrop-blur-sm rounded-3xl p-16 border border-emerald-200">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6 text-slate-800 dark:text-slate-200">
              Multiple Paths to Wisdom
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Like nature's diverse pathways, our AI understands products from any input method. 
              Choose the path that feels most natural to you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {scanMethods.map((method, index) => (
              <div key={index} className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 group border border-white/50">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <method.icon className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-bold text-xl mb-3 text-slate-800">
                  {method.title}
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {method.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Capabilities with Nature Elements */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-emerald-100 dark:from-purple-700 dark:to-emerald-700 text-purple-800 dark:text-purple-200 border-purple-200 px-6 py-2 text-lg">
              🧠 AI Intelligence
            </Badge>
            <h3 className="text-4xl font-bold mb-6 text-slate-800 dark:text-slate-200">
              Nature-Inspired AI Capabilities
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-10 bg-gradient-to-br from-purple-50 to-emerald-50 dark:from-purple-900 dark:to-emerald-900 rounded-3xl border border-purple-100 dark:border-purple-700">
              <Brain className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-6" />
              <h4 className="font-bold text-2xl mb-4 text-slate-800 dark:text-slate-200">Neural Vision</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">Extract and interpret information from images using neural networks inspired by natural vision systems.</p>
            </div>

            <div className="text-center p-10 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900 dark:to-teal-900 rounded-3xl border border-blue-100 dark:border-blue-700">
              <Shield className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
              <h4 className="font-bold text-2xl mb-4 text-slate-800 dark:text-slate-200">Trust Indicators</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">Transparent confidence estimates and uncertainty measurements, honest like nature itself.</p>
            </div>

            <div className="text-center p-10 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900 dark:to-green-900 rounded-3xl border border-emerald-100 dark:border-emerald-700">
              <Award className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-6" />
              <h4 className="font-bold text-2xl mb-4 text-slate-800 dark:text-slate-200">Cross-Pollination</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">Validate findings across multiple sustainability databases and certification ecosystems.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
