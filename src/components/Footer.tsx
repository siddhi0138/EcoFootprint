import React from "react";

const Footer = () => {
  return (
    <footer className="bg-green-950 text-gray-300 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">EcoAnalyzer</h2>
          <p className="text-sm leading-relaxed text-gray-300">
            Empowering sustainability through AI. Track, analyze, and reduce your environmental impact effortlessly.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-green-400 transition">Home</a></li>
            <li><a href="#" className="hover:text-green-400 transition">About</a></li>
            <li><a href="#" className="hover:text-green-400 transition">Contact</a></li>
            <li><a href="#" className="hover:text-green-400 transition">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Get in Touch</h3>
          <p className="text-sm text-gray-300">
            Email: <a href="mailto:support@ecoanalyzer.com" className="hover:text-green-400">support@ecoanalyzer.com</a>
          </p>
          <p className="text-sm text-gray-300">Phone: +91 98765 43210</p>
          <p className="text-sm text-gray-300">Address: Mumbai, India</p>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Stay Connected</h3>
          <div className="flex space-x-4 mb-4">
            {/* Facebook */}
            <a href="#" className="text-gray-400 hover:text-green-400 transition" aria-label="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2V12h2.5l-.4 3h-2.1v7A10 10 0 0022 12z" />
              </svg>
            </a>
            {/* Twitter */}
            <a href="#" className="text-gray-400 hover:text-green-400 transition" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016 3a4.48 4.48 0 00-4.47 4.48c0 .35.04.7.11 1.03A12.8 12.8 0 013 4.2a4.48 4.48 0 001.39 5.98A4.41 4.41 0 012 9.72v.05A4.48 4.48 0 004.48 14a4.52 4.52 0 01-2.02.08A4.48 4.48 0 006.29 17a9 9 0 01-5.56 1.92A9.12 9.12 0 010 18.88a12.8 12.8 0 006.95 2.03c8.34 0 12.9-6.91 12.9-12.9 0-.2 0-.41-.02-.61A9.2 9.2 0 0023 3z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="text-gray-400 hover:text-green-400 transition" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.75 2A5.76 5.76 0 002 7.75v8.5A5.76 5.76 0 007.75 22h8.5A5.76 5.76 0 0022 16.25v-8.5A5.76 5.76 0 0016.25 2h-8.5zm8.5 1.5A4.25 4.25 0 0120.5 7.75v8.5a4.25 4.25 0 01-4.25 4.25h-8.5A4.25 4.25 0 013.5 16.25v-8.5A4.25 4.25 0 017.75 3.5h8.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 1.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm4.75-2a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </a>
          </div>
          <p className="text-sm text-gray-300">Follow us for updates & eco tips!</p>
        </div>
      </div>

      <div className="mt-10 border-t border-green-900 pt-6 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} EcoAnalyzer. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
