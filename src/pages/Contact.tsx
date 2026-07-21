import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import AnimatedBackground from '../components/AnimatedBackground';
import { Mail, MessageSquare } from 'lucide-react';

const CONTACT_EMAIL = 'support@ecoanalyzer.com';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${name || 'EcoScope visitor'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ''}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 pt-28 pb-16 px-4 overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-gray-100 mb-4">Get in Touch</h1>
          <p className="text-lg text-slate-600 dark:text-gray-300">
            Questions, feedback, or found a bug? Send a message below.
          </p>
        </div>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-emerald-100 dark:border-emerald-800 rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-gray-100">
              <Mail className="w-5 h-5 text-emerald-600" />
              <span>Send a Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What's on your mind?" rows={5} required />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl">
                Open in Email App
              </Button>
              <p className="text-xs text-slate-500 dark:text-gray-400 text-center">
                This opens your email client with the message pre-filled - EcoScope doesn't have a backend
                inbox yet, so nothing is submitted directly from this page.
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-600 dark:text-gray-300 mt-8">
          Or email directly: <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 hover:underline">{CONTACT_EMAIL}</a>
        </p>
      </div>
    </div>
  );
};

export default Contact;
