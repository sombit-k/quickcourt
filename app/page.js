"use client";

import React from 'react'
import Link from 'next/link'
import { CarouselDemo } from '@/components/carousel'
import { AnimatedTestimonialsDemo } from '@/components/testimonials'
import { VortexDemo } from "@/components/call-to-action";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Users, Clock, Shield, Zap, BarChart3, HeadphonesIcon } from "lucide-react";
const LandingPage = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
        {/* Hero Section with Call to Action */}
        <section className="relative overflow-hidden">
          <VortexDemo />
          
          {/* Enhanced Hero Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center px-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                
                
                <h1 className="text-5xl md:text-7xl font-bold mb-8">
                  <span className="bg-gradient-to-r  from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    Streamline
                  </span>
                  <br />
                  <span className="text-white">Your Support</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-3xl mx-auto">
                  Transform your customer support experience with AI-powered ticketing, 
                  real-time collaboration, and intelligent analytics. Join thousands of teams 
                  delivering exceptional support.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/sign-up">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  
                  <Link href="/home">
                    <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-white text-blue hover:bg-white hover:text-black transition-all duration-300">
                      View Demo
                    </Button>
                  </Link>
                </div>
                
                {/* Trust Indicators */}
                <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">10,000+ Teams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Enterprise Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">24/7 Support</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Why Choose QuickDesk?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built for modern support teams who demand efficiency, scalability, and exceptional user experience.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-8 w-8 text-blue-500" />,
                  title: "Lightning Fast",
                  description: "Resolve tickets 50% faster with AI-powered suggestions and automated workflows.",
                  link: "/features/automation"
                },
                {
                  icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
                  title: "Smart Analytics",
                  description: "Get actionable insights with real-time dashboards and performance metrics.",
                  link: "/features/analytics"
                },
                {
                  icon: <HeadphonesIcon className="h-8 w-8 text-green-500" />,
                  title: "24/7 Support",
                  description: "Round-the-clock support with dedicated success managers for enterprise clients.",
                  link: "/support"
                },
                {
                  icon: <Shield className="h-8 w-8 text-red-500" />,
                  title: "Enterprise Security",
                  description: "Bank-grade security with SOC2 compliance and advanced encryption.",
                  link: "/security"
                },
                {
                  icon: <Users className="h-8 w-8 text-indigo-500" />,
                  title: "Team Collaboration",
                  description: "Seamless collaboration with real-time updates and role-based permissions.",
                  link: "/features/collaboration"
                },
                {
                  icon: <CheckCircle className="h-8 w-8 text-emerald-500" />,
                  title: "99.9% Uptime",
                  description: "Reliable service with guaranteed uptime and automatic failover systems.",
                  link: "/reliability"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, y: -5 }}
                  className="group"
                >
                  <Link href={feature.link}>
                    <Card className="p-8 h-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                      <div className="mb-4 p-3 bg-gray-50 rounded-xl w-fit group-hover:bg-blue-50 transition-colors duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Carousel Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                See QuickDesk in Action
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Discover how leading companies transform their support operations with our powerful platform.
              </p>
            </motion.div>
            
            <CarouselDemo />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-12"
            >
              <Link href="/demo">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                  Request Live Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Testimonials */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <Card className="p-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Trusted by Industry Leaders
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Join thousands of companies who&apos;ve transformed their support operations with QuickDesk.
                </p>
              </motion.div>
              
              <AnimatedTestimonialsDemo />
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center mt-12"
              >
                <Link href="/case-studies">
                  <Button variant="outline" className="px-8 py-3 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
                    View All Case Studies
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </Card>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Transform Your Support?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join over 10,000 teams who&apos;ve revolutionized their customer support with QuickDesk. 
                Start your free trial today - no credit card required.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="border-2 border-white text-gray-700 hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                    Talk to Sales
                  </Button>
                </Link>
              </div>
              
              <p className="mt-6 text-blue-200 text-sm">
                Free 14-day trial • No setup fees • Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}

export default LandingPage