import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserQRCodes, deleteQRCode, type SavedQRCode } from '../services/qrCodeService';
import { QrCode, Trash2, Eye, Download, Copy, Calendar, BarChart3 } from 'lucide-react';
import { createQRCode, downloadQRCode } from '../utils/qrCode';
import type { QRConfig } from '../types';

interface DashboardProps {
  onCreateNew: () => void;
}

export const Dashboard = ({ onCreateNew }: DashboardProps) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My QR Codes</h1>
          <p className="text-gray-600">Manage and track all your QR codes</p>
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
            <button
              onClick={onCreateNew}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              Create QR Code
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map((qr) => (
              <div
                key={qr.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{qr.title}</h3>
                      <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        {qr.qr_type}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedQR(selectedQR?.id === qr.id ? null : qr)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>
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
                      <span className="font-mono text-xs">{qr.short_code}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(qr)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(qr.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {selectedQR?.id === qr.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="text-sm">
                      <p className="text-gray-600 mb-2">Content:</p>
                      <p className="text-gray-900 break-all">{qr.content.value}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
