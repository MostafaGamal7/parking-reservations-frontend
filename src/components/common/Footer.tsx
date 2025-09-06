"use client";

import Link from "next/link";
import { Car, Mail, Phone, MapPin, Clock, ArrowUp } from "lucide-react";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export default function Footer() {
  const { scrollToSection, scrollToTop } = useSmoothScroll();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">WeLink Cargo</h3>
                <p className="text-sm text-gray-400">
                  Parking Management System
                </p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Leading logistics and transportation company providing innovative
              parking solutions for modern cargo operations. Secure, efficient,
              and technology-driven parking management.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-sm">
                  Strategic locations across major logistics hubs
                </span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm">24/7 operations and support</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Access</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/checkpoint"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                >
                  Employee Checkpoint
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                >
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("gates")}
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm text-left"
                >
                  Parking Gates
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">
                  info@welinkcargo.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">+1 (469) 699-5511</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-blue-400 mt-0.5" />
                <span className="text-sm text-gray-300">
                  6275 W Plano Pkwy Suite 500B Plano TX 75093, US
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} WeLink Cargo. All rights reserved.
              Professional parking management solutions.
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex space-x-6 text-sm text-gray-400">
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Support
                </Link>
              </div>
              <button
                onClick={scrollToTop}
                className="ml-6 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title="Back to top"
              >
                <ArrowUp className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
