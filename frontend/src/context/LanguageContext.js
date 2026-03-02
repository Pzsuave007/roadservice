import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Sticky Header
    openNow: "Open 24/7",
    textUs: "Text Us",
    callNow: "Call Now",
    
    // Hero
    heroTitle: "24/7 Emergency Towing",
    heroSubtitle: "Fast & Reliable",
    heroTagline: "We Arrive in 30 Minutes or Less",
    getQuote: "Get a Fast Quote",
    servingArea: "Serving Salem & All of Oregon",
    licensed: "Licensed",
    insured: "Insured",
    available247: "24/7 Available",
    
    // Services
    servicesTitle: "Our Services",
    emergencyTowing: "Emergency Towing",
    emergencyTowingDesc: "Fast response when you need it most. Available 24/7 for any roadside emergency.",
    flatbedTowing: "Flatbed Towing",
    flatbedTowingDesc: "Safe transport for luxury, classic, and all-wheel drive vehicles.",
    accidentRecovery: "Accident Recovery",
    accidentRecoveryDesc: "Professional accident scene recovery with insurance assistance.",
    lockoutService: "Lockout Service",
    lockoutServiceDesc: "Locked out? We'll get you back in your vehicle quickly.",
    jumpStart: "Jump Start",
    jumpStartDesc: "Dead battery? We'll get you running in minutes.",
    tireChange: "Tire Change",
    tireChangeDesc: "Flat tire? We'll swap it with your spare fast.",
    longDistance: "Long Distance Towing",
    longDistanceDesc: "Reliable towing anywhere in Oregon and beyond.",
    
    // Quote Form
    quoteTitle: "Get Your Instant Estimate",
    quoteSubtitle: "Free quotes, no obligation",
    pickupLocation: "Pickup Location",
    dropoffLocation: "Drop-off Location",
    vehicleType: "Vehicle Type",
    serviceNeeded: "Service Needed",
    phoneNumber: "Phone Number",
    estimatedDistance: "Estimated Distance (miles)",
    emergencyService: "Emergency Service",
    scheduledService: "Scheduled Service",
    getEstimate: "Get My Estimate",
    submitting: "Submitting...",
    
    // Vehicle Types
    sedan: "Sedan / Car",
    suv: "SUV / Crossover",
    truck: "Truck / Pickup",
    motorcycle: "Motorcycle",
    van: "Van / Minivan",
    other: "Other",
    
    // Quote Result
    estimateTitle: "Your Estimated Cost",
    basePrice: "Base Service",
    mileageCharge: "Mileage",
    emergencyFee: "Emergency Fee",
    totalEstimate: "Total Estimate",
    estimateNote: "This is an estimate. Final price may vary based on actual conditions.",
    confirmRequest: "Confirm & Request Service",
    requestSubmitted: "Request Submitted!",
    contactSoon: "We'll contact you within minutes.",
    
    // Why Choose Us
    whyChooseUs: "Why Choose Us",
    fastResponse: "Fast Response",
    fastResponseDesc: "30 minutes or less average arrival time",
    transparentPricing: "Transparent Pricing",
    transparentPricingDesc: "No hidden fees, upfront quotes",
    modernEquipment: "Modern Equipment",
    modernEquipmentDesc: "State-of-the-art tow trucks and tools",
    experiencedDrivers: "Experienced Drivers",
    experiencedDriversDesc: "Certified and professional team",
    fiveStarService: "5-Star Rated",
    fiveStarServiceDesc: "Trusted by the Salem community",
    
    // Reviews
    reviewsTitle: "What Our Customers Say",
    readMoreReviews: "Read More Reviews",
    
    // Service Area
    serviceAreaTitle: "Proudly Serving Salem & Surrounding Areas",
    serviceAreaCities: "Salem, Keizer, Albany, Corvallis, Woodburn, Silverton, Dallas, Monmouth, Independence, and all of Oregon",
    
    // Accident Section
    accidentTitle: "Involved in an Accident?",
    accidentSubtitle: "We're here to help during stressful times",
    insuranceWork: "We work with all insurance companies",
    directBilling: "Direct billing available",
    policeDispatch: "Police dispatch assistance",
    safeStorage: "Safe vehicle storage",
    callForHelp: "Call for Immediate Help",
    
    // FAQ
    faqTitle: "Frequently Asked Questions",
    faq1Q: "How much does towing cost?",
    faq1A: "Our towing starts at $75 base fee plus $3.50 per mile. Get an instant estimate using our quote calculator above.",
    faq2Q: "How fast can you arrive?",
    faq2A: "We aim to arrive within 30 minutes in the Salem area. Response times may vary for surrounding areas.",
    faq3Q: "Are you available 24/7?",
    faq3A: "Yes! We operate 24 hours a day, 7 days a week, 365 days a year including holidays.",
    faq4Q: "Do you accept credit cards?",
    faq4A: "Yes, we accept all major credit cards, debit cards, and cash.",
    faq5Q: "Do you tow motorcycles?",
    faq5A: "Absolutely! We have specialized equipment for safe motorcycle transport.",
    faq6Q: "Do you provide long-distance towing?",
    faq6A: "Yes, we offer long-distance towing anywhere in Oregon and neighboring states.",
    
    // Final CTA
    finalCtaTitle: "Stuck on the Road?",
    finalCtaSubtitle: "We're One Call Away",
    
    // Footer
    footerText: "Ben's Road Service LLC - Serving Salem & All of Oregon",
    weSpeak: "Se Habla Español",
    
    // Admin
    adminLogin: "Admin Login",
    adminDashboard: "Admin Dashboard",
    logout: "Logout",
    quoteRequests: "Quote Requests",
    status: "Status",
    pending: "Pending",
    contacted: "Contacted",
    completed: "Completed",
    cancelled: "Cancelled",
    noQuotes: "No quote requests yet",
    actions: "Actions",
    
    // Floating buttons
    getDirections: "Get Directions",
  },
  es: {
    // Sticky Header
    openNow: "Abierto 24/7",
    textUs: "Enviar Texto",
    callNow: "Llamar Ahora",
    
    // Hero
    heroTitle: "Grúa de Emergencia 24/7",
    heroSubtitle: "Rápido y Confiable",
    heroTagline: "Llegamos en 30 Minutos o Menos",
    getQuote: "Cotización Gratis",
    servingArea: "Sirviendo Salem y Todo Oregon",
    licensed: "Licenciado",
    insured: "Asegurado",
    available247: "24/7 Disponible",
    
    // Services
    servicesTitle: "Nuestros Servicios",
    emergencyTowing: "Grúa de Emergencia",
    emergencyTowingDesc: "Respuesta rápida cuando más lo necesitas. Disponible 24/7.",
    flatbedTowing: "Grúa Plataforma",
    flatbedTowingDesc: "Transporte seguro para vehículos de lujo, clásicos y 4x4.",
    accidentRecovery: "Recuperación de Accidentes",
    accidentRecoveryDesc: "Recuperación profesional con asistencia de seguros.",
    lockoutService: "Servicio de Cerrajería",
    lockoutServiceDesc: "¿Te quedaste afuera? Te ayudamos a entrar rápidamente.",
    jumpStart: "Arranque de Batería",
    jumpStartDesc: "¿Batería muerta? Te ponemos en marcha en minutos.",
    tireChange: "Cambio de Llanta",
    tireChangeDesc: "¿Llanta ponchada? La cambiamos rápidamente.",
    longDistance: "Grúa Larga Distancia",
    longDistanceDesc: "Servicio de grúa a cualquier parte de Oregon y más allá.",
    
    // Quote Form
    quoteTitle: "Obtén Tu Cotización Instantánea",
    quoteSubtitle: "Cotizaciones gratis, sin compromiso",
    pickupLocation: "Ubicación de Recogida",
    dropoffLocation: "Ubicación de Entrega",
    vehicleType: "Tipo de Vehículo",
    serviceNeeded: "Servicio Necesario",
    phoneNumber: "Número de Teléfono",
    estimatedDistance: "Distancia Estimada (millas)",
    emergencyService: "Servicio de Emergencia",
    scheduledService: "Servicio Programado",
    getEstimate: "Obtener Cotización",
    submitting: "Enviando...",
    
    // Vehicle Types
    sedan: "Sedán / Carro",
    suv: "SUV / Camioneta",
    truck: "Troca / Pickup",
    motorcycle: "Motocicleta",
    van: "Van / Minivan",
    other: "Otro",
    
    // Quote Result
    estimateTitle: "Tu Costo Estimado",
    basePrice: "Servicio Base",
    mileageCharge: "Millaje",
    emergencyFee: "Cargo de Emergencia",
    totalEstimate: "Total Estimado",
    estimateNote: "Esto es un estimado. El precio final puede variar.",
    confirmRequest: "Confirmar y Solicitar Servicio",
    requestSubmitted: "¡Solicitud Enviada!",
    contactSoon: "Te contactaremos en minutos.",
    
    // Why Choose Us
    whyChooseUs: "¿Por Qué Elegirnos?",
    fastResponse: "Respuesta Rápida",
    fastResponseDesc: "Tiempo de llegada promedio de 30 minutos o menos",
    transparentPricing: "Precios Transparentes",
    transparentPricingDesc: "Sin cargos ocultos, cotizaciones claras",
    modernEquipment: "Equipo Moderno",
    modernEquipmentDesc: "Grúas y herramientas de última generación",
    experiencedDrivers: "Conductores Experimentados",
    experiencedDriversDesc: "Equipo certificado y profesional",
    fiveStarService: "5 Estrellas",
    fiveStarServiceDesc: "Confianza de la comunidad de Salem",
    
    // Reviews
    reviewsTitle: "Lo Que Dicen Nuestros Clientes",
    readMoreReviews: "Ver Más Reseñas",
    
    // Service Area
    serviceAreaTitle: "Sirviendo con Orgullo Salem y Áreas Cercanas",
    serviceAreaCities: "Salem, Keizer, Albany, Corvallis, Woodburn, Silverton, Dallas, Monmouth, Independence, y todo Oregon",
    
    // Accident Section
    accidentTitle: "¿Tuviste un Accidente?",
    accidentSubtitle: "Estamos aquí para ayudarte en momentos difíciles",
    insuranceWork: "Trabajamos con todas las aseguradoras",
    directBilling: "Facturación directa disponible",
    policeDispatch: "Asistencia con despacho policial",
    safeStorage: "Almacenamiento seguro de vehículos",
    callForHelp: "Llama para Ayuda Inmediata",
    
    // FAQ
    faqTitle: "Preguntas Frecuentes",
    faq1Q: "¿Cuánto cuesta el servicio de grúa?",
    faq1A: "Nuestro servicio de grúa comienza en $75 más $3.50 por milla. Obtén una cotización instantánea arriba.",
    faq2Q: "¿Qué tan rápido pueden llegar?",
    faq2A: "Llegamos en 30 minutos o menos en el área de Salem. Los tiempos pueden variar en áreas cercanas.",
    faq3Q: "¿Están disponibles 24/7?",
    faq3A: "¡Sí! Operamos 24 horas al día, 7 días a la semana, 365 días al año.",
    faq4Q: "¿Aceptan tarjetas de crédito?",
    faq4A: "Sí, aceptamos todas las tarjetas de crédito, débito y efectivo.",
    faq5Q: "¿Transportan motocicletas?",
    faq5A: "¡Por supuesto! Tenemos equipo especializado para transporte seguro de motos.",
    faq6Q: "¿Ofrecen grúa de larga distancia?",
    faq6A: "Sí, ofrecemos servicio de grúa a cualquier parte de Oregon y estados vecinos.",
    
    // Final CTA
    finalCtaTitle: "¿Varado en el Camino?",
    finalCtaSubtitle: "Estamos a Una Llamada de Distancia",
    
    // Footer
    footerText: "Ben's Road Service LLC - Sirviendo Salem y Todo Oregon",
    weSpeak: "We Speak English",
    
    // Admin
    adminLogin: "Acceso Admin",
    adminDashboard: "Panel de Administración",
    logout: "Salir",
    quoteRequests: "Solicitudes de Cotización",
    status: "Estado",
    pending: "Pendiente",
    contacted: "Contactado",
    completed: "Completado",
    cancelled: "Cancelado",
    noQuotes: "No hay solicitudes aún",
    actions: "Acciones",
    
    // Floating buttons
    getDirections: "Cómo Llegar",
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  
  const t = (key) => {
    return translations[language][key] || key;
  };
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
