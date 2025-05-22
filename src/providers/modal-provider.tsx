"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SpotlightSearch } from "@/components/spotlight";

interface SpotlightContextType {
  isOpen: boolean;
  openSpotlight: () => void;
  closeSpotlight: () => void;
}

export const SpotlightContext = createContext<SpotlightContextType | undefined>(
  undefined
);

export function useSpotlight() {
  const context = useContext(SpotlightContext);
  if (!context) {
    throw new Error("useSpotlight must be used within a SpotlightProvider");
  }
  return context;
}

export function SpotlightProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSpotlight = () => setIsOpen(true);
  const closeSpotlight = () => setIsOpen(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SpotlightContext.Provider
      value={{ isOpen, openSpotlight, closeSpotlight }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTitle className='hidden'>Spotlight</DialogTitle>
        <DialogContent className='sm:max-w-[640px] p-0 gap-0 border border-gray-200 dark:border-gray-800 shadow-xl bg-white/80 dark:bg-[#171717d6] backdrop-blur-md'>
          <SpotlightSearch />
        </DialogContent>
      </Dialog>
    </SpotlightContext.Provider>
  );
}
