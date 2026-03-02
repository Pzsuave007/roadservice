import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  Shield,
  CheckCircle,
  Star,
  Truck,
  Key,
  Battery,
  CircleDot,
  AlertTriangle,
  Navigation,
  FileText,
  ChevronRight,
  Globe,
  Car,
  Zap,
  Award,
  Users,
  DollarSign,
  Wrench,
  Crosshair,
  Loader2,
  X,
  HelpCircle,
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const PHONE_NUMBER = '9713886300';
const PHONE_DISPLAY = '(971) 388-6300';
const WHATSAPP_NUMBER = '19713886300'; // With country code for WhatsApp

// Client's actual tow truck images
const CLIENT_IMAGES = {
  hero: 'https://customer-assets.emergentagent.com/job_quick-towing-pro/artifacts/q4hhmpd9_WhatsApp%20Image%202026-03-02%20at%207.33.36%20AM%20%281%29.jpeg',
  flatbedDay: 'https://customer-assets.emergentagent.com/job_quick-towing-pro/artifacts/nczsdil9_WhatsApp%20Image%202026-03-02%20at%207.33.36%20AM%20%282%29.jpeg',
  gasStation: 'https://customer-assets.emergentagent.com/job_quick-towing-pro/artifacts/202b513u_WhatsApp%20Image%202026-03-02%20at%207.33.36%20AM%20%283%29.jpeg',
  truckWithPickup: 'https://customer-assets.emergentagent.com/job_quick-towing-pro/artifacts/lsayurd5_WhatsApp%20Image%202026-03-02%20at%207.33.36%20AM%20%284%29.jpeg',
  truckCloseup: 'https://customer-assets.emergentagent.com/job_quick-towing-pro/artifacts/7xjs889d_WhatsApp%20Image%202026-03-02%20at%207.33.36%20AM%20%285%29.jpeg',
};

