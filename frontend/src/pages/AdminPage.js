import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { toast } from 'sonner';
import {
  LogOut,
  RefreshCw,
  Phone,
  MapPin,
  Clock,
  Truck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Home,
  Settings,
  DollarSign,
  Save,
  FileText,
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authHeader, setAuthHeader] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [stats, setStats] = useState({ total_quotes: 0, pending: 0, contacted: 0, completed: 0 });
  const [activeTab, setActiveTab] = useState('quotes'); // 'quotes' or 'settings'
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const basicAuth = btoa(`${credentials.username}:${credentials.password}`);
    const header = `Basic ${basicAuth}`;
    
    try {
      await axios.get(`${API}/admin/quotes`, {
        headers: { Authorization: header }
      });
      setAuthHeader(header);
      setIsLoggedIn(true);
      localStorage.setItem('adminAuth', header);
      toast.success(language === 'en' ? 'Login successful' : 'Inicio de sesión exitoso');
    } catch (error) {
      toast.error(language === 'en' ? 'Invalid credentials' : 'Credenciales inválidas');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthHeader('');
    setQuotes([]);
    setSettings(null);
    localStorage.removeItem('adminAuth');
  };

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const [quotesRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/quotes`, { headers: { Authorization: authHeader } }),
        axios.get(`${API}/admin/stats`, { headers: { Authorization: authHeader } })
      ]);
      setQuotes(quotesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error(language === 'en' ? 'Error fetching data' : 'Error al obtener datos');
    }
    setIsLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/admin/settings`, {
        headers: { Authorization: authHeader }
      });
      setSettings(res.data);
    } catch (error) {
      toast.error(language === 'en' ? 'Error fetching settings' : 'Error al obtener configuración');
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${API}/admin/settings`, settings, {
        headers: { Authorization: authHeader }
      });
      toast.success(language === 'en' ? 'Settings saved!' : '¡Configuración guardada!');
    } catch (error) {
      toast.error(language === 'en' ? 'Error saving settings' : 'Error al guardar');
    }
    setIsSaving(false);
  };

  const updateStatus = async (quoteId, newStatus) => {
    try {
      await axios.patch(
        `${API}/admin/quotes/${quoteId}`,
        { status: newStatus },
        { headers: { Authorization: authHeader } }
      );
      toast.success(language === 'en' ? 'Status updated' : 'Estado actualizado');
      fetchQuotes();
    } catch (error) {
      toast.error(language === 'en' ? 'Error updating status' : 'Error al actualizar estado');
    }
  };

  const deleteQuote = async (quoteId) => {
    if (!window.confirm(language === 'en' ? 'Delete this quote?' : '¿Eliminar esta cotización?')) return;
    
    try {
      await axios.delete(`${API}/admin/quotes/${quoteId}`, {
        headers: { Authorization: authHeader }
      });
      toast.success(language === 'en' ? 'Quote deleted' : 'Cotización eliminada');
      fetchQuotes();
    } catch (error) {
      toast.error(language === 'en' ? 'Error deleting quote' : 'Error al eliminar');
    }
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      setAuthHeader(savedAuth);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && authHeader) {
      fetchQuotes();
      fetchSettings();
    }
  }, [isLoggedIn, authHeader]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: t('pending') },
      contacted: { class: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Phone, label: t('contacted') },
      completed: { class: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: t('completed') },
      cancelled: { class: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: t('cancelled') },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${badge.class}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'en' ? 'en-US' : 'es-MX', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const vehicleTypeLabels = {
    sedan: language === 'en' ? 'Sedan' : 'Sedán',
    suv: 'SUV',
    truck: language === 'en' ? 'Truck' : 'Troca',
    motorcycle: language === 'en' ? 'Motorcycle' : 'Motocicleta',
    van: 'Van',
    other: language === 'en' ? 'Other' : 'Otro',
  };

  const serviceTypeLabels = {
    emergency_towing: t('emergencyTowing'),
    flatbed_towing: t('flatbedTowing'),
    accident_recovery: t('accidentRecovery'),
    lockout: t('lockoutService'),
    jump_start: t('jumpStart'),
    tire_change: t('tireChange'),
    long_distance: t('longDistance'),
  };

  const updateSettingsField = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateBasePrice = (service, value) => {
    setSettings(prev => ({
      ...prev,
      base_prices: { ...prev.base_prices, [service]: parseFloat(value) || 0 }
    }));
  };

  const updateVehicleMultiplier = (vehicle, value) => {
    setSettings(prev => ({
      ...prev,
      vehicle_multipliers: { ...prev.vehicle_multipliers, [vehicle]: parseFloat(value) || 1 }
    }));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-xl" data-testid="admin-login-form">
          <h1 className="text-2xl font-bold text-center mb-6 text-white">{t('adminLogin')}</h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="bg-gray-900 border-gray-600 text-white"
                data-testid="admin-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="bg-gray-900 border-gray-600 text-white"
                data-testid="admin-password"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700"
              data-testid="admin-login-btn"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('adminLogin')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-gray-400 hover:text-white text-sm inline-flex items-center gap-2">
              <Home className="w-4 h-4" />
              {language === 'en' ? 'Back to Home' : 'Volver al Inicio'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-4 bg-gray-900/95 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">{t('adminDashboard')}</h1>
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-400 hover:text-white text-sm inline-flex items-center gap-2">
              <Home className="w-4 h-4" />
            </a>
            <Button
              onClick={fetchQuotes}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="border-gray-600"
              data-testid="refresh-btn"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'quotes'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            {language === 'en' ? 'Quote Requests' : 'Cotizaciones'}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'settings'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            {language === 'en' ? 'Settings' : 'Configuración'}
          </button>
        </div>
      </div>

      {/* Quotes Tab */}
      {activeTab === 'quotes' && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6" data-testid="stat-total">
              <p className="text-gray-400 text-sm mb-1">Total</p>
              <p className="text-3xl font-bold">{stats.total_quotes}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6" data-testid="stat-pending">
              <p className="text-yellow-400 text-sm mb-1">{t('pending')}</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6" data-testid="stat-contacted">
              <p className="text-blue-400 text-sm mb-1">{t('contacted')}</p>
              <p className="text-3xl font-bold text-blue-400">{stats.contacted}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6" data-testid="stat-completed">
              <p className="text-green-400 text-sm mb-1">{t('completed')}</p>
              <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
            </div>
          </div>

          {/* Quotes Table */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden" data-testid="quotes-table">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold">{t('quoteRequests')}</h2>
            </div>
            
            {quotes.length === 0 ? (
              <div className="p-12 text-center text-gray-500" data-testid="no-quotes">
                <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('noQuotes')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-transparent">
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Phone</TableHead>
                      <TableHead className="text-gray-400">Service</TableHead>
                      <TableHead className="text-gray-400">Vehicle</TableHead>
                      <TableHead className="text-gray-400">Pickup</TableHead>
                      <TableHead className="text-gray-400">Est. Price</TableHead>
                      <TableHead className="text-gray-400">{t('status')}</TableHead>
                      <TableHead className="text-gray-400">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow
                        key={quote.id}
                        className="border-gray-700"
                        data-testid={`quote-row-${quote.id}`}
                      >
                        <TableCell className="text-gray-300">
                          {formatDate(quote.created_at)}
                          {quote.is_emergency && (
                            <span className="ml-2 text-red-400" title="Emergency">
                              <AlertTriangle className="w-4 h-4 inline" />
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`tel:${quote.phone_number}`}
                            className="text-red-400 hover:text-red-300 flex items-center gap-1"
                          >
                            <Phone className="w-4 h-4" />
                            {quote.phone_number}
                          </a>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {serviceTypeLabels[quote.service_type] || quote.service_type}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {vehicleTypeLabels[quote.vehicle_type] || quote.vehicle_type}
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-[200px] truncate" title={quote.pickup_location}>
                          <MapPin className="w-4 h-4 inline mr-1 text-gray-500" />
                          {quote.pickup_location}
                        </TableCell>
                        <TableCell className="text-green-400 font-semibold">
                          ${quote.estimated_price?.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(quote.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={quote.status}
                              onValueChange={(value) => updateStatus(quote.id, value)}
                            >
                              <SelectTrigger className="w-[130px] h-8 bg-gray-900 border-gray-600 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="pending">{t('pending')}</SelectItem>
                                <SelectItem value="contacted">{t('contacted')}</SelectItem>
                                <SelectItem value="completed">{t('completed')}</SelectItem>
                                <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuote(quote.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="max-w-4xl mx-auto px-4 pb-6">
          {/* Contact Info */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-400" />
              {language === 'en' ? 'Contact Information' : 'Información de Contacto'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">{language === 'en' ? 'Phone Number (digits only)' : 'Número de Teléfono (solo dígitos)'}</Label>
                <Input
                  value={settings.phone_number}
                  onChange={(e) => updateSettingsField('phone_number', e.target.value)}
                  className="bg-gray-900 border-gray-600 text-white"
                  placeholder="9713886300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{language === 'en' ? 'Display Format' : 'Formato de Visualización'}</Label>
                <Input
                  value={settings.phone_display}
                  onChange={(e) => updateSettingsField('phone_display', e.target.value)}
                  className="bg-gray-900 border-gray-600 text-white"
                  placeholder="(971) 388-6300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{language === 'en' ? 'Company Name' : 'Nombre de la Empresa'}</Label>
                <Input
                  value={settings.company_name}
                  onChange={(e) => updateSettingsField('company_name', e.target.value)}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{language === 'en' ? 'Service Area' : 'Área de Servicio'}</Label>
                <Input
                  value={settings.service_area}
                  onChange={(e) => updateSettingsField('service_area', e.target.value)}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              {language === 'en' ? 'Pricing Settings' : 'Configuración de Precios'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-gray-300">{language === 'en' ? 'Price per Mile ($)' : 'Precio por Milla ($)'}</Label>
                <Input
                  type="number"
                  step="0.25"
                  value={settings.mileage_rate}
                  onChange={(e) => updateSettingsField('mileage_rate', parseFloat(e.target.value) || 0)}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{language === 'en' ? 'Emergency Fee ($)' : 'Tarifa de Emergencia ($)'}</Label>
                <Input
                  type="number"
                  step="5"
                  value={settings.emergency_fee}
                  onChange={(e) => updateSettingsField('emergency_fee', parseFloat(e.target.value) || 0)}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
            </div>

            <h3 className="font-semibold mb-3 text-gray-300">{language === 'en' ? 'Base Prices by Service' : 'Precios Base por Servicio'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {Object.entries(settings.base_prices || {}).map(([service, price]) => (
                <div key={service} className="space-y-1">
                  <Label className="text-gray-400 text-xs capitalize">{service.replace('_', ' ')}</Label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-1">$</span>
                    <Input
                      type="number"
                      step="5"
                      value={price}
                      onChange={(e) => updateBasePrice(service, e.target.value)}
                      className="bg-gray-900 border-gray-600 text-white h-9"
                    />
                  </div>
                </div>
              ))}
            </div>

            <h3 className="font-semibold mb-3 text-gray-300">{language === 'en' ? 'Vehicle Multipliers' : 'Multiplicadores por Vehículo'}</h3>
            <p className="text-gray-500 text-sm mb-3">
              {language === 'en' 
                ? '1.0 = base price, 1.25 = 25% more, 0.85 = 15% discount' 
                : '1.0 = precio base, 1.25 = 25% más, 0.85 = 15% descuento'}
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(settings.vehicle_multipliers || {}).map(([vehicle, multiplier]) => (
                <div key={vehicle} className="space-y-1">
                  <Label className="text-gray-400 text-xs capitalize">{vehicle}</Label>
                  <Input
                    type="number"
                    step="0.05"
                    value={multiplier}
                    onChange={(e) => updateVehicleMultiplier(vehicle, e.target.value)}
                    className="bg-gray-900 border-gray-600 text-white h-9"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {language === 'en' ? 'Save All Settings' : 'Guardar Configuración'}
          </Button>

          <p className="text-gray-500 text-sm text-center mt-4">
            {language === 'en' 
              ? 'Changes will take effect immediately on the website.' 
              : 'Los cambios se aplicarán inmediatamente en el sitio web.'}
          </p>
        </div>
      )}
    </div>
  );
}
