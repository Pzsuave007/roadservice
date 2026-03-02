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
    }
  }, [isLoggedIn, authHeader]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', icon: Clock, label: t('pending') },
      contacted: { class: 'status-contacted', icon: Phone, label: t('contacted') },
      completed: { class: 'status-completed', icon: CheckCircle, label: t('completed') },
      cancelled: { class: 'status-cancelled', icon: XCircle, label: t('cancelled') },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`status-badge ${badge.class} inline-flex items-center gap-1`}>
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="glass-card p-8 w-full max-w-md" data-testid="admin-login-form">
          <h1 className="text-2xl font-bold text-center mb-6">{t('adminLogin')}</h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="bg-zinc-950/50 border-zinc-800"
                data-testid="admin-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="bg-zinc-950/50 border-zinc-800"
                data-testid="admin-password"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600"
              data-testid="admin-login-btn"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('adminLogin')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-zinc-400 hover:text-white text-sm inline-flex items-center gap-2">
              <Home className="w-4 h-4" />
              {language === 'en' ? 'Back to Home' : 'Volver al Inicio'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">{t('adminDashboard')}</h1>
          <div className="flex items-center gap-4">
            <a href="/" className="text-zinc-400 hover:text-white text-sm inline-flex items-center gap-2">
              <Home className="w-4 h-4" />
            </a>
            <Button
              onClick={fetchQuotes}
              variant="outline"
              size="sm"
              disabled={isLoading}
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

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-6" data-testid="stat-total">
            <p className="text-zinc-400 text-sm mb-1">Total</p>
            <p className="text-3xl font-bold">{stats.total_quotes}</p>
          </div>
          <div className="glass-card p-6" data-testid="stat-pending">
            <p className="text-yellow-400 text-sm mb-1">{t('pending')}</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="glass-card p-6" data-testid="stat-contacted">
            <p className="text-blue-400 text-sm mb-1">{t('contacted')}</p>
            <p className="text-3xl font-bold text-blue-400">{stats.contacted}</p>
          </div>
          <div className="glass-card p-6" data-testid="stat-completed">
            <p className="text-green-400 text-sm mb-1">{t('completed')}</p>
            <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
          </div>
        </div>

        {/* Quotes Table */}
        <div className="glass-card overflow-hidden" data-testid="quotes-table">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-bold">{t('quoteRequests')}</h2>
          </div>
          
          {quotes.length === 0 ? (
            <div className="p-12 text-center text-zinc-500" data-testid="no-quotes">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('noQuotes')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Date</TableHead>
                    <TableHead className="text-zinc-400">Phone</TableHead>
                    <TableHead className="text-zinc-400">Service</TableHead>
                    <TableHead className="text-zinc-400">Vehicle</TableHead>
                    <TableHead className="text-zinc-400">Pickup</TableHead>
                    <TableHead className="text-zinc-400">Est. Price</TableHead>
                    <TableHead className="text-zinc-400">{t('status')}</TableHead>
                    <TableHead className="text-zinc-400">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow
                      key={quote.id}
                      className="border-zinc-800"
                      data-testid={`quote-row-${quote.id}`}
                    >
                      <TableCell className="text-zinc-300">
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
                          className="text-orange-400 hover:text-orange-300 flex items-center gap-1"
                        >
                          <Phone className="w-4 h-4" />
                          {quote.phone_number}
                        </a>
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {serviceTypeLabels[quote.service_type] || quote.service_type}
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {vehicleTypeLabels[quote.vehicle_type] || quote.vehicle_type}
                      </TableCell>
                      <TableCell className="text-zinc-300 max-w-[200px] truncate" title={quote.pickup_location}>
                        <MapPin className="w-4 h-4 inline mr-1 text-zinc-500" />
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
                            <SelectTrigger className="w-[130px] h-8 bg-zinc-900 border-zinc-700 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
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
    </div>
  );
}
