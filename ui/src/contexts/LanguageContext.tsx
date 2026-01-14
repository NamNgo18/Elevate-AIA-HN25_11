
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, translations, TranslationKeys } from "@/lib/i18n";

interface LanguageContextType {
   language: Language;
   setLanguage: (lang: Language) => void;
   t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
   const [language, setLanguage] = useState<Language>("en");

   // Load language from localStorage on mount
   useEffect(() => {
      const savedLang = localStorage.getItem("language") as Language;
      if (savedLang && (savedLang === "en" || savedLang === "vi")) {
         setLanguage(savedLang);
      }
   }, []);

   // Save language to localStorage when it changes
   const handleSetLanguage = (lang: Language) => {
      setLanguage(lang);
      localStorage.setItem("language", lang);
   };

   const t = (key: TranslationKeys): string => {
      return translations[language][key] || (translations["en"][key] as string) || key;
   };

   return (
      <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
         {children}
      </LanguageContext.Provider>
   );
};

export const useLanguage = () => {
   const context = useContext(LanguageContext);
   if (context === undefined) {
      throw new Error("useLanguage must be used within a LanguageProvider");
   }
   return context;
};
