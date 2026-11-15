"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Map, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full px-4 flex justify-center pointer-events-none">
      <header
        className={`w-full transition-all duration-500 ease-in-out pointer-events-auto flex justify-between items-center bg-white/90 dark:bg-[#141314]/90 backdrop-blur-md border border-[#dddddd] dark:border-[#27272a] shadow-sm rounded-full ${
          scrolled
            ? "max-w-[900px] px-5 py-3 shadow-md"
            : "max-w-[1200px] px-6 py-4"
        }`}
      >
        <Link
          href="/"
          className="font-display font-medium tracking-tight flex items-center gap-2 text-[#141314] dark:text-[#fafafa]"
        >
          <Map
            className={`transition-all duration-500 ${scrolled ? "w-4 h-4" : "w-5 h-5"}`}
          />
          <span
            className={`transition-all duration-500 ${scrolled ? "text-lg" : "text-xl"}`}
          >
            Delhi Startup Map
          </span>
        </Link>

        <nav
          className={`hidden md:flex font-medium text-[#454545] dark:text-[#a1a1aa] transition-all duration-500 ${scrolled ? "gap-6 text-xs" : "gap-8 text-sm"}`}
        >
          <Link
            href="/map"
            className="hover:text-[#111113] dark:hover:text-[#fafafa] transition-colors"
          >
            Explore Map
          </Link>
          <Link
            href="/submit"
            className="hover:text-[#111113] dark:hover:text-[#fafafa] transition-colors"
          >
            Submit Startup
          </Link>
          <button
            onClick={() => scrollToSection("investors")}
            className="hover:text-[#111113] dark:hover:text-[#fafafa] transition-colors"
          >
            Investors
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="hover:text-[#111113] dark:hover:text-[#fafafa] transition-colors"
          >
            About
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="relative p-2 rounded-full hover:bg-[#f4f3f4] dark:hover:bg-[#27272a] transition-colors focus:outline-none flex items-center justify-center w-10 h-10 overflow-hidden"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {resolvedTheme === "dark" ? (
                <motion.div
                  key="moon"
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute"
                >
                  <Moon className="w-5 h-5 text-[#a1a1aa]" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute"
                >
                  <Sun className="w-5 h-5 text-[#111113]" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <Link
            href="/map"
            className="bg-[#111113] dark:bg-[#fafafa] text-white dark:text-[#09090b] px-5 py-2.5 rounded-full font-medium hover:bg-black dark:hover:bg-zinc-200 transition-colors hidden sm:block"
          >
            Open Map
          </Link>
        </div>
      </header>
    </div>
  );
}
