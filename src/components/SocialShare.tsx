
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share, Twitter, Facebook, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  productName: string;
  score: number;
  analysisUrl?: string;
}

const SocialShare = ({ productName, score, analysisUrl = window.location.href }: SocialShareProps) => {
  const { toast } = useToast();

  const shareText = `I just analyzed the environmental impact of ${productName} using EcoAnalyzer AI and got a score of ${score}/100! 🌱 Check out this amazing tool for conscious shopping.`;
  
  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(analysisUrl)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(analysisUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${analysisUrl}`);
      toast({
        title: "Copied to clipboard!",
        description: "Share link copied successfully.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive"
      });
    }
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    return '🌱';
  };

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share className="h-5 w-5 text-emerald-600" />
          <span>Share Your Analysis</span>
        </CardTitle>
        <p className="text-gray-600 text-sm">
          Help others make sustainable choices
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-2xl">{getScoreEmoji(score)}</div>
              <div>
                <h4 className="font-medium text-gray-900">{productName}</h4>
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                  {score}/100 Environmental Score
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              "Just discovered the environmental impact of my purchases with EcoAnalyzer! 
              This AI tool is amazing for conscious shopping. 🌱"
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleTwitterShare}
              className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Twitter className="h-4 w-4" />
              <span>Share on Twitter</span>
            </Button>
            
            <Button 
              onClick={handleFacebookShare}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Facebook className="h-4 w-4" />
              <span>Share on Facebook</span>
            </Button>
            
            <Button 
              onClick={handleCopyLink}
              variant="outline"
              className="flex items-center justify-center space-x-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Copy className="h-4 w-4" />
              <span>Copy Link</span>
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            <CheckCircle className="h-3 w-3 inline mr-1" />
            Sharing helps spread awareness about sustainable consumption
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialShare;
