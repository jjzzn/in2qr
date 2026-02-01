import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserQRCodes, deleteQRCode, type SavedQRCode } from '../services/qrCodeService';
import { QrCode, Trash2, Eye, Download, Copy, Calendar, BarChart3, Plus, ExternalLink, Edit } from 'lucide-react';
import { createQRCode, downloadQRCode } from '../utils/qrCode';
import type { QRConfig } from '../types';

interface DashboardProps {
  onCreateNew: () => void;
  onEditQR?: (qr: SavedQRCode) => void;
}

export const Dashboard = ({ onCreateNew, onEditQR }: DashboardProps) => {
  const { user } = useAuth();
  const [qrCodes, setQrCodes] = useState<SavedQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<SavedQRCode | null>(null);

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
    if (!confirm('Are you sure you want to delete this QR code?')) return;
    
    const { error } = await deleteQRCode(id);
    if (!error) {
      setQrCodes(qrCodes.filter(qr => qr.id !== id));
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My QR Codes</h1>
            <p className="text-gray-600">Manage and track all your QR codes</p>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create New QR Code
          </button>
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
            {qrCodes.map((qr) => {
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
                  isExpanded={selectedQR?.id === qr.id}
                  onToggleExpand={() => setSelectedQR(selectedQR?.id === qr.id ? null : qr)}
                  onDownload={() => handleDownload(qr)}
                  onDelete={() => handleDelete(qr.id)}
                  onEdit={() => onEditQR?.(qr)}
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
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const QRCodeCard = ({ qr, config, isExpanded, onToggleExpand, onDownload, onDelete, onEdit }: QRCodeCardProps) => {
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      const qrCode = createQRCode({ ...config, size: 120 });
      qrCode.append(qrRef.current);
    }
  }, [config]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // For now, the short link points directly to redirect_url
  // In production, this would be https://in2qr.com/r/{short_code} that tracks and redirects
  const shortLinkUrl = `${window.location.origin}/qr/${qr.short_code}`;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{qr.title}</h3>
          </div>
          <button
            onClick={onToggleExpand}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center mb-4 relative">
          <div ref={qrRef} style={{ width: '120px', height: '120px' }} />
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
              onClick={async (e) => {
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

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-sm">
            <p className="text-gray-600 mb-2">Destination:</p>
            <p className="text-gray-900 break-all mb-3">{qr.content.value}</p>
            <p className="text-gray-600 mb-2">Short Link:</p>
            <a 
              href={shortLinkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 hover:underline break-all flex items-center gap-1"
            >
              {shortLinkUrl}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
