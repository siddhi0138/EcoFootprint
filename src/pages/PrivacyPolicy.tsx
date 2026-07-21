import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import AnimatedBackground from '../components/AnimatedBackground';
import { ShieldCheck } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-3">{title}</h2>
    <div className="text-slate-600 dark:text-gray-300 leading-relaxed space-y-3">{children}</div>
  </div>
);

const PrivacyPolicy = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 pt-28 pb-16 px-4 overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-gray-100 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-emerald-100 dark:border-emerald-800 rounded-3xl shadow-lg">
          <CardContent className="p-8">
            <Section title="What we collect">
              <p>When you create an account, we collect your email address via Firebase Authentication. As you use the app, we store:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Products you scan (barcode, name, and the AI-generated sustainability analysis)</li>
                <li>Carbon tracking entries you log or generate with the AI estimator</li>
                <li>Your conversations with EcoBot, so it can remember context across sessions</li>
                <li>Thumbs up/down feedback you give on chatbot responses</li>
                <li>Notes EcoBot is explicitly asked to remember about your preferences (e.g. "I prefer vegan products")</li>
                <li>Products you add to comparison lists</li>
              </ul>
            </Section>

            <Section title="Photos you upload">
              <p>
                If you upload a photo for AI-based item identification, that image is sent to our AI provider
                for analysis and is not permanently stored by EcoScope after the request completes.
              </p>
            </Section>

            <Section title="Google Calendar access">
              <p>
                If you click "Add to Calendar" on a webinar in the Education Center, we ask for permission to
                create a single event in your Google Calendar (the <code>calendar.events</code> scope). We only
                ever create the specific event you asked to add - we never read, list, or browse your existing
                calendar, and we don't request access until you actually click that button. You can revoke this
                permission at any time at <a href="https://myaccount.google.com/permissions" className="text-emerald-700 dark:text-emerald-400 underline" target="_blank" rel="noreferrer">myaccount.google.com/permissions</a>.
              </p>
            </Section>

            <Section title="Emails we send">
              <p>
                We use the email address on your account to send you things you explicitly request: order
                receipts and course completion certificates (both also available as an in-app PDF download). We
                don't send marketing email, and we don't share your email address with any third party for
                their own use.
              </p>
            </Section>

            <Section title="Third parties we rely on">
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>OpenFoodFacts</strong> - an open, public product database we query by barcode/name. No personal data is sent to them.</li>
                <li><strong>OpenRouter / Google Gemini</strong> (AI model providers) - receive the text/images you send to EcoBot or the scanner to generate a response. Treat anything you type or upload as visible to these providers.</li>
                <li><strong>Firebase (Google)</strong> - handles authentication and stores your account data in Firestore.</li>
                <li><strong>Google Calendar API</strong> - used only when you click "Add to Calendar," as described above.</li>
                <li><strong>Gmail API / Resend</strong> - deliver the transactional emails described above; they see the email content and your address, nothing else.</li>
              </ul>
            </Section>

            <Section title="How we use it">
              <p>
                Your scan history and carbon entries power the personalized recommendations and insights features.
                Your chat history gives EcoBot memory across sessions. We don't sell your data, and there are no
                ads or third-party trackers in this app.
              </p>
            </Section>

            <Section title="Your data, your control">
              <p>
                You can stop using the app and its AI features at any time by not sending new requests. A
                self-service "delete my account and data" flow isn't built yet - if you'd like your data removed,
                reach out via the Contact page and we'll handle it manually.
              </p>
            </Section>

            <Section title="Children's privacy">
              <p>EcoScope isn't directed at children under 13, and we don't knowingly collect data from them.</p>
            </Section>

            <Section title="Changes to this policy">
              <p>
                This is a small, actively developed project - this policy may change as features change. Material
                changes will be reflected here with an updated date.
              </p>
            </Section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
