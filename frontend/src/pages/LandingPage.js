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
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const PHONE_NUMBER = '9713886300';
const PHONE_DISPLAY = '(971) 388-6300';

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sticky Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-400">
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-bold">{t('openNow')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors text-sm font-medium"
              data-testid="language-toggle"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'ES' : 'EN'}</span>
            </button>
            
            <a
              href={`sms:${PHONE_NUMBER}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-400 transition-colors font-medium"
              data-testid="header-text-btn"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">{t('textUs')}</span>
            </a>
            
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-gray-900 font-bold transition-all emergency-glow hover:scale-105"
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
          backgroundImage: `url(${CLIENT_IMAGES.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 hero-overlay" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {language === 'en' ? 'Available Now - Dispatching' : 'Disponible Ahora - Despachando'}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
              <span className="text-gradient">{t('heroTitle')}</span>
            </h1>
            <p className="text-2xl md:text-4xl font-bold text-white">
              {t('heroSubtitle')}
            </p>
            <p className="text-xl md:text-2xl text-gray-300">
              {t('heroTagline')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-gray-900 font-black text-xl uppercase tracking-wider shadow-2xl shadow-orange-500/30 hover:scale-105 transition-transform cta-button emergency-glow"
                data-testid="hero-call-btn"
              >
                <Phone className="w-6 h-6" />
                {t('callNow')}
              </a>
              <a
                href="#quote"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all cta-button"
                data-testid="hero-quote-btn"
              >
                <FileText className="w-5 h-5" />
                {t('getQuote')}
              </a>
            </div>
            
            <p className="text-gray-300 pt-4 flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              {t('servingArea')}
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
              <Badge variant="outline" className="px-5 py-2.5 border-green-400/50 text-green-400 bg-green-500/10 font-medium">
                <Shield className="w-4 h-4 mr-2" />
                {t('licensed')}
              </Badge>
              <Badge variant="outline" className="px-5 py-2.5 border-blue-400/50 text-blue-400 bg-blue-500/10 font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('insured')}
              </Badge>
              <Badge variant="outline" className="px-5 py-2.5 border-orange-400/50 text-orange-400 bg-orange-500/10 font-medium">
                <Clock className="w-4 h-4 mr-2" />
                {t('available247')}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 section-light" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <p className="text-orange-400 text-center font-medium mb-2">{language === 'en' ? 'What We Offer' : 'Lo Que Ofrecemos'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t('servicesTitle')}
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            {language === 'en' ? 'From emergency roadside assistance to heavy-duty towing, we\'ve got you covered' : 'Desde asistencia de emergencia hasta grúa pesada, lo tenemos cubierto'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.key}
                  className="glass-card p-6 service-card border border-gray-700/50 hover:border-orange-400/50"
                  data-testid={`service-card-${service.type}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                    <Icon className="w-7 h-7 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{t(service.key)}</h3>
                  <p className="text-gray-400 text-sm mb-4">{t(`${service.key}Desc`)}</p>
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-semibold text-sm group"
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

      {/* Quote Calculator Section */}
      <section id="quote" className="py-20 px-4 section-dark" data-testid="quote-section">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('quoteTitle')}</h2>
            <p className="text-gray-400">{t('quoteSubtitle')}</p>
          </div>
          
          <div className="glass-card p-8 border border-gray-700/50">
            {quoteStep === 'form' && (
              <div className="space-y-6 quote-form" data-testid="quote-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pickup" className="text-gray-300">{t('pickupLocation')} *</Label>
                    <Input
                      id="pickup"
                      placeholder="e.g., 123 Main St, Salem OR"
                      value={formData.pickupLocation}
                      onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                      className="bg-gray-800/50 border-gray-600 focus:border-orange-400 text-white placeholder:text-gray-500"
                      data-testid="pickup-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dropoff" className="text-gray-300">{t('dropoffLocation')}</Label>
                    <Input
                      id="dropoff"
                      placeholder="e.g., 456 Oak Ave, Salem OR"
                      value={formData.dropoffLocation}
                      onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                      className="bg-gray-800/50 border-gray-600 focus:border-orange-400 text-white placeholder:text-gray-500"
                      data-testid="dropoff-input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">{t('vehicleType')} *</Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value) => handleInputChange('vehicleType', value)}
                    >
                      <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white" data-testid="vehicle-select">
                        <SelectValue placeholder={t('vehicleType')} />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="sedan" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('sedan')}</SelectItem>
                        <SelectItem value="suv" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('suv')}</SelectItem>
                        <SelectItem value="truck" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('truck')}</SelectItem>
                        <SelectItem value="motorcycle" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('motorcycle')}</SelectItem>
                        <SelectItem value="van" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('van')}</SelectItem>
                        <SelectItem value="other" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">{t('serviceNeeded')} *</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => handleInputChange('serviceType', value)}
                    >
                      <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white" data-testid="service-select">
                        <SelectValue placeholder={t('serviceNeeded')} />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="emergency_towing" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('emergencyTowing')}</SelectItem>
                        <SelectItem value="flatbed_towing" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('flatbedTowing')}</SelectItem>
                        <SelectItem value="accident_recovery" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('accidentRecovery')}</SelectItem>
                        <SelectItem value="lockout" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('lockoutService')}</SelectItem>
                        <SelectItem value="jump_start" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('jumpStart')}</SelectItem>
                        <SelectItem value="tire_change" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('tireChange')}</SelectItem>
                        <SelectItem value="long_distance" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('longDistance')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">{t('phoneNumber')} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="bg-gray-800/50 border-gray-600 focus:border-orange-400 text-white placeholder:text-gray-500"
                      data-testid="phone-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance" className="text-gray-300">{t('estimatedDistance')}</Label>
                    <Input
                      id="distance"
                      type="number"
                      min="1"
                      max="500"
                      value={formData.estimatedDistance}
                      onChange={(e) => handleInputChange('estimatedDistance', parseInt(e.target.value) || 10)}
                      className="bg-gray-800/50 border-gray-600 focus:border-orange-400 text-white"
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
                        ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500 shadow-lg shadow-orange-500/10'
                        : 'bg-gray-700 text-gray-400 border-2 border-transparent'
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
                        ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500 shadow-lg shadow-blue-500/10'
                        : 'bg-gray-700 text-gray-400 border-2 border-transparent'
                    }`}
                    data-testid="scheduled-btn"
                  >
                    {t('scheduledService')}
                  </button>
                </div>
                
                <Button
                  onClick={getEstimate}
                  disabled={isSubmitting}
                  className="w-full py-6 text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-gray-900 shadow-lg shadow-orange-500/20"
                  data-testid="get-estimate-btn"
                >
                  {isSubmitting ? t('submitting') : t('getEstimate')}
                </Button>
              </div>
            )}
            
            {quoteStep === 'estimate' && estimate && (
              <div className="space-y-6" data-testid="quote-estimate">
                <h3 className="text-2xl font-bold text-center">{t('estimateTitle')}</h3>
                
                <div className="bg-gray-800/80 rounded-xl p-6 space-y-4 border border-gray-700">
                  <div className="flex justify-between text-gray-300">
                    <span>{t('basePrice')}</span>
                    <span className="font-medium">${estimate.base_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{t('mileageCharge')} ({estimate.distance_miles} mi)</span>
                    <span className="font-medium">${estimate.mileage_charge.toFixed(2)}</span>
                  </div>
                  {estimate.emergency_fee > 0 && (
                    <div className="flex justify-between text-gray-300">
                      <span>{t('emergencyFee')}</span>
                      <span className="font-medium">${estimate.emergency_fee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-600 pt-4 flex justify-between text-2xl font-bold">
                    <span>{t('totalEstimate')}</span>
                    <span className="text-gradient">${estimate.total_estimate.toFixed(2)}</span>
                  </div>
                </div>
                
                <p className="text-gray-500 text-sm text-center">{t('estimateNote')}</p>
                
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={submitRequest}
                    disabled={isSubmitting}
                    className="w-full py-6 text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-gray-900"
                    data-testid="confirm-request-btn"
                  >
                    {isSubmitting ? t('submitting') : t('confirmRequest')}
                  </Button>
                  <Button
                    onClick={() => setQuoteStep('form')}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    {language === 'en' ? 'Modify Quote' : 'Modificar Cotización'}
                  </Button>
                </div>
              </div>
            )}
            
            {quoteStep === 'submitted' && (
              <div className="text-center py-8 space-y-4" data-testid="quote-submitted">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border-2 border-green-500">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold">{t('requestSubmitted')}</h3>
                <p className="text-gray-400">{t('contactSoon')}</p>
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-gray-900 font-bold transition-colors shadow-lg shadow-orange-500/20"
                >
                  <Phone className="w-5 h-5" />
                  {t('callNow')} - {PHONE_DISPLAY}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 section-light" data-testid="why-us-section">
        <div className="max-w-7xl mx-auto">
          <p className="text-blue-400 text-center font-medium mb-2">{language === 'en' ? 'Why Us' : 'Por Qué Nosotros'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('whyChooseUs')}</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            {language === 'en' ? 'When you\'re stranded, you need a towing company you can trust' : 'Cuando estás varado, necesitas una grúa en la que puedas confiar'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {whyUs.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="text-center p-6 glass-card border border-gray-700/50">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{t(item.key)}</h3>
                  <p className="text-gray-400 text-sm">{t(`${item.key}Desc`)}</p>
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
      <section className="py-20 px-4 section-dark" data-testid="reviews-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('reviewsTitle')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, index) => (
              <div key={index} className="glass-card p-6 border border-gray-700/50" data-testid={`review-card-${index}`}>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{review.text}"</p>
                <p className="font-semibold text-white">{review.name}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <a
              href="https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors font-medium"
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
          <p className="text-orange-400 text-center font-medium mb-2">{language === 'en' ? 'Our Equipment' : 'Nuestro Equipo'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {language === 'en' ? 'Our Fleet in Action' : 'Nuestra Flota en Acción'}
          </h2>
          <p className="text-gray-400 text-center mb-12">
            {language === 'en' ? 'Professional equipment ready to serve you 24/7' : 'Equipo profesional listo para servirle 24/7'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card overflow-hidden group border border-gray-700/50 hover:border-orange-400/50 transition-all">
              <img 
                src={CLIENT_IMAGES.flatbedDay} 
                alt="Flatbed towing service" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-white">{t('flatbedTowing')}</h3>
                <p className="text-gray-400 text-sm">{language === 'en' ? 'Safe transport for all vehicles' : 'Transporte seguro para todos los vehículos'}</p>
              </div>
            </div>
            
            <div className="glass-card overflow-hidden group border border-gray-700/50 hover:border-orange-400/50 transition-all">
              <img 
                src={CLIENT_IMAGES.truckWithPickup} 
                alt="Heavy duty towing" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-white">{language === 'en' ? 'Heavy Duty Capable' : 'Capacidad para Carga Pesada'}</h3>
                <p className="text-gray-400 text-sm">{language === 'en' ? 'Trucks, SUVs, and more' : 'Trocas, SUVs, y más'}</p>
              </div>
            </div>
            
            <div className="glass-card overflow-hidden group border border-gray-700/50 hover:border-orange-400/50 transition-all">
              <img 
                src={CLIENT_IMAGES.gasStation} 
                alt="24/7 Service" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-white">{t('available247')}</h3>
                <p className="text-gray-400 text-sm">{language === 'en' ? 'Always ready when you need us' : 'Siempre listos cuando nos necesite'}</p>
              </div>
            </div>
            
            <div className="glass-card overflow-hidden group border border-gray-700/50 hover:border-orange-400/50 transition-all">
              <img 
                src={CLIENT_IMAGES.hero} 
                alt="Night emergency service" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-white">{t('emergencyTowing')}</h3>
                <p className="text-gray-400 text-sm">{language === 'en' ? 'Day or night, we\'re there' : 'De día o de noche, estamos ahí'}</p>
              </div>
            </div>
            
            <div className="glass-card overflow-hidden group md:col-span-2 border border-gray-700/50 hover:border-orange-400/50 transition-all">
              <img 
                src={CLIENT_IMAGES.truckCloseup} 
                alt="Ben's Road Service truck" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-white">Ben's Road Service LLC</h3>
                <p className="text-gray-400 text-sm">{language === 'en' ? 'Professional, reliable, and ready to help' : 'Profesional, confiable, y listo para ayudar'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area Map */}
      <section className="py-20 px-4 section-dark" data-testid="service-area-section">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-400 text-center font-medium mb-2">{language === 'en' ? 'Coverage' : 'Cobertura'}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">{t('serviceAreaTitle')}</h2>
          
          <div className="glass-card p-4 md:p-8 border border-gray-700/50">
            <div className="aspect-video rounded-xl overflow-hidden mb-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d181814.71477384583!2d-123.14837282813!3d44.9428908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54bffefcbc4b9c63%3A0xf93429e08f0357c2!2sSalem%2C%20OR!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Service Area Map"
              />
            </div>
            <p className="text-center text-gray-400">{t('serviceAreaCities')}</p>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('faqTitle')}</h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <AccordionItem
                key={num}
                value={`item-${num}`}
                className="glass-card border border-gray-700/50 px-6 rounded-xl"
                data-testid={`faq-item-${num}`}
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-orange-400 text-white">
                  {t(`faq${num}Q`)}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
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

      {/* Floating Action Buttons (Mobile) */}
      <div className="fab-container md:hidden" data-testid="fab-container">
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-orange-500/40"
          aria-label={t('callNow')}
          data-testid="fab-call"
        >
          <Phone className="w-6 h-6 text-gray-900" />
        </a>
        <a
          href={`sms:${PHONE_NUMBER}`}
          className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
          aria-label={t('textUs')}
          data-testid="fab-text"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </a>
        <a
          href="https://maps.google.com/?q=Salem,+OR"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center shadow-lg"
          aria-label={t('getDirections')}
          data-testid="fab-directions"
        >
          <Navigation className="w-6 h-6 text-white" />
        </a>
        <a
          href="#quote"
          className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center shadow-lg"
          aria-label={t('getQuote')}
          data-testid="fab-quote"
        >
          <FileText className="w-6 h-6 text-white" />
        </a>
      </div>

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
