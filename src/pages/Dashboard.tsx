import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserQRCodes, deleteQRCode, updateQRStatus, type SavedQRCode } from '../services/qrCodeService';
import { QrCode, Trash2, Eye, Download, Copy, Calendar, BarChart3, Plus, ExternalLink, Edit, Search, Filter } from 'lucide-react';
import { createQRCode, downloadQRCode } from '../utils/qrCode';
import type { QRConfig } from '../types';

interface DashboardProps {
  onCreateNew: () => void;
  onEditQR?: (qr: SavedQRCode) => void;
  onViewAnalytics?: (qrId: string) => void;
}

export const Dashboard = ({ onCreateNew, onEditQR, onViewAnalytics }: DashboardProps) => {
  const { user } = useAuth();
  const [qrCodes, setQrCodes] = useState<SavedQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadQRCodes();
  }, [user]);

  const loadQRCodes = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await getUserQRCodes(user.id);
    
    if (!error && data) {
      setQrCodes(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this QR code?')) return;
    
    const { error } = await deleteQRCode(id);
    if (!error) {
      loadQRCodes();
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistically update UI
      setQrCodes(qrCodes.map(qr => 
        qr.id === id ? { ...qr, is_active: !currentStatus } : qr
      ));
      
      const { error } = await updateQRStatus(id, !currentStatus);
      
      if (error) {
        // Revert on error
        setQrCodes(qrCodes.map(qr => 
          qr.id === id ? { ...qr, is_active: currentStatus } : qr
        ));
        alert('Failed to update QR code status: ' + error.message);
      }
    } catch (error) {
      // Revert on error
      setQrCodes(qrCodes.map(qr => 
        qr.id === id ? { ...qr, is_active: currentStatus } : qr
      ));
      console.error('Error toggling QR code status:', error);
      alert('Failed to update QR code status');
    }
  };

  const handleDownload = async (qr: SavedQRCode) => {
    const config: QRConfig = {
      type: qr.qr_type as any,
      value: qr.content.value,
      size: qr.design_settings.size || 300,
      bgColor: qr.design_settings.bgColor || '#ffffff',
      fgColor: qr.design_settings.fgColor || '#000000',
      errorCorrectionLevel: qr.design_settings.errorCorrectionLevel || 'M',
      dotStyle: qr.design_settings.dotStyle || 'square',
      cornerSquareStyle: qr.design_settings.cornerSquareStyle || 'square',
      cornerDotStyle: qr.design_settings.cornerDotStyle || 'square',
      logo: qr.design_settings.logo,
      logoSize: qr.design_settings.logoSize || 40,
      format: 'png',
    };

    const qrCode = createQRCode(config);
    await downloadQRCode(qrCode, 'png', qr.title);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your QR codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My QR Codes</h1>
              <p className="text-gray-600">Manage and track your QR codes</p>
            </div>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create New QR Code
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, type, or short code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Filter by Type */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="website">Website</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="text">Text</option>
                <option value="wifi">WiFi</option>
                <option value="location">Location</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
            </div>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {qrCodes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 p-4 rounded-full">
                <QrCode className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No QR Codes Yet</h3>
            <p className="text-gray-600 mb-6">Create your first QR code to get started</p>
            <div className="flex justify-center">
              <button
                onClick={onCreateNew}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create New QR Code
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes
              .filter((qr) => {
                // Search filter
                const matchesSearch = searchQuery === '' || 
                  qr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  qr.qr_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  qr.short_code.toLowerCase().includes(searchQuery.toLowerCase());
                
                // Type filter
                const matchesType = filterType === 'all' || qr.qr_type === filterType;
                
                // Status filter
                const matchesStatus = filterStatus === 'all' || 
                  (filterStatus === 'active' && qr.is_active) ||
                  (filterStatus === 'inactive' && !qr.is_active);
                
                return matchesSearch && matchesType && matchesStatus;
              })
              .map((qr) => {
              const qrConfig: QRConfig = {
                type: qr.qr_type as any,
                value: qr.content.value,
                size: qr.design_settings.size || 300,
                bgColor: qr.design_settings.bgColor || '#ffffff',
                fgColor: qr.design_settings.fgColor || '#000000',
                errorCorrectionLevel: qr.design_settings.errorCorrectionLevel || 'M',
                dotStyle: qr.design_settings.dotStyle || 'square',
                cornerSquareStyle: qr.design_settings.cornerSquareStyle || 'square',
                cornerDotStyle: qr.design_settings.cornerDotStyle || 'square',
                logo: qr.design_settings.logo,
                logoSize: qr.design_settings.logoSize || 40,
                format: 'png',
              };
              
              return (
                <QRCodeCard
                  key={qr.id}
                  qr={qr}
                  config={qrConfig}
                  onDownload={() => handleDownload(qr)}
                  onDelete={() => handleDelete(qr.id)}
                  onEdit={() => onEditQR?.(qr)}
                  onViewAnalytics={() => onViewAnalytics?.(qr.id)}
                  onToggleStatus={() => handleToggleStatus(qr.id, qr.is_active)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

interface QRCodeCardProps {
  qr: SavedQRCode;
  config: QRConfig;
  onDownload: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onViewAnalytics: () => void;
  onToggleStatus: () => void;
}

const QRCodeCard = ({ qr, config, onDownload, onDelete, onEdit, onViewAnalytics, onToggleStatus }: QRCodeCardProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // If we have a stored QR image URL, don't regenerate
    if (qr.qr_image_url && !imageError) {
      return;
    }
    
    // Fallback: regenerate QR code if no stored image or image failed to load
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      const qrCode = createQRCode({ ...config, size: 120 });
      qrCode.append(qrRef.current);
    }
  }, [config, qr.qr_image_url, imageError]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{qr.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Active/Inactive Toggle */}
            <button
              onClick={onToggleStatus}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                qr.is_active ? 'bg-green-500' : 'bg-gray-300'
              }`}
              title={qr.is_active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  qr.is_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <button
              onClick={onViewAnalytics}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="View Analytics"
            >
              <Eye className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center mb-4 relative">
          <div style={{ padding: '20px', backgroundColor: config.bgColor }}>
            {qr.qr_image_url && !imageError ? (
              <img 
                src={qr.qr_image_url} 
                alt={qr.title}
                className="w-[120px] h-[120px] object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div ref={qrRef} style={{ width: '120px', height: '120px' }} />
            )}
          </div>
          <div className="absolute top-2 right-2">
            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
              {qr.qr_type}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(qr.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span>{qr.scan_count} scans</span>
          </div>
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            <a 
              href={qr.redirect_url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={async (_) => {
                // Track scan count when clicking the link
                try {
                  const { incrementScanCount } = await import('../services/qrCodeService');
                  await incrementScanCount(qr.short_code);
                } catch (error) {
                  console.error('Failed to increment scan count:', error);
                }
              }}
              className="font-mono text-xs text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
            >
              {qr.short_code}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
