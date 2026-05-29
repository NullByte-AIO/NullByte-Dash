"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface BrandingContextType {
  agencyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  isLoading: boolean;
  updateBranding: (updates: { agencyName?: string; logoUrl?: string; primaryColor?: string; secondaryColor?: string }) => Promise<void>;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

function hexToHSL(hex: string) {
  let cleanHex = hex.trim().replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map(c => c + c).join("");
  }
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function generateShade(hex: string, targetLightness: number) {
  try {
    const { h, s } = hexToHSL(hex);
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${targetLightness}%)`;
  } catch (e) {
    return hex;
  }
}

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agencyName, setAgencyName] = useState("NullByte");
  const [logoUrl, setLogoUrl] = useState("/images/logo/nb-icon.png");
  const [primaryColor, setPrimaryColor] = useState("#465fff");
  const [secondaryColor, setSecondaryColor] = useState("#05FF00");
  const [isLoading, setIsLoading] = useState(true);

  const applyColors = useCallback((primary: string, secondary: string) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    
    // Apply primary shades
    root.style.setProperty("--brand-25", generateShade(primary, 97));
    root.style.setProperty("--brand-50", generateShade(primary, 95));
    root.style.setProperty("--brand-100", generateShade(primary, 90));
    root.style.setProperty("--brand-200", generateShade(primary, 80));
    root.style.setProperty("--brand-300", generateShade(primary, 70));
    root.style.setProperty("--brand-400", generateShade(primary, 60));
    root.style.setProperty("--brand-500", primary);
    root.style.setProperty("--brand-600", generateShade(primary, 40));
    root.style.setProperty("--brand-700", generateShade(primary, 30));
    root.style.setProperty("--brand-800", generateShade(primary, 20));
    root.style.setProperty("--brand-900", generateShade(primary, 15));
    root.style.setProperty("--brand-950", generateShade(primary, 10));

    // Secondary color
    root.style.setProperty("--secondary-500", secondary);
  }, []);

  const refreshBranding = useCallback(async () => {
    applyColors(primaryColor, secondaryColor);
    setIsLoading(false);
  }, [applyColors, primaryColor, secondaryColor]);

  useEffect(() => {
    refreshBranding();
  }, [refreshBranding]);

  const updateBranding = async (updates: { agencyName?: string; logoUrl?: string; primaryColor?: string; secondaryColor?: string }) => {
    if (updates.agencyName !== undefined) setAgencyName(updates.agencyName);
    if (updates.logoUrl !== undefined) setLogoUrl(updates.logoUrl);
    if (updates.primaryColor !== undefined) setPrimaryColor(updates.primaryColor);
    if (updates.secondaryColor !== undefined) setSecondaryColor(updates.secondaryColor);

    const nextPrimary = updates.primaryColor ?? primaryColor;
    const nextSecondary = updates.secondaryColor ?? secondaryColor;
    applyColors(nextPrimary, nextSecondary);
  };

  return (
    <BrandingContext.Provider value={{ agencyName, logoUrl, primaryColor, secondaryColor, isLoading, updateBranding, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
};
