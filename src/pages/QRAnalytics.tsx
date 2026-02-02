import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Calendar, BarChart3, TrendingUp, ExternalLink, Download, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import type { SavedQRCode } from '../services/qrCodeService';
import { createQRCode, downloadQRCode } from '../utils/qrCode';
import type { QRConfig } from '../types';

interface QRAnalyticsProps {
  qrId: string;
  onBack: () => void;
}

export const QRAnalytics = ({ qrId, onBack }: QRAnalyticsProps) => {
  const [qr, setQr] = useState<SavedQRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null);

  useEffect(() => {
    loadQRData();
  }, [qrId]);

  useEffect(() => {
    if (qr && qrRef.current) {
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

      qrCodeInstance.current = createQRCode(config);
      qrRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrRef.current);
    }
  }, [qr]);

  const loadQRData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', qrId)
        .single();

      if (!error && data) {
        setQr(data);
      }
    } catch (error) {
      console.error('Failed to load QR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!qrCodeInstance.current || !qr) return;
    try {
      await downloadQRCode(qrCodeInstance.current, 'png', qr.title);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleCopyLink = () => {
    if (!qr) return;
    const shortLinkUrl = `${window.location.origin}/qr/${qr.short_code}`;
    navigator.clipboard.writeText(shortLinkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!qr) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">QR Code not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const shortLinkUrl = `${window.location.origin}/qr/${qr.short_code}`;
  const createdDate = new Date(qr.created_at).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onDashboardClick={onBack} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{qr.title}</h1>
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full font-medium">
              {qr.qr_type}
            </span>
          </div>
          <p className="text-gray-600 mt-1">View detailed analytics and statistics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - QR Code Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h3>
              
              {/* QR Code Display */}
              <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center mb-4">
                <div ref={qrRef} />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </button>
                
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Copy className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Short Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Analytics & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{qr.scan_count || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Total Scans</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {Math.floor((Date.now() - new Date(qr.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-gray-600 mt-1">Days Active</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {qr.scan_count > 0 
                    ? (qr.scan_count / Math.max(1, Math.floor((Date.now() - new Date(qr.created_at).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1)
                    : '0.0'
                  }
                </div>
                <div className="text-sm text-gray-600 mt-1">Scans per Day</div>
              </div>
            </div>

            {/* QR Code Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">QR Code Details</h3>
              
              <div className="space-y-4">
                {/* Created Date */}
                <div className="flex items-start justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Created</span>
                  </div>
                  <span className="font-medium text-gray-900">{createdDate}</span>
                </div>

                {/* Short Code */}
                <div className="flex items-start justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Short Code</span>
                  <span className="font-mono font-medium text-gray-900">{qr.short_code}</span>
                </div>

                {/* Status */}
                <div className="flex items-start justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    qr.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {qr.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Destination */}
                <div className="py-3 border-b border-gray-100">
                  <p className="text-gray-600 mb-2">Destination</p>
                  <p className="text-gray-900 break-all font-medium">{qr.content.value}</p>
                </div>

                {/* Short Link */}
                <div className="py-3">
                  <p className="text-gray-600 mb-2">Short Link</p>
                  <a 
                    href={shortLinkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 hover:underline break-all font-medium"
                  >
                    <span className="break-all">{shortLinkUrl}</span>
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  </a>
                </div>
              </div>
            </div>

            {/* Design Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Design Settings</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Size</p>
                  <p className="font-semibold text-gray-900">{qr.design_settings.size || 300}px</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Error Correction</p>
                  <p className="font-semibold text-gray-900">{qr.design_settings.errorCorrectionLevel || 'M'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Foreground Color</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: qr.design_settings.fgColor || '#000000' }}
                    />
                    <p className="font-semibold text-gray-900">{qr.design_settings.fgColor || '#000000'}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Background Color</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: qr.design_settings.bgColor || '#ffffff' }}
                    />
                    <p className="font-semibold text-gray-900">{qr.design_settings.bgColor || '#ffffff'}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Dot Style</p>
                  <p className="font-semibold text-gray-900 capitalize">{qr.design_settings.dotStyle || 'square'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Corner Style</p>
                  <p className="font-semibold text-gray-900 capitalize">{qr.design_settings.cornerSquareStyle || 'square'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
