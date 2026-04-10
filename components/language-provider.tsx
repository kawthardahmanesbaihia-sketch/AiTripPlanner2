"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Language = "en" | "fr" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    home: "Home",
    upload: "Upload",
    about: "About",
    contact: "Contact",
    tripPlanner: "Trip Planner",
    aiDrivenVisual: "AI-Driven Visual",
    uploadYourImages: "Upload Your Images",
    startNow: "Start Now",
    howItWorks: "How It Works",
    uploadImages: "Upload Images",
    uploadImagesDesc: "Share your favorite travel photos with our AI system",
    aiAnalysis: "AI Analysis",
    aiAnalysisDesc: "Our vision model analyzes your preferences and travel style",
    getResults: "Get Results",
    getResultsDesc: "Receive personalized trip recommendations instantly",
    uploadYourTravelImages: "Upload Your Travel Images",
    shareYourFavorite: "Share your favorite travel photos and let our AI analyze your preferences",
    dragDropImages: "Drag & drop images",
    orClickBrowse: "or click to browse your files",
    dropImagesHere: "Drop your images here",
    selectedImages: "Selected Images",
    analyzeWithAI: "Analyze with AI",
    analyzingWithAI: "Analyzing with AI...",
    generateWithAI: "Generate with AI",
    generatingImages: "Generating Images...",
    imageSource: "Image Source",
    uploadFromComputer: "Upload from Computer",
    generateAIImages: "Generate AI Images",
    enterPrompt: "Enter a prompt to generate travel images",
    generateImages: "Generate Images",
    preferences: "Preferences",
    budget: "Budget",
    low: "Low",
    medium: "Medium",
    high: "High",
    companion: "Companion",
    solo: "Solo",
    family: "Family",
    couple: "Couple",
    friends: "Friends",
    group: "Group",
    yourTravelPreferences: "Your Travel Preferences",
    basedOnImages: "Based on your images, here's what we discovered",
    inferredFromImages: "Inferred from Images",
    suggestedCountry: "Suggested Country",
    confidence: "Confidence",
    recommendedHotel: "Recommended Hotel",
    dailyRestaurants: "Daily Restaurants",
    suggestedActivities: "Suggested Activities",
    eventsAndFestivals: "Events & Festivals",
    aiSummary: "AI Summary",
    backToUpload: "Back to Upload",
    aboutThisProject: "About This Project",
    projectVision: "Project Vision",
    keyTechnologies: "Key Technologies",
    getInTouch: "Get In Touch",
    name: "Name",
    email: "Email",
    message: "Message",
    sendMessage: "Send Message",
    sending: "Sending...",
    nature: "Nature",
    cityStyle: "City Style",
    activities: "Activities",
    foodCuisine: "Food & Cuisine",
    aiImageSelection: "AI Image Selection",
    selectAIImages: "Select AI-generated images that match your travel preferences",
    generating: "Generating",
    generateMore: "Generate More",
    generate: "Generate",
    clickGenerateToSee: "Click 'Generate' to see AI-generated images",
    optional: "Optional",
    uploadedImages: "Uploaded Images",
    imagesSelected: "images selected",
    readyToAnalyze: "Ready to analyze",
    selectAtLeast: "Select at least",
    more: "more",
    images: "images",
  },
  fr: {
    home: "Accueil",
    upload: "Télécharger",
    about: "À propos",
    contact: "Contact",
    tripPlanner: "Planificateur de Voyage",
    aiDrivenVisual: "Visuel Piloté par IA",
    uploadYourImages: "Téléchargez vos images",
    startNow: "Commencer",
    howItWorks: "Comment ça marche",
    uploadImages: "Télécharger des images",
    uploadImagesDesc: "Partagez vos photos de voyage préférées avec notre système IA",
    aiAnalysis: "Analyse IA",
    aiAnalysisDesc: "Notre modèle de vision analyse vos préférences et votre style de voyage",
    getResults: "Obtenir des résultats",
    getResultsDesc: "Recevez des recommandations de voyage personnalisées instantanément",
    uploadYourTravelImages: "Téléchargez vos images de voyage",
    shareYourFavorite: "Partagez vos photos de voyage préférées et laissez notre IA analyser vos préférences",
    dragDropImages: "Glisser-déposer des images",
    orClickBrowse: "ou cliquez pour parcourir vos fichiers",
    dropImagesHere: "Déposez vos images ici",
    selectedImages: "Images sélectionnées",
    analyzeWithAI: "Analyser avec IA",
    analyzingWithAI: "Analyse avec IA...",
    generateWithAI: "Générer avec IA",
    generatingImages: "Génération d'images...",
    imageSource: "Source d'image",
    uploadFromComputer: "Télécharger depuis l'ordinateur",
    generateAIImages: "Générer des images IA",
    enterPrompt: "Entrez une invite pour générer des images de voyage",
    generateImages: "Générer des images",
    preferences: "Préférences",
    budget: "Budget",
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
    companion: "Compagnon",
    solo: "Solo",
    family: "Famille",
    couple: "Couple",
    friends: "Amis",
    group: "Groupe",
    yourTravelPreferences: "Vos préférences de voyage",
    basedOnImages: "En fonction de vos images, voici ce que nous avons découvert",
    inferredFromImages: "Déduit des images",
    suggestedCountry: "Pays suggéré",
    confidence: "Confiance",
    recommendedHotel: "Hôtel recommandé",
    dailyRestaurants: "Restaurants quotidiens",
    suggestedActivities: "Activités suggérées",
    eventsAndFestivals: "Événements et Festivals",
    aiSummary: "Résumé IA",
    backToUpload: "Retour au téléchargement",
    aboutThisProject: "À propos de ce projet",
    projectVision: "Vision du projet",
    keyTechnologies: "Technologies clés",
    getInTouch: "Entrer en contact",
    name: "Nom",
    email: "E-mail",
    message: "Message",
    sendMessage: "Envoyer le message",
    sending: "Envoi...",
    nature: "Nature",
    cityStyle: "Style de Ville",
    activities: "Activités",
    foodCuisine: "Nourriture et Cuisine",
    aiImageSelection: "Sélection d'images IA",
    selectAIImages: "Sélectionnez des images générées par IA qui correspondent à vos préférences de voyage",
    generating: "Génération",
    generateMore: "Générer plus",
    generate: "Générer",
    clickGenerateToSee: "Cliquez sur 'Générer' pour voir les images générées par IA",
    optional: "Optionnel",
    uploadedImages: "Images téléchargées",
    imagesSelected: "images sélectionnées",
    readyToAnalyze: "Prêt à analyser",
    selectAtLeast: "Sélectionnez au moins",
    more: "plus",
    images: "images",
  },
  ar: {
    home: "الرئيسية",
    upload: "رفع",
    about: "حول",
    contact: "اتصل",
    tripPlanner: "مخطط الرحلات",
    aiDrivenVisual: "مرئي مدعوم بالذكاء الاصطناعي",
    uploadYourImages: "قم بتحميل صور سفرك",
    startNow: "ابدأ الآن",
    howItWorks: "كيف يعمل",
    uploadImages: "تحميل الصور",
    uploadImagesDesc: "شارك صور سفرك المفضلة مع نظام الذكاء الاصطناعي لدينا",
    aiAnalysis: "تحليل الذكاء الاصطناعي",
    aiAnalysisDesc: "يقوم نموذج الرؤية لدينا بتحليل تفضيلاتك وأسلوب سفرك",
    getResults: "احصل على النتائج",
    getResultsDesc: "احصل على توصيات سفر مخصصة على الفور",
    uploadYourTravelImages: "قم بتحميل صور سفرك",
    shareYourFavorite: "شارك صور سفرك المفضلة ودع الذكاء الاصطناعي لدينا يحلل تفضيلاتك",
    dragDropImages: "اسحب وأفلت الصور",
    orClickBrowse: "أو انقر لتصفح ملفاتك",
    dropImagesHere: "أفلت صورك هنا",
    selectedImages: "الصور المحددة",
    analyzeWithAI: "تحليل بالذكاء الاصطناعي",
    analyzingWithAI: "جاري التحليل بالذكاء الاصطناعي...",
    generateWithAI: "توليد بالذكاء الاصطناعي",
    generatingImages: "جاري توليد الصور...",
    imageSource: "مصدر الصورة",
    uploadFromComputer: "تحميل من الكمبيوتر",
    generateAIImages: "توليد صور بالذكاء الاصطناعي",
    enterPrompt: "أدخل موجهًا لتوليد صور السفر",
    generateImages: "توليد الصور",
    preferences: "التفضيلات",
    budget: "الميزانية",
    low: "منخفض",
    medium: "متوسط",
    high: "عالي",
    companion: "الرفيق",
    solo: "منفرد",
    family: "عائلة",
    couple: "زوجان",
    friends: "أصدقاء",
    group: "مجموعة",
    yourTravelPreferences: "تفضيلات سفرك",
    basedOnImages: "بناءً على صورك، إليك ما اكتشفناه",
    inferredFromImages: "استنتج من الصور",
    suggestedCountry: "البلد المقترح",
    confidence: "الثقة",
    recommendedHotel: "الفندق الموصى به",
    dailyRestaurants: "المطاعم اليومية",
    suggestedActivities: "الأنشطة المقترحة",
    eventsAndFestivals: "الفعاليات والمهرجانات",
    aiSummary: "ملخص الذكاء الاصطناعي",
    backToUpload: "العودة إلى التحميل",
    aboutThisProject: "حول هذا المشروع",
    projectVision: "رؤية المشروع",
    keyTechnologies: "التقنيات الرئيسية",
    getInTouch: "ابقى على تواصل",
    name: "الاسم",
    email: "البريد الإلكتروني",
    message: "الرسالة",
    sendMessage: "إرسال الرسالة",
    sending: "جاري الإرسال...",
    nature: "الطبيعة",
    cityStyle: "نمط المدينة",
    activities: "الأنشطة",
    foodCuisine: "الطعام والمأكولات",
    aiImageSelection: "اختيار صور الذكاء الاصطناعي",
    selectAIImages: "حدد الصور التي تم إنشاؤها بواسطة الذكاء الاصطناعي والتي تتناسب مع تفضيلات السفر الخاصة بك",
    generating: "جاري التوليد",
    generateMore: "توليد المزيد",
    generate: "توليد",
    clickGenerateToSee: "انقر على 'توليد' لرؤية الصور التي تم إنشاؤها بواسطة الذكاء الاصطناعي",
    optional: "اختياري",
    uploadedImages: "الصور المرفوعة",
    imagesSelected: "صور محددة",
    readyToAnalyze: "جاهز للتحليل",
    selectAtLeast: "اختر على الأقل",
    more: "أكثر",
    images: "صور",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && ["en", "fr", "ar"].includes(savedLang)) {
      setLanguageState(savedLang)
      updateDirection(savedLang)
    }
  }, [])

  const updateDirection = (lang: Language) => {
    if (lang === "ar") {
      document.documentElement.setAttribute("dir", "rtl")
      document.documentElement.setAttribute("lang", "ar")
    } else {
      document.documentElement.setAttribute("dir", "ltr")
      document.documentElement.setAttribute("lang", lang)
    }
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
    updateDirection(lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
