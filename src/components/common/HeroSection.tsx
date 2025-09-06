"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Car, Clock, Shield } from "lucide-react";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export default function HeroSection() {
  const { scrollToSection } = useSmoothScroll();
  return (
    <section
      style={{ height: `calc(100dvh - 64px)` }}
      className="relative flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg-placeholder.svg"
          alt="WeLink Cargo Parking System Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Background pattern overlay */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Company Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 backdrop-blur-sm border border-blue-400/30 text-blue-100 text-sm font-medium mb-8">
            <Car className="h-4 w-4 mr-2" />
            WeLink Cargo Parking Solutions
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Smart Parking
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">
              Management System
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Streamline your parking operations with our advanced reservation
            system. Efficient, secure, and user-friendly parking management for
            modern logistics.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 text-blue-100">
              <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">24/7 Access</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-blue-100">
              <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Secure & Reliable</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-blue-100">
              <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Real-time Updates</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection("gates")}
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Access Parking Gates
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <Link
              href="/checkpoint"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/30 backdrop-blur-sm transition-all duration-300"
            >
              Employee Checkpoint
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
