import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import {
  Phone,
  MapPin,
  Navigation,
  Truck,
  Clock,
  Loader2,
  AlertCircle,
  User,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LeadPage() {
  const { id } = useParams();
  const { language } = useLanguage();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await axios.get(`${API}/leads/${id}`);
        setLead(res.data);
      } catch (e) {
        setError(true);
      }
      setLoading(false);
    };
    fetchLead();
  }, [id]);

  const vehicleTypeLabels = {
    sedan: language === 'en' ? 'Car / Sedan' : 'Carro / Sedán',
    suv: 'SUV / Crossover',
    truck: language === 'en' ? 'Pickup Truck' : 'Troca / Pickup',
    motorcycle: language === 'en' ? 'Motorcycle' : 'Motocicleta',
    van: 'Van / Minivan',
    other: language === 'en' ? 'Other' : 'Otro',
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(language === 'en' ? 'en-US' : 'es-MX', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const mapsLink = (addr) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-700 animate-spin" data-testid="lead-loading" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md" data-testid="lead-not-found">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Request not found' : 'Solicitud no encontrada'}
          </h1>
          <p className="text-gray-600 text-sm">
            {language === 'en'
              ? 'This link is invalid or the request was removed.'
              : 'Este enlace no es válido o la solicitud fue eliminada.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4" data-testid="lead-detail-page">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-red-600 rounded-t-2xl px-6 py-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-6 h-6" />
            <span className="font-bold text-lg">Ben's Road Service LLC</span>
          </div>
          <p className="text-white/90 text-sm">
            {language === 'en' ? 'Customer Tow Request' : 'Solicitud de Grúa del Cliente'}
          </p>
        </div>

        {/* Tamper-proof badge */}
        <div className="bg-green-50 border-x border-green-200 px-6 py-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-green-800 text-xs font-medium">
            {language === 'en'
              ? 'Official record saved by the system. The customer cannot edit these details.'
              : 'Registro oficial guardado por el sistema. El cliente no puede editar estos datos.'}
          </p>
        </div>

        {/* Body */}
        <div className="bg-white rounded-b-2xl shadow-lg px-6 py-6 space-y-5">
          {/* Customer */}
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {language === 'en' ? 'Customer' : 'Cliente'}
              </p>
              <p className="text-gray-900 font-semibold text-lg" data-testid="lead-name">{lead.name}</p>
            </div>
          </div>

          {/* Phone */}
          <a
            href={`tel:${lead.phone_number}`}
            className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 hover:bg-blue-100 transition-colors"
            data-testid="lead-call-link"
          >
            <Phone className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {language === 'en' ? 'Tap to call' : 'Toca para llamar'}
              </p>
              <p className="text-blue-700 font-semibold text-lg">{lead.phone_number}</p>
            </div>
          </a>

          {/* Distance - source of truth */}
          <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between" data-testid="lead-distance">
            <div className="flex items-center gap-2 text-white">
              <Navigation className="w-5 h-5" />
              <span className="font-medium">
                {language === 'en' ? 'Distance' : 'Distancia'}
              </span>
            </div>
            <span className="text-white font-bold text-2xl">
              {lead.distance_miles != null
                ? `${lead.distance_miles} ${language === 'en' ? 'mi' : 'mi'}`
                : (language === 'en' ? 'N/A' : 'N/D')}
            </span>
          </div>

          {/* Vehicle */}
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {language === 'en' ? 'Vehicle' : 'Vehículo'}
              </p>
              <p className="text-gray-900 font-medium">
                {vehicleTypeLabels[lead.vehicle_type] || lead.vehicle_type}
              </p>
            </div>
          </div>

          {/* Pickup */}
          <a
            href={mapsLink(lead.pickup_location)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 group"
            data-testid="lead-pickup-link"
          >
            <MapPin className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {language === 'en' ? 'Pickup Location' : 'Ubicación de Recogida'}
              </p>
              <p className="text-gray-900 font-medium group-hover:text-red-700 inline-flex items-center gap-1">
                {lead.pickup_location}
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </p>
            </div>
          </a>

          {/* Dropoff */}
          {lead.dropoff_location ? (
            <a
              href={mapsLink(lead.dropoff_location)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 group"
              data-testid="lead-dropoff-link"
            >
              <Navigation className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {language === 'en' ? 'Drop-off Location' : 'Destino'}
                </p>
                <p className="text-gray-900 font-medium group-hover:text-green-700 inline-flex items-center gap-1">
                  {lead.dropoff_location}
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </p>
              </div>
            </a>
          ) : null}

          {/* Photo */}
          {lead.photo_url ? (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                {language === 'en' ? 'Vehicle Photo' : 'Foto del Vehículo'}
              </p>
              <a href={lead.photo_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={lead.photo_url}
                  alt="Vehicle"
                  className="w-full rounded-xl border border-gray-200"
                  data-testid="lead-photo"
                />
              </a>
            </div>
          ) : null}

          {/* Timestamp */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <p className="text-gray-500 text-xs" data-testid="lead-timestamp">
              {language === 'en' ? 'Submitted: ' : 'Enviado: '}
              {formatDate(lead.created_at)}
            </p>
          </div>
        </div>

        {/* Call CTA */}
        <a
          href={`tel:${lead.phone_number}`}
          className="mt-4 w-full py-4 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg transition-all"
          data-testid="lead-call-cta"
        >
          <Phone className="w-5 h-5" />
          {language === 'en' ? `Call ${lead.name}` : `Llamar a ${lead.name}`}
        </a>
      </div>
    </div>
  );
}