export default function LandingPage() {
  const { t, language, toggleLanguage } = useLanguage();
  const [quoteStep, setQuoteStep] = useState('form'); // form, estimate, submitted
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    vehicleType: '',
    serviceType: '',
    isEmergency: true,
    phoneNumber: '',
    estimatedDistance: 10,
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [emergencyLocation, setEmergencyLocation] = useState(null);
  const [isGettingEmergencyLocation, setIsGettingEmergencyLocation] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get user's current location using browser geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(language === 'en' ? 'Geolocation is not supported by your browser' : 'La geolocalización no es compatible con tu navegador');
      return;
    }
    
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use reverse geocoding to get address from coordinates
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data.display_name) {
            // Extract a simpler address format
            const address = data.address;
            let simpleAddress = '';
            
            if (address.road) simpleAddress += address.road;
            if (address.house_number) simpleAddress = address.house_number + ' ' + simpleAddress;
            if (address.city || address.town || address.village) {
              simpleAddress += simpleAddress ? ', ' : '';
              simpleAddress += address.city || address.town || address.village;
            }
            if (address.state) {
              simpleAddress += simpleAddress ? ', ' : '';
              simpleAddress += address.state;
            }
            
            handleInputChange('pickupLocation', simpleAddress || data.display_name);
            toast.success(language === 'en' ? 'Location found!' : '¡Ubicación encontrada!');
          }
        } catch (error) {
          // Fallback to coordinates if geocoding fails
          handleInputChange('pickupLocation', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast.success(language === 'en' ? 'GPS coordinates captured!' : '¡Coordenadas GPS capturadas!');
        }
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = language === 'en' ? 'Unable to get your location' : 'No se pudo obtener tu ubicación';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = language === 'en' ? 'Please enable location access in your browser' : 'Por favor habilita el acceso a ubicación en tu navegador';
        }
        toast.error(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Get emergency location and prepare for sharing via SMS or WhatsApp
  const getEmergencyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(language === 'en' ? 'Geolocation is not supported by your browser' : 'La geolocalización no es compatible con tu navegador');
      return;
    }
    
    setIsGettingEmergencyLocation(true);
    setShowLocationModal(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        
        let addressText = '';
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data.display_name) {
            const address = data.address;
            if (address.road) addressText = address.road;
            if (address.city || address.town || address.village) {
              addressText += addressText ? ', ' : '';
              addressText += address.city || address.town || address.village;
            }
          }
        } catch (error) {
          // Use coordinates if geocoding fails
          addressText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
        
        setEmergencyLocation({
          lat: latitude,
          lng: longitude,
          mapsLink,
          address: addressText || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        });
        setIsGettingEmergencyLocation(false);
        toast.success(language === 'en' ? 'Location found! Choose how to send it.' : '¡Ubicación encontrada! Elige cómo enviarla.');
      },
      (error) => {
        setIsGettingEmergencyLocation(false);
        let errorMessage = language === 'en' ? 'Unable to get your location' : 'No se pudo obtener tu ubicación';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = language === 'en' ? 'Please enable location access in your browser' : 'Por favor habilita el acceso a ubicación en tu navegador';
        }
        toast.error(errorMessage);
        setShowLocationModal(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const getEmergencyMessage = (method) => {
    if (!emergencyLocation) return '';
    const baseMessage = language === 'en'
      ? `🆘 EMERGENCY! I need roadside help!\n\n📍 My location: ${emergencyLocation.address}\n\n🗺️ Google Maps: ${emergencyLocation.mapsLink}\n\nPlease come ASAP!`
      : `🆘 ¡EMERGENCIA! ¡Necesito ayuda en carretera!\n\n📍 Mi ubicación: ${emergencyLocation.address}\n\n🗺️ Google Maps: ${emergencyLocation.mapsLink}\n\n¡Por favor vengan lo antes posible!`;
    return baseMessage;
  };

  const getEstimate = async () => {
    if (!formData.vehicleType || !formData.serviceType || !formData.pickupLocation || !formData.phoneNumber) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'Por favor complete todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/quote/estimate`, null, {
        params: {
          vehicle_type: formData.vehicleType,
          service_type: formData.serviceType,
          is_emergency: formData.isEmergency,
          distance_miles: formData.estimatedDistance,
        }
      });
      setEstimate(response.data);
      setQuoteStep('estimate');
    } catch (error) {
      toast.error(language === 'en' ? 'Error getting estimate' : 'Error al obtener cotización');
    }
    setIsSubmitting(false);
  };

  const submitRequest = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`${API}/quote/request`, {
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation,
        vehicle_type: formData.vehicleType,
        service_type: formData.serviceType,
        is_emergency: formData.isEmergency,
        phone_number: formData.phoneNumber,
        estimated_distance: formData.estimatedDistance,
      });
      setQuoteStep('submitted');
      toast.success(language === 'en' ? 'Request submitted!' : '¡Solicitud enviada!');
    } catch (error) {
      toast.error(language === 'en' ? 'Error submitting request' : 'Error al enviar solicitud');
    }
    setIsSubmitting(false);
  };

  const reviews = [
    {
      name: 'Michael R.',
      text: language === 'en' 
        ? "Ben's team arrived in 20 minutes when I was stranded at 2 AM. Professional and fair pricing!"
        : "El equipo de Ben llegó en 20 minutos cuando me quedé varado a las 2 AM. ¡Profesionales y precios justos!",
    },
    {
      name: 'Sarah K.',
      text: language === 'en'
        ? "Locked my keys in the car, they were there within 15 minutes. Lifesaver!"
        : "Dejé mis llaves en el carro, llegaron en 15 minutos. ¡Me salvaron!",
    },
    {
      name: 'Carlos M.',
      text: language === 'en'
        ? "Great Spanish-speaking service. They towed my truck to the mechanic, no issues at all."
        : "Excelente servicio en español. Remolcaron mi troca al mecánico sin problemas.",
    },
    {
      name: 'Jennifer L.',
      text: language === 'en'
        ? "After my accident, they handled everything with my insurance. So grateful for their help."
        : "Después de mi accidente, manejaron todo con mi seguro. Muy agradecida por su ayuda.",
    },
  ];

  const services = [
    { key: 'emergencyTowing', icon: Truck, type: 'emergency_towing' },
    { key: 'flatbedTowing', icon: Truck, type: 'flatbed_towing' },
    { key: 'accidentRecovery', icon: AlertTriangle, type: 'accident_recovery' },
    { key: 'lockoutService', icon: Key, type: 'lockout' },
    { key: 'jumpStart', icon: Battery, type: 'jump_start' },
    { key: 'tireChange', icon: CircleDot, type: 'tire_change' },
    { key: 'longDistance', icon: Navigation, type: 'long_distance' },
  ];

  const whyUs = [
    { key: 'fastResponse', icon: Zap },
    { key: 'transparentPricing', icon: DollarSign },
    { key: 'modernEquipment', icon: Wrench },
    { key: 'experiencedDrivers', icon: Users },
    { key: 'fiveStarService', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Sticky Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-600">
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-bold">{t('openNow')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
              data-testid="language-toggle"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'ES' : 'EN'}</span>
            </button>
            
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(language === 'en' ? 'Hi Ben! I need roadside assistance.' : '¡Hola Ben! Necesito asistencia en carretera.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors font-medium"
              data-testid="header-whatsapp-btn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="hidden sm:inline text-sm">WhatsApp</span>
            </a>
            
            <a
              href={`sms:${PHONE_NUMBER}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors font-medium"
              data-testid="header-text-btn"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">{t('textUs')}</span>
            </a>
            
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold transition-all emergency-glow hover:scale-105"
              data-testid="header-call-btn"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">{PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center pt-20"
        style={{
          backgroundImage: `url(${CLIENT_IMAGES.flatbedDay})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 hero-overlay" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full text-green-300 text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {language === 'en' ? 'Available Now - Dispatching' : 'Disponible Ahora - Despachando'}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white">
              {t('heroTitle')}
            </h1>
            <p className="text-2xl md:text-4xl font-bold text-white">
              {t('heroSubtitle')}
            </p>
            <p className="text-xl md:text-2xl text-gray-200">
              {t('heroTagline')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-black text-xl uppercase tracking-wider shadow-2xl shadow-orange-500/40 hover:scale-105 transition-transform cta-button"
                data-testid="hero-call-btn"
              >
                <Phone className="w-6 h-6" />
                {t('callNow')}
              </a>
              <a
                href="#quote"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold text-lg border border-white/30 transition-all cta-button"
                data-testid="hero-quote-btn"
              >
                <FileText className="w-5 h-5" />
                {t('getQuote')}
              </a>
            </div>
            
            {/* Emergency Send Location Button */}
            <button
              onClick={getEmergencyLocation}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-500/90 hover:bg-red-600 backdrop-blur-sm text-white font-bold text-sm border border-red-400/50 transition-all animate-pulse hover:animate-none"
              data-testid="hero-send-location-btn"
            >
              <MapPin className="w-5 h-5" />
              {language === 'en' ? "🆘 Stranded? Send My Location" : "🆘 ¿Varado? Enviar Mi Ubicación"}
            </button>
            
            <p className="text-gray-200 pt-4 flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              {t('servingArea')}
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
              <Badge variant="outline" className="px-5 py-2.5 border-green-400/50 text-green-300 bg-green-500/20 backdrop-blur-sm font-medium">
                <Shield className="w-4 h-4 mr-2" />
                {t('licensed')}
              </Badge>
              <Badge variant="outline" className="px-5 py-2.5 border-blue-400/50 text-blue-300 bg-blue-500/20 backdrop-blur-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('insured')}
              </Badge>
              <Badge variant="outline" className="px-5 py-2.5 border-orange-400/50 text-orange-300 bg-orange-500/20 backdrop-blur-sm font-medium">
                <Clock className="w-4 h-4 mr-2" />
                {t('available247')}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Calculator Section - RIGHT AFTER HERO for fast access */}
      <section id="quote" className="py-20 px-4 section-gray" data-testid="quote-section">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-orange-500 font-semibold mb-2">{language === 'en' ? 'Quick Estimate' : 'Estimado Rápido'}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">{t('quoteTitle')}</h2>
            <p className="text-gray-600">{t('quoteSubtitle')}</p>
          </div>
          
          <div className="glass-card p-8">
            {quoteStep === 'form' && (
              <div className="space-y-6 quote-form" data-testid="quote-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pickup" className="text-gray-700 font-medium">{t('pickupLocation')} *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="pickup"
                        placeholder={language === 'en' ? "Your current location" : "Tu ubicación actual"}
                        value={formData.pickupLocation}
                        onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                        className="bg-white border-gray-300 focus:border-orange-500 text-gray-900 placeholder:text-gray-400 flex-1"
                        data-testid="pickup-input"
                      />
                      <Button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 shrink-0"
                        data-testid="use-location-btn"
                        title={language === 'en' ? "Use my current location" : "Usar mi ubicación actual"}
                      >
                        {isGettingLocation ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Crosshair className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {language === 'en' ? "Click the location icon to share your GPS" : "Haz clic en el icono para compartir tu GPS"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dropoff" className="text-gray-700 font-medium">{t('dropoffLocation')}</Label>
                    <Input
                      id="dropoff"
                      placeholder={language === 'en' ? "Where should we take your vehicle?" : "¿A dónde llevamos tu vehículo?"}
                      value={formData.dropoffLocation}
                      onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                      className="bg-white border-gray-300 focus:border-orange-500 text-gray-900 placeholder:text-gray-400"
                      data-testid="dropoff-input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">{t('vehicleType')} *</Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value) => handleInputChange('vehicleType', value)}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900" data-testid="vehicle-select">
                        <SelectValue placeholder={t('vehicleType')} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="sedan" className="text-gray-900">{t('sedan')}</SelectItem>
                        <SelectItem value="suv" className="text-gray-900">{t('suv')}</SelectItem>
                        <SelectItem value="truck" className="text-gray-900">{t('truck')}</SelectItem>
                        <SelectItem value="motorcycle" className="text-gray-900">{t('motorcycle')}</SelectItem>
                        <SelectItem value="van" className="text-gray-900">{t('van')}</SelectItem>
                        <SelectItem value="other" className="text-gray-900">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">{t('serviceNeeded')} *</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => handleInputChange('serviceType', value)}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900" data-testid="service-select">
                        <SelectValue placeholder={t('serviceNeeded')} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="emergency_towing" className="text-gray-900">{t('emergencyTowing')}</SelectItem>
                        <SelectItem value="flatbed_towing" className="text-gray-900">{t('flatbedTowing')}</SelectItem>
                        <SelectItem value="accident_recovery" className="text-gray-900">{t('accidentRecovery')}</SelectItem>
                        <SelectItem value="lockout" className="text-gray-900">{t('lockoutService')}</SelectItem>
                        <SelectItem value="jump_start" className="text-gray-900">{t('jumpStart')}</SelectItem>
                        <SelectItem value="tire_change" className="text-gray-900">{t('tireChange')}</SelectItem>
                        <SelectItem value="long_distance" className="text-gray-900">{t('longDistance')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">{t('phoneNumber')} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="bg-white border-gray-300 focus:border-orange-500 text-gray-900 placeholder:text-gray-400"
                      data-testid="phone-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance" className="text-gray-700 font-medium">{t('estimatedDistance')}</Label>
                    <Input
                      id="distance"
                      type="number"
                      min="1"
                      max="500"
                      value={formData.estimatedDistance}
                      onChange={(e) => handleInputChange('estimatedDistance', parseInt(e.target.value) || 10)}
                      className="bg-white border-gray-300 focus:border-orange-500 text-gray-900"
                      data-testid="distance-input"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('isEmergency', true)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                      formData.isEmergency
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    data-testid="emergency-btn"
                  >
                    {t('emergencyService')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('isEmergency', false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                      !formData.isEmergency
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    data-testid="scheduled-btn"
                  >
                    {t('scheduledService')}
                  </button>
                </div>
                
                <Button
                  onClick={getEstimate}
                  disabled={isSubmitting}
                  className="w-full py-6 text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white shadow-lg shadow-orange-500/20"
                  data-testid="get-estimate-btn"
                >
                  {isSubmitting ? t('submitting') : t('getEstimate')}
                </Button>
              </div>
            )}
            
            {quoteStep === 'estimate' && estimate && (
              <div className="space-y-6" data-testid="quote-estimate">
                <h3 className="text-2xl font-bold text-center text-gray-900">{t('estimateTitle')}</h3>
                
                <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>{t('basePrice')}</span>
                    <span className="font-medium">${estimate.base_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>{t('mileageCharge')} ({estimate.distance_miles} mi)</span>
                    <span className="font-medium">${estimate.mileage_charge.toFixed(2)}</span>
                  </div>
                  {estimate.emergency_fee > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>{t('emergencyFee')}</span>
                      <span className="font-medium">${estimate.emergency_fee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4 flex justify-between text-2xl font-bold">
                    <span className="text-gray-900">{t('totalEstimate')}</span>
                    <span className="text-orange-500">${estimate.total_estimate.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Important notice - call for exact price */}
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                  <p className="text-orange-800 text-center font-medium">
                    {language === 'en' 
                      ? "⚠️ This is an ESTIMATE only. Call Ben now to get the exact price for your situation!"
                      : "⚠️ Esto es solo un ESTIMADO. ¡Llama a Ben ahora para obtener el precio exacto!"}
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* Primary CTA - CALL NOW */}
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    className="w-full py-6 text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]"
                    data-testid="call-for-exact-btn"
                  >
                    <Phone className="w-6 h-6" />
                    {language === 'en' ? 'Call Ben for Exact Price' : 'Llama a Ben por Precio Exacto'}
                  </a>
                  
                  {/* WhatsApp option */}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                      language === 'en' 
                        ? `Hi Ben! I need ${formData.serviceType?.replace('_', ' ')} service. My vehicle: ${formData.vehicleType}. Pickup: ${formData.pickupLocation}. Estimate showed: $${estimate.total_estimate.toFixed(2)}. What's the exact price?`
                        : `¡Hola Ben! Necesito servicio de ${formData.serviceType?.replace('_', ' ')}. Mi vehículo: ${formData.vehicleType}. Recogida: ${formData.pickupLocation}. El estimado mostró: $${estimate.total_estimate.toFixed(2)}. ¿Cuál es el precio exacto?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 text-base font-semibold bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all"
                    data-testid="whatsapp-for-exact-btn"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {language === 'en' ? 'WhatsApp Ben' : 'WhatsApp a Ben'}
                  </a>
                  
                  {/* Text option */}
                  <a
                    href={`sms:${PHONE_NUMBER}?body=${encodeURIComponent(
                      language === 'en' 
                        ? `Hi Ben! I need ${formData.serviceType?.replace('_', ' ')} service. My vehicle: ${formData.vehicleType}. Pickup: ${formData.pickupLocation}. Estimate showed: $${estimate.total_estimate.toFixed(2)}. What's the exact price?`
                        : `¡Hola Ben! Necesito servicio de ${formData.serviceType?.replace('_', ' ')}. Mi vehículo: ${formData.vehicleType}. Recogida: ${formData.pickupLocation}. El estimado mostró: $${estimate.total_estimate.toFixed(2)}. ¿Cuál es el precio exacto?`
                    )}`}
                    className="w-full py-4 text-base font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all"
                    data-testid="text-for-exact-btn"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {language === 'en' ? 'Or Text Ben' : 'O Envía un Texto a Ben'}
                  </a>
                  
                  <Button
                    onClick={() => setQuoteStep('form')}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    data-testid="modify-quote-btn"
                  >
                    {language === 'en' ? 'Modify Estimate' : 'Modificar Estimado'}
                  </Button>
                </div>
              </div>
            )}
            
            {quoteStep === 'submitted' && (
              <div className="text-center py-8 space-y-4" data-testid="quote-submitted">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('requestSubmitted')}</h3>
                <p className="text-gray-600">{t('contactSoon')}</p>
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold transition-colors shadow-lg shadow-orange-500/20"
                >
                  <Phone className="w-5 h-5" />
                  {t('callNow')} - {PHONE_DISPLAY}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 section-light" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <p className="text-orange-500 text-center font-semibold mb-2">{language === 'en' ? 'What We Offer' : 'Lo Que Ofrecemos'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            {t('servicesTitle')}
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            {language === 'en' ? 'From emergency roadside assistance to heavy-duty towing, we\'ve got you covered' : 'Desde asistencia de emergencia hasta grúa pesada, lo tenemos cubierto'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.key}
                  className="glass-card p-6 service-card"
                  data-testid={`service-card-${service.type}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{t(service.key)}</h3>
                  <p className="text-gray-600 text-sm mb-4">{t(`${service.key}Desc`)}</p>
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold text-sm group"
                  >
                    <Phone className="w-4 h-4" />
                    {t('callNow')}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 section-light" data-testid="why-us-section">
        <div className="max-w-7xl mx-auto">
          <p className="text-blue-500 text-center font-semibold mb-2">{language === 'en' ? 'Why Us' : 'Por Qué Nosotros'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">{t('whyChooseUs')}</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            {language === 'en' ? 'When you\'re stranded, you need a towing company you can trust' : 'Cuando estás varado, necesitas una grúa en la que puedas confiar'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {whyUs.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="text-center p-6 glass-card">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{t(item.key)}</h3>
                  <p className="text-gray-600 text-sm">{t(`${item.key}Desc`)}</p>
                </div>
              );
            })}
          </div>
          
          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1 mt-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 section-gray" data-testid="reviews-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">{t('reviewsTitle')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, index) => (
              <div key={index} className="glass-card p-6" data-testid={`review-card-${index}`}>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <p className="font-semibold text-gray-900">{review.name}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <a
              href="https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-gray-700 shadow-sm"
            >
              {t('readMoreReviews')}
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Our Fleet Gallery */}
      <section className="py-20 px-4 section-light" data-testid="gallery-section">
        <div className="max-w-7xl mx-auto">
          <p className="text-orange-500 text-center font-semibold mb-2">{language === 'en' ? 'Our Equipment' : 'Nuestro Equipo'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            {language === 'en' ? 'Our Fleet in Action' : 'Nuestra Flota en Acción'}
          </h2>
          <p className="text-gray-600 text-center mb-12">
            {language === 'en' ? 'Professional equipment ready to serve you 24/7' : 'Equipo profesional listo para servirle 24/7'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card overflow-hidden group">
              <img 
                src={CLIENT_IMAGES.flatbedDay} 
                alt="Flatbed towing service" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900">{t('flatbedTowing')}</h3>
                <p className="text-gray-600 text-sm">{language === 'en' ? 'Safe transport for all vehicles' : 'Transporte seguro para todos los vehículos'}</p>
              </div>
            </div>
            
            <div className="glass-card overflow-hidden group">
              <img 
                src={CLIENT_IMAGES.truckWithPickup} 
                alt="Heavy duty towing" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900">{language === 'en' ? 'Heavy Duty Capable' : 'Capacidad para Carga Pesada'}</h3>
                <p className="text-gray-600 text-sm">{language === 'en' ? 'Trucks, SUVs, and more' : 'Trocas, SUVs, y más'}</p>
              </div>
            </div>
            
            <div className="glass-card overflow-hidden group">
              <img 
                src={CLIENT_IMAGES.gasStation} 
                alt="24/7 Service" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900">{t('available247')}</h3>
                <p className="text-gray-600 text-sm">{language === 'en' ? 'Always ready when you need us' : 'Siempre listos cuando nos necesite'}</p>
              </div>
            </div>
            
            <div className="glass-card overflow-hidden group">
              <img 
                src={CLIENT_IMAGES.hero} 
                alt="Night emergency service" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900">{t('emergencyTowing')}</h3>
                <p className="text-gray-600 text-sm">{language === 'en' ? 'Day or night, we\'re there' : 'De día o de noche, estamos ahí'}</p>
              </div>
            </div>
            
            <div className="glass-card overflow-hidden group md:col-span-2">
              <img 
                src={CLIENT_IMAGES.truckCloseup} 
                alt="Ben's Road Service truck" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900">Ben's Road Service LLC</h3>
                <p className="text-gray-600 text-sm">{language === 'en' ? 'Professional, reliable, and ready to help' : 'Profesional, confiable, y listo para ayudar'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area Map */}
      <section className="py-20 px-4 section-dark" data-testid="service-area-section">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-400 text-center font-medium mb-2">{language === 'en' ? 'Coverage' : 'Cobertura'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('serviceAreaTitle')}</h2>
          <p className="text-gray-400 text-center mb-8">
            {language === 'en' 
              ? 'Serving Salem and up to 100 miles throughout Oregon!' 
              : '¡Sirviendo Salem y hasta 100 millas en todo Oregon!'}
          </p>
          
          <div className="glass-card p-4 md:p-8 border border-gray-700/50">
            <div className="aspect-video rounded-xl overflow-hidden mb-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1453451.7117904!2d-123.5!3d44.9428908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54bffefcbc4b9c63%3A0xf93429e08f0357c2!2sSalem%2C%20OR!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Service Area Map - 100 Mile Radius"
              />
            </div>
            <div className="text-center">
              <p className="text-gray-300 font-medium mb-2">
                {language === 'en' ? '100+ Mile Service Radius from Salem' : 'Radio de Servicio de 100+ Millas desde Salem'}
              </p>
              <p className="text-gray-400 text-sm">{t('serviceAreaCities')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Accident Assistance Section */}
      <section 
        className="py-20 px-4 relative"
        style={{
          backgroundImage: `url(${CLIENT_IMAGES.truckWithPickup})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="accident-section"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 to-gray-900/85" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('accidentTitle')}</h2>
          <p className="text-xl text-gray-300 mb-8">{t('accidentSubtitle')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span className="text-white">{t('insuranceWork')}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span className="text-white">{t('directBilling')}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span className="text-white">{t('policeDispatch')}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span className="text-white">{t('safeStorage')}</span>
            </div>
          </div>
          
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-gray-900 font-black text-xl uppercase tracking-wider shadow-2xl shadow-orange-500/30 transition-all cta-button hover:scale-105"
            data-testid="accident-call-btn"
          >
            <Phone className="w-6 h-6" />
            {t('callForHelp')}
          </a>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 section-light" data-testid="faq-section">
        <div className="max-w-3xl mx-auto">
          <p className="text-orange-500 text-center font-semibold mb-2">{language === 'en' ? 'Got Questions?' : '¿Tienes Preguntas?'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">{t('faqTitle')}</h2>
          <p className="text-gray-600 text-center mb-12">
            {language === 'en' ? 'Find answers to common questions about our towing services' : 'Encuentra respuestas a preguntas comunes sobre nuestros servicios'}
          </p>
          
          <Accordion type="single" collapsible className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <AccordionItem
                key={num}
                value={`item-${num}`}
                className="bg-white border border-gray-200 px-6 rounded-xl shadow-sm"
                data-testid={`faq-item-${num}`}
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:text-orange-500 text-gray-900 py-5">
                  {t(`faq${num}Q`)}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-base leading-relaxed pb-5">
                  {t(`faq${num}A`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section 
        className="py-24 px-4 relative"
        style={{
          backgroundImage: `url(${CLIENT_IMAGES.gasStation})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="final-cta-section"
      >
        <div className="absolute inset-0 bg-gray-900/85" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">{t('finalCtaTitle')}</h2>
          <p className="text-2xl text-gray-300 mb-10">{t('finalCtaSubtitle')}</p>
          
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="inline-flex items-center gap-4 px-12 py-6 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-gray-900 font-black text-2xl uppercase tracking-wider shadow-2xl shadow-orange-500/40 hover:scale-105 transition-transform cta-button animate-pulse-slow"
            data-testid="final-call-btn"
          >
            <Phone className="w-8 h-8" />
            {t('callNow')} - {PHONE_DISPLAY}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-700 bg-gray-900" data-testid="footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-center md:text-left">{t('footerText')}</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{t('weSpeak')}</span>
            <a
              href="/admin"
              className="text-gray-500 hover:text-gray-300 text-sm"
            >
              Admin
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Action Button - Expandable Help Menu */}
      <div className="fixed bottom-6 right-4 z-50" data-testid="fab-container">
        {/* Backdrop when open */}
        {fabOpen && (
          <div 
            className="fixed inset-0 bg-black/50 -z-10"
            onClick={() => setFabOpen(false)}
          />
        )}
        
        {/* Expanded Menu */}
        <div className={`absolute bottom-20 right-0 transition-all duration-300 ${fabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="bg-white rounded-2xl shadow-2xl p-4 min-w-[200px]">
            <p className="text-gray-500 text-xs font-medium mb-3 text-center">
              {language === 'en' ? 'How can we help?' : '¿Cómo podemos ayudarte?'}
            </p>
            
            <div className="space-y-2">
              {/* Call */}
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold transition-transform hover:scale-[1.02]"
                data-testid="fab-call"
                onClick={() => setFabOpen(false)}
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <span>{language === 'en' ? 'Call Now' : 'Llamar Ahora'}</span>
              </a>
              
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(language === 'en' ? 'Hi Ben! I need roadside assistance.' : '¡Hola Ben! Necesito asistencia en carretera.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-green-500 text-white font-semibold transition-transform hover:scale-[1.02]"
                data-testid="fab-whatsapp"
                onClick={() => setFabOpen(false)}
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span>WhatsApp</span>
              </a>
              
              {/* Text */}
              <a
                href={`sms:${PHONE_NUMBER}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-500 text-white font-semibold transition-transform hover:scale-[1.02]"
                data-testid="fab-text"
                onClick={() => setFabOpen(false)}
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span>{language === 'en' ? 'Text Message' : 'Mensaje de Texto'}</span>
              </a>
              
              {/* Send Location */}
              <button
                onClick={() => {
                  setFabOpen(false);
                  getEmergencyLocation();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500 text-white font-semibold transition-transform hover:scale-[1.02]"
                data-testid="fab-send-location"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span>{language === 'en' ? 'Send My Location' : 'Enviar Ubicación'}</span>
              </button>
              
              {/* Get Quote */}
              <a
                href="#quote"
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-700 text-white font-semibold transition-transform hover:scale-[1.02]"
                data-testid="fab-quote"
                onClick={() => setFabOpen(false)}
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span>{language === 'en' ? 'Get Estimate' : 'Obtener Cotización'}</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* Main FAB Button */}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            fabOpen 
              ? 'bg-gray-800 rotate-0' 
              : 'bg-gradient-to-r from-orange-500 to-red-500 animate-pulse'
          }`}
          data-testid="fab-main-btn"
        >
          {fabOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <div className="flex flex-col items-center">
              <HelpCircle className="w-7 h-7 text-white" />
              <span className="text-[8px] text-white font-bold mt-0.5">
                {language === 'en' ? 'HELP' : 'AYUDA'}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Emergency Location Sharing Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70" data-testid="location-modal">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                {isGettingEmergencyLocation ? (
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                ) : (
                  <MapPin className="w-8 h-8 text-red-500" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {language === 'en' ? 'Send My Location' : 'Enviar Mi Ubicación'}
              </h3>
              <p className="text-gray-600 mt-2">
                {isGettingEmergencyLocation 
                  ? (language === 'en' ? 'Finding your location...' : 'Buscando tu ubicación...')
                  : (language === 'en' ? 'Share your GPS location with Ben' : 'Comparte tu ubicación GPS con Ben')
                }
              </p>
            </div>
            
            {emergencyLocation && !isGettingEmergencyLocation && (
              <div className="space-y-4">
                {/* Location found */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-800 font-medium text-center">
                    📍 {emergencyLocation.address}
                  </p>
                </div>
                
                {/* Send via WhatsApp */}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(getEmergencyMessage('whatsapp'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center gap-3 transition-all"
                  data-testid="send-location-whatsapp"
                  onClick={() => setShowLocationModal(false)}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {language === 'en' ? 'Send via WhatsApp' : 'Enviar por WhatsApp'}
                </a>
                
                {/* Send via SMS */}
                <a
                  href={`sms:${PHONE_NUMBER}?body=${encodeURIComponent(getEmergencyMessage('sms'))}`}
                  className="w-full py-4 text-lg font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center gap-3 transition-all"
                  data-testid="send-location-sms"
                  onClick={() => setShowLocationModal(false)}
                >
                  <MessageSquare className="w-6 h-6" />
                  {language === 'en' ? 'Send via Text Message' : 'Enviar por Mensaje de Texto'}
                </a>
                
                {/* Call directly */}
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="w-full py-4 text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl flex items-center justify-center gap-3 transition-all"
                  data-testid="send-location-call"
                  onClick={() => setShowLocationModal(false)}
                >
                  <Phone className="w-6 h-6" />
                  {language === 'en' ? 'Or Just Call Ben' : 'O Solo Llama a Ben'}
                </a>
              </div>
            )}
            
            {/* Close button */}
            <button
              onClick={() => {
                setShowLocationModal(false);
                setEmergencyLocation(null);
              }}
              className="w-full mt-4 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              data-testid="close-location-modal"
            >
              {language === 'en' ? 'Cancel' : 'Cancelar'}
            </button>
          </div>
        </div>
      )}

      {/* FAQ Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [1, 2, 3, 4, 5, 6].map((num) => ({
              "@type": "Question",
              "name": t(`faq${num}Q`),
              "acceptedAnswer": {
                "@type": "Answer",
                "text": t(`faq${num}A`)
              }
            }))
          })
        }}
      />
    </div>
  );
}
