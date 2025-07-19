import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Leaf, 
  MessageCircle,
  User,
  Zap,
  Lightbulb,
  Target,
  Recycle,
  Heart,
  TrendingUp
} from 'lucide-react';

const EcoChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm EcoBot, your AI sustainability assistant. I can help you with eco-friendly tips, product recommendations, carbon footprint analysis, and answer any sustainability questions. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    { icon: Lightbulb, text: "How can I reduce my carbon footprint?", category: "tips" },
    { icon: Recycle, text: "What are the best sustainable products?", category: "products" },
    { icon: Target, text: "Set me a sustainability goal", category: "goals" },
    { icon: TrendingUp, text: "Analyze my environmental impact", category: "analysis" }
  ];

  const mockResponses = {
    carbon: "Here are 5 effective ways to reduce your carbon footprint:\n\n🚗 Transportation: Use public transport, bike, or walk when possible\n🏠 Energy: Switch to LED bulbs and unplug devices when not in use\n🥗 Diet: Eat more plant-based meals and buy locally sourced food\n♻️ Waste: Reduce, reuse, and recycle materials\n💧 Water: Take shorter showers and fix leaky faucets\n\nWould you like specific tips for any of these areas?",
    products: "I recommend these top sustainable products:\n\n🧴 Personal Care: Bamboo toothbrushes, solid shampoo bars\n👕 Clothing: Organic cotton, recycled polyester items\n🏠 Home: Energy-efficient appliances, LED lighting\n🍽️ Kitchen: Reusable containers, compostable plates\n🚗 Transport: Electric vehicles, public transit passes\n\nNeed specific brand recommendations for any category?",
    goals: "Let's set you up with achievable sustainability goals:\n\n📊 Beginner Goals:\n• Reduce single-use plastics by 50%\n• Switch to renewable energy\n• Start composting\n\n🎯 Intermediate Goals:\n• Achieve carbon neutrality\n• Buy only sustainable products\n• Reduce waste by 75%\n\n🏆 Advanced Goals:\n• Become carbon negative\n• Zero waste lifestyle\n• Influence 10 others to go green\n\nWhich level interests you?",
    analysis: "Based on average data, here's your estimated environmental impact:\n\n📈 Current Status:\n• Carbon footprint: 12.5 tons CO₂/year\n• Water usage: 2,000 gallons/month\n• Waste generation: 4.5 lbs/day\n\n🌱 Improvement Potential:\n• 40% reduction possible with simple changes\n• Save $1,200/year on utilities\n• Prevent 5 tons CO₂ annually\n\nWant a personalized action plan?"
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = "I understand you're interested in sustainability! Let me help you with that.";
      
      const lowerContent = inputMessage.toLowerCase();
      if (lowerContent.includes('carbon') || lowerContent.includes('footprint') || lowerContent.includes('reduce')) {
        response = mockResponses.carbon;
      } else if (lowerContent.includes('product') || lowerContent.includes('recommend') || lowerContent.includes('buy')) {
        response = mockResponses.products;
      } else if (lowerContent.includes('goal') || lowerContent.includes('challenge') || lowerContent.includes('target')) {
        response = mockResponses.goals;
      } else if (lowerContent.includes('impact') || lowerContent.includes('analyze') || lowerContent.includes('data')) {
        response = mockResponses.analysis;
      }

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question.text);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-900 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-emerald-700 dark:text-emerald-300">
            <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <span>EcoBot Assistant</span>
              <div className="text-sm font-normal text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI-Powered Sustainability Helper</span>
              </div>
            </div>
            <Badge variant="secondary" className="ml-auto bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
              <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-700 rounded-full mr-2 animate-pulse"></div>
              Online
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Chat Messages */}
          <div className="bg-white/80 dark:bg-slate-800 rounded-2xl p-4 mb-6 h-96 overflow-y-auto border border-emerald-100 dark:border-emerald-700">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-sage-500 to-emerald-500' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-sage-100 to-emerald-100 text-sage-800 dark:text-sage-200'
                        : 'bg-white border border-emerald-100 text-gray-800 dark:bg-slate-800 dark:border-emerald-700 dark:text-gray-300 shadow-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <span className="text-xs opacity-60 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-emerald-100 px-4 py-3 rounded-2xl shadow-sm dark:bg-slate-800 dark:border-emerald-700">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Questions */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Quick Questions</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left h-auto py-3 px-4 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900 hover:border-emerald-300"
                  onClick={() => handleQuickQuestion(question)}
                >
                  <question.icon className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-300" />
                  <span className="text-sm dark:text-emerald-300">{question.text}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Ask me anything about sustainability..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 border-emerald-200 dark:border-emerald-700 focus:border-emerald-400 rounded-xl dark:bg-slate-800 dark:text-gray-300"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Features */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3">
              <Leaf className="w-6 h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-sm mb-1 text-emerald-700 dark:text-emerald-300">Eco Tips</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Daily sustainability advice</p>
            </div>
            <div className="text-center p-3">
              <Target className="w-6 h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-sm mb-1 text-emerald-700 dark:text-emerald-300">Goal Setting</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Personalized targets</p>
            </div>
            <div className="text-center p-3">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-sm mb-1 text-emerald-700 dark:text-emerald-300">Impact Analysis</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Track your progress</p>
            </div>
            <div className="text-center p-3">
              <Heart className="w-6 h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-sm mb-1 text-emerald-700 dark:text-emerald-300">Community</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Connect with others</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EcoChatbot;
