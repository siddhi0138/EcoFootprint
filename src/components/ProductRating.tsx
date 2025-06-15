
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, MessageSquare, User, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  verified: boolean;
  sustainabilityScore: number;
}

const ProductRating = ({ productName }: { productName: string }) => {
  const [userRating, setUserRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const { toast } = useToast();

  const reviews: Review[] = [
    {
      id: '1',
      userName: 'EcoWarrior2024',
      userAvatar: '🌱',
      rating: 5,
      title: 'Excellent sustainability practices!',
      content: 'This company really walks the talk when it comes to environmental responsibility. Their packaging is 100% recyclable and they have transparent supply chain reporting.',
      date: '2024-01-15',
      helpful: 23,
      verified: true,
      sustainabilityScore: 92
    },
    {
      id: '2',
      userName: 'GreenConsumer',
      userAvatar: '♻️',
      rating: 4,
      title: 'Good product, room for improvement',
      content: 'The product quality is great and I appreciate their carbon-neutral shipping. However, I wish they would switch to more sustainable materials for the product itself.',
      date: '2024-01-12',
      helpful: 18,
      verified: true,
      sustainabilityScore: 78
    },
    {
      id: '3',
      userName: 'ClimateConscious',
      userAvatar: '🌍',
      rating: 3,
      title: 'Mixed feelings about environmental impact',
      content: 'While the company claims to be eco-friendly, I found some concerning information about their manufacturing processes. More transparency would be appreciated.',
      date: '2024-01-10',
      helpful: 12,
      verified: false,
      sustainabilityScore: 65
    }
  ];

  const submitReview = () => {
    if (userRating === 0 || !reviewTitle.trim() || !reviewContent.trim()) {
      toast({
        title: "Incomplete review",
        description: "Please provide a rating, title, and detailed review.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Review submitted!",
      description: "Thank you for contributing to our sustainability community.",
    });

    // Reset form
    setUserRating(0);
    setReviewTitle('');
    setReviewContent('');
    setShowWriteReview(false);
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const averageSustainabilityScore = reviews.reduce((sum, review) => sum + review.sustainabilityScore, 0) / reviews.length;

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-emerald-600" />
          <span>Community Reviews</span>
        </CardTitle>
        <p className="text-gray-600 text-sm">
          See what the sustainability community thinks about {productName}
        </p>
      </CardHeader>
      <CardContent>
        {/* Rating Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {averageRating.toFixed(1)}
            </div>
            <div className="mb-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-sm text-gray-600">
              Based on {reviews.length} reviews
            </p>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-3xl font-bold text-emerald-600 mb-1">
              {Math.round(averageSustainabilityScore)}
            </div>
            <p className="text-sm text-emerald-700 font-medium">
              Community Sustainability Score
            </p>
            <p className="text-xs text-emerald-600">
              Average from verified reviews
            </p>
          </div>
        </div>

        {/* Write Review Button */}
        <div className="mb-6">
          {!showWriteReview ? (
            <Button 
              onClick={() => setShowWriteReview(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Write a Review
            </Button>
          ) : (
            <div className="border border-emerald-200 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-900">Share Your Experience</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                {renderStars(userRating, true, setUserRating)}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Review
                </label>
                <Textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Share details about the product's environmental impact, packaging, company practices, etc."
                  rows={4}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={submitReview} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Submit Review
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowWriteReview(false)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Recent Reviews</h3>
          
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{review.userAvatar}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{review.userName}</span>
                      {review.verified && (
                        <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                  Eco Score: {review.sustainabilityScore}
                </Badge>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
              <p className="text-gray-600 text-sm mb-3">{review.content}</p>
              
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-emerald-600">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful ({review.helpful})
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductRating;
