import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
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
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Mic,
  MicOff,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  where,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { streamChatMessage, type ChatHistoryMessage } from '../services/chatApi';

const DEFAULT_GREETING = {
  id: 1,
  type: 'bot',
  content: "Hi! I'm EcoBot, your AI sustainability assistant. I can help you with eco-friendly tips, product recommendations, carbon footprint analysis, and answer any sustainability questions. How can I help you today?",
  timestamp: new Date()
};

// Renders bot/user message text with markdown (bold, lists, headings, links, code) instead of
// raw asterisks/hashes - LLM replies are markdown-formatted but were being shown as plain text.
const ChatMessageMarkdown: React.FC<{ content: string }> = ({ content }) => (
  <div className="text-sm chat-markdown [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
    <ReactMarkdown
      components={{
        p: ({ ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
        strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
        ul: ({ ...props }) => <ul className="mb-2 ml-4 list-disc space-y-1" {...props} />,
        ol: ({ ...props }) => <ol className="mb-2 ml-4 list-decimal space-y-1" {...props} />,
        li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
        h1: ({ ...props }) => <h1 className="mb-2 mt-2 text-base font-bold" {...props} />,
        h2: ({ ...props }) => <h2 className="mb-2 mt-2 text-sm font-bold" {...props} />,
        h3: ({ ...props }) => <h3 className="mb-1 mt-2 text-sm font-semibold" {...props} />,
        code: ({ ...props }) => (
          <code className="rounded bg-black/10 dark:bg-white/10 px-1 py-0.5 text-xs" {...props} />
        ),
        a: ({ ...props }) => (
          <a className="underline text-emerald-700 dark:text-emerald-400" target="_blank" rel="noopener noreferrer" {...props} />
        ),
        blockquote: ({ ...props }) => (
          <blockquote className="border-l-2 border-emerald-400 pl-2 italic opacity-90" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

const EcoChatbot = () => {
  const { currentUser } = useAuth();
  const { scannedProducts, userStats } = useUserData();
  const [messages, setMessages] = useState([DEFAULT_GREETING]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, 'up' | 'down'>>({});
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load persisted chat history for this user (memory across sessions, until "New Chat" is clicked).
  // A chatMeta/currentSession doc marks where the active conversation begins - messages from before
  // that marker stay in Firestore (not deleted) but are excluded from the loaded thread. Users with
  // no marker yet (pre-existing accounts) fall back to loading their full history, same as before.
  useEffect(() => {
    if (!currentUser) return;
    const loadHistory = async () => {
      try {
        const messagesRef = collection(db, 'users', currentUser.uid, 'chatMessages');
        const sessionRef = doc(db, 'users', currentUser.uid, 'chatMeta', 'currentSession');
        const sessionSnap = await getDoc(sessionRef);
        const sessionStart = sessionSnap.exists() ? sessionSnap.data()?.startedAt : undefined;

        const q = sessionStart
          ? query(messagesRef, where('timestamp', '>=', sessionStart), orderBy('timestamp', 'asc'))
          : query(messagesRef, orderBy('timestamp', 'asc'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return;
        const loaded = snapshot.docs.map((docSnap, index) => {
          const data = docSnap.data();
          const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
          return {
            id: index + 2,
            type: data.type,
            content: data.content,
            timestamp,
          };
        });
        setMessages([DEFAULT_GREETING, ...loaded]);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    loadHistory();
  }, [currentUser]);

  const persistMessage = async (type: 'user' | 'bot', content: string) => {
    if (!currentUser) return;
    try {
      const messagesRef = collection(db, 'users', currentUser.uid, 'chatMessages');
      await addDoc(messagesRef, { type, content, timestamp: serverTimestamp() });
    } catch (err) {
      console.error('Failed to persist chat message:', err);
    }
  };

  const handleNewChat = async () => {
    setMessages([DEFAULT_GREETING]);
    if (!currentUser) return;
    try {
      const sessionRef = doc(db, 'users', currentUser.uid, 'chatMeta', 'currentSession');
      await setDoc(sessionRef, { startedAt: serverTimestamp() });
    } catch (err) {
      console.error('Failed to start new chat session:', err);
    }
  };

  const handleDeleteHistory = async () => {
    if (!window.confirm('Delete your entire chat history? This cannot be undone.')) return;
    setMessages([DEFAULT_GREETING]);
    if (!currentUser) return;
    try {
      const messagesRef = collection(db, 'users', currentUser.uid, 'chatMessages');
      const snapshot = await getDocs(messagesRef);
      await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)));
      const sessionRef = doc(db, 'users', currentUser.uid, 'chatMeta', 'currentSession');
      await setDoc(sessionRef, { startedAt: serverTimestamp() });
    } catch (err) {
      console.error('Failed to delete chat history:', err);
    }
  };

  // Real browser speech-to-text (Web Speech API) - no mocked transcript. Chrome/Edge support
  // this; browsers without it (e.g. Firefox) get an honestly-disabled mic button, not a fake one.
  useEffect(() => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setVoiceSupported(false);
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputMessage('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleFeedback = async (messageId: number, messageContent: string, feedback: 'up' | 'down') => {
    setFeedbackGiven(prev => ({ ...prev, [messageId]: feedback }));
    if (!currentUser) return;
    const feedbackRef = collection(db, 'users', currentUser.uid, 'chatFeedback');
    try {
      await addDoc(feedbackRef, { messageContent, feedback, timestamp: serverTimestamp() });
    } catch (err) {
      console.error('Failed to save feedback:', err);
    }
  };

  const quickQuestions = [
    { icon: Lightbulb, text: "How can I reduce my carbon footprint?", category: "tips" },
    { icon: Recycle, text: "What are the best sustainable products?", category: "products" },
    { icon: Target, text: "Set me a sustainability goal", category: "goals" },
    { icon: TrendingUp, text: "Analyze my environmental impact", category: "analysis" }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const outgoingText = inputMessage;
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    persistMessage('user', outgoingText);

    const botMessageId = messages.length + 2;
    let streamedContent = '';

    try {
      const history: ChatHistoryMessage[] = messages.slice(-6).map(m => ({
        role: m.type === 'user' ? 'user' : 'bot',
        content: m.content,
      }));
      const userProfile = userStats.totalScans > 0 ? {
        totalScans: userStats.totalScans,
        avgSustainabilityScore: userStats.avgScore,
        recentCategories: scannedProducts.slice(0, 5).map(p => p.category).filter(Boolean),
      } : undefined;

      await streamChatMessage(outgoingText, history, userProfile, {
        onToken: (token) => {
          if (!streamedContent) {
            // First token arrived: replace the typing indicator with a live message bubble.
            setIsTyping(false);
            setMessages(prev => [...prev, { id: botMessageId, type: 'bot', content: '', timestamp: new Date() }]);
          }
          streamedContent += token;
          setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, content: streamedContent } : m));
        },
        onDone: () => {
          if (streamedContent) {
            persistMessage('bot', streamedContent);
          }
        },
        onError: (message) => {
          setIsTyping(false);
          const errorText = `Sorry, something went wrong talking to the AI: ${message}`;
          setMessages(prev => {
            const alreadyStarted = prev.some(m => m.id === botMessageId);
            if (alreadyStarted) {
              return prev.map(m => m.id === botMessageId ? { ...m, content: errorText } : m);
            }
            return [...prev, { id: botMessageId, type: 'bot', content: errorText, timestamp: new Date() }];
          });
        },
      }, currentUser?.uid);
    } catch (err) {
      console.error('Chat request failed:', err);
      const errorMessage = {
        id: botMessageId,
        type: 'bot',
        content: "Sorry, I couldn't reach my AI backend just now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question.text);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-slate-200 shadow-lg rounded-2xl dark:bg-slate-900 dark:border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
            <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-600 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">EcoBot Assistant</span>
              <div className="text-sm font-normal text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI-Powered Sustainability Helper</span>
              </div>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <Badge variant="outline" className="border-slate-300 text-slate-700 bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800">
                <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                Online
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                New Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteHistory}
                className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Delete chat history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
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
                        : 'bg-white border border-emerald-100 text-slate-800 dark:bg-slate-800 dark:border-emerald-700 dark:text-slate-300 shadow-sm'
                    }`}>
                      <ChatMessageMarkdown content={message.content} />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-60">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.type === 'bot' && message.id !== 1 && message.content && (
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={() => handleFeedback(message.id, message.content, 'up')}
                              className={`p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-800 ${feedbackGiven[message.id] === 'up' ? 'text-emerald-600' : 'text-slate-400'}`}
                              aria-label="Good response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, message.content, 'down')}
                              className={`p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 ${feedbackGiven[message.id] === 'down' ? 'text-red-500' : 'text-slate-400'}`}
                              aria-label="Bad response"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
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
              placeholder={isListening ? 'Listening...' : 'Ask me anything about sustainability...'}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 border-emerald-200 dark:border-emerald-700 focus:border-emerald-400 rounded-xl dark:bg-slate-800 dark:text-slate-300"
            />
            {voiceSupported && (
              <Button
                type="button"
                variant="outline"
                onClick={toggleVoiceInput}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                className={`rounded-xl px-3 ${isListening ? 'bg-red-50 border-red-300 text-red-600 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400 animate-pulse' : 'border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
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
              <p className="text-xs text-slate-600 dark:text-slate-400">Daily sustainability advice</p>
            </div>
            <div className="text-center p-3">
              <Target className="w-6 h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-sm mb-1 text-emerald-700 dark:text-emerald-300">Goal Setting</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Personalized targets</p>
            </div>
            <div className="text-center p-3">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-sm mb-1 text-emerald-700 dark:text-emerald-300">Impact Analysis</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Track your progress</p>
            </div>
            <div className="text-center p-3">
              <Heart className="w-6 h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-sm mb-1 text-emerald-700 dark:text-emerald-300">Community</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Connect with others</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EcoChatbot;
