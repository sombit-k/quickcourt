import React from "react";
import { Heart, Github, Twitter, Mail, Shield, Zap } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-300 py-12 border-t border-slate-700/50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-600/10" />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Support Agent
              </h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              AI-powered support platform for seamless ticket management and instant customer assistance.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Features</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                <Zap className="w-3 h-3" />
                <span>AI-Powered Responses</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                <Shield className="w-3 h-3" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                <Heart className="w-3 h-3" />
                <span>User-Friendly</span>
              </div>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/sombit-k/"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="group w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="mailto:sombitkarmakar018@gmail.com?subject=Hello%20from%20Support%20Agent%20User&body=Hi%20Sombit,%0A%0AI%20found%20your%20Support%20Agent%20platform%20and%20wanted%20to%20reach%20out.%0A%0A"
                className="group w-10 h-10 bg-slate-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>&copy; {currentYear} Support Agent. All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>by</span>
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                super Sombit
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
