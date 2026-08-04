import React, { useState, useEffect } from "react";
import { Menu, ShoppingBag, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { SPLASH_CONFIG } from "../constants";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const utilityLinks = [
    { name: 'LA BOUTIQUE', icon: ShoppingBag, path: '/shop' },
    { name: 'TICKETS', icon: Ticket, path: '/tickets' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 `}>
      {/* Top Utility Bar */}
      <div className="bg-navy-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-7">
            {/* Left Utility Links */}
            <div className="hidden md:flex items-center gap-6 text-xs font-medium">
              {utilityLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center gap-1.5 text-gray-300 hover:text-gold-400 transition-colors duration-200"
                >
                  <link.icon size={14} />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Side - Tagline */}
            <div className="hidden md:flex items-center">
              <span className="text-xs font-medium">
                <span className="text-gray-400">DEMA USTA</span>
              </span>
            </div>

            {/* Mobile - Contact */}
            <div className="md:hidden text-xs text-gray-400">
              <Link to="/shop">LA BOUTIQUE</Link>
            </div>

            <div className="text-xs">
              <Link to="/contact" className="text-gray-300 hover:text-gold-400 transition-colors cursor-pointer">
                NOUS CONTACTER
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex items-center border border-slate-700 bg-navy-900 backdrop-blur-md px-6 py-4 rounded-full text-white text-sm w-[80%] mx-auto mt-2 mb-2">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <img
              id={SPLASH_CONFIG.NAVBAR_LOGO_ID}
              src="/Assets/logo.png"
              alt="USAT FC Logo"
              className="w-8 h-8 object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-lg"
            />
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-base">USAT FC</div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-10 ml-10 font-bold">
          <Link
            to="/matches"
            className="relative overflow-hidden h-6 group"
          >
            <span className="block group-hover:-translate-y-full transition-transform duration-300">
              Fixtures
            </span>
            <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300">
              Fixtures
            </span>
          </Link>
          <Link
            to="/news"
            className="relative overflow-hidden h-6 group"
          >
            <span className="block group-hover:-translate-y-full transition-transform duration-300">
              News
            </span>
            <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300">
              News
            </span>
          </Link>
          <Link
            to="/players"
            className="relative overflow-hidden h-6 group"
          >
            <span className="block group-hover:-translate-y-full transition-transform duration-300">
              Players
            </span>
            <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300">
              Players
            </span>
          </Link>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden ml-auto md:flex items-center gap-4">
          <Link to="/shop" className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-medium transition">
            Shop
          </Link>
          <Link to="/tickets" className="bg-white hover:shadow-[0px_0px_30px_14px] shadow-[0px_0px_30px_7px] hover:shadow-white/50 shadow-white/50 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition duration-300">
            Buy Tickets
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden ml-auto text-white"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Menu */}
        {
          isOpen && (
            <div className="absolute top-20 left-4 right-4 bg-black border border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-4">
              <Link
                to="/matches"
                className="hover:text-blue-400"
                onClick={() => setIsOpen(false)}
              >
                Fixtures
              </Link>
              <Link
                to="/news"
                className="hover:text-blue-400"
                onClick={() => setIsOpen(false)}
              >
                News
              </Link>
              <Link
                to="/players"
                className="hover:text-blue-400"
                onClick={() => setIsOpen(false)}
              >
                Players
              </Link>
              <Link
                to="/shop"
                className="hover:text-blue-400"
                onClick={() => setIsOpen(false)}
              >
                Shop
              </Link>
              <Link to="/contact" className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-medium transition" onClick={() => setIsOpen(false)}>
                Contact
              </Link>
              <Link to="/tickets" className="bg-white hover:shadow-[0px_0px_30px_14px] shadow-[0px_0px_30px_7px] hover:shadow-white/50 shadow-white/50 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition duration-300" onClick={() => setIsOpen(false)}>
                Buy Tickets
              </Link>
            </div>
          )
        }
      </div>
    </nav>
  );
}
