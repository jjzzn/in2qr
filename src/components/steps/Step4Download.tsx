import { useState, useEffect, useRef } from 'react';
import { Download, Copy, CheckCircle, Sparkles, Save } from 'lucide-react';
import type { QRConfig } from '../../types';
import { createQRCode, downloadQRCode, copyQRToClipboard } from '../../utils/qrCode';
import { useAuth } from '../../contexts/AuthContext';
import { saveQRCode, updateQRCode } from '../../services/qrCodeService';
import { checkDDoSProtection } from '../../lib/ddosProtection';

interface Step4DownloadProps {
  config: QRConfig;
  title: string;
  editingQRId?: string;
  onCreateAnother: () => void;
  onDashboardNavigate: () => void;
  onConfigChange?: (updates: Partial<QRConfig>) => void;
}

export const Step4Download = ({ config, title, editingQRId, onCreateAnother, onDashboardNavigate, onConfigChange }: Step4DownloadProps) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null);

  useEffect(() => {
    if (qrRef.current && config.value) {
      try {
        qrRef.current.innerHTML = '';
        qrCodeInstance.current = createQRCode(config);
        qrCodeInstance.current.append(qrRef.current);
      } catch (error) {
        console.error('Failed to create QR code:', error);
        console.log('Config:', config);
      }
    }
  }, [config]);

  const handleDownload = async () => {
    if (!qrCodeInstance.current) {
      alert('QR code not ready. Please wait a moment and try again.');
      return;
    }
    
    setDownloading(true);
    try {
      await downloadQRCode(qrCodeInstance.current, config.format);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download QR code. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!qrCodeInstance.current) return;
    
    try {
      await copyQRToClipboard(qrCodeInstance.current);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save QR codes');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title for your QR code');
      return;
    }

    setSaving(true);
    
    // Check DDoS protection before creating new QR code (skip for edits)
    if (!editingQRId) {
      const ddosCheck = await checkDDoSProtection('/api/create-qr');
      
      if (!ddosCheck.allowed) {
        setSaving(false);
        alert(`🛡️ Request blocked\n\n${ddosCheck.reason || 'Too many requests. Please try again later.'}`);
        return;
      }
    }
    
    let error;
    if (editingQRId) {
      // Format redirect_url based on QR type
      let redirectUrl = config.value;
      if (config.type === 'email') {
        redirectUrl = `mailto:${config.value}`;
      } else if (config.type === 'phone') {
        redirectUrl = `tel:${config.value}`;
      } else if (config.type === 'whatsapp') {
        redirectUrl = `https://wa.me/${config.value.replace(/[^0-9]/g, '')}`;
      }
      
      const result = await updateQRCode(editingQRId, {
        title,
        content: { value: config.value },
        design_settings: {
          size: config.size,
          bgColor: config.bgColor,
          fgColor: config.fgColor,
          errorCorrectionLevel: config.errorCorrectionLevel,
          dotStyle: config.dotStyle,
          cornerSquareStyle: config.cornerSquareStyle,
          cornerDotStyle: config.cornerDotStyle,
          logo: config.logo,
          logoSize: config.logoSize,
        },
        redirect_url: redirectUrl,
      });
      error = result.error;
    } else {
      const result = await saveQRCode(config, title, user.id);
      error = result.error;
    }
    
    if (error) {
      alert(`Failed to ${editingQRId ? 'update' : 'save'} QR code: ` + error.message);
      setSaving(false);
    } else {
      setSaved(true);
      setSaving(false);
      setTimeout(() => {
        onDashboardNavigate();
      }, 1000);
    }
  };

  const formats: Array<QRConfig['format']> = ['png', 'svg', 'jpeg', 'webp'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your QR Code</h3>
            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
              <div style={{ padding: '20px', backgroundColor: config.bgColor }}>
                <div ref={qrRef} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">QR Code Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium">{config.size}px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{config.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Error Correction:</span>
                <span className="font-medium">{config.errorCorrectionLevel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {user && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Save to Dashboard</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">QR Code Title</p>
                  <p className="font-semibold text-gray-900">{title || 'Untitled QR Code'}</p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || saved || !title.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {editingQRId ? 'Updated!' : 'Saved to Dashboard!'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {saving ? (editingQRId ? 'Updating...' : 'Saving...') : (editingQRId ? 'Update QR Code' : 'Save to Dashboard')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Download Options</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Format
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {formats.map((format) => (
                    <button
                      key={format}
                      onClick={() => onConfigChange?.({ format })}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all uppercase
                        ${config.format === format
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  {downloading ? 'Downloading...' : 'Download QR Code'}
                </button>

                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Pro Tips
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary-200">•</span>
                <span>Test your QR code before printing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-200">•</span>
                <span>Use high error correction for outdoor use</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-200">•</span>
                <span>PNG format is best for printing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-200">•</span>
                <span>SVG format is scalable without quality loss</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onCreateAnother}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all font-medium shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Create Another QR Code
          </button>
        </div>
      </div>
    </div>
  );
};
