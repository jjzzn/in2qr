import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { QR_TYPES } from '../../constants/qrTypes';
import type { QRCodeType, WiFiConfig } from '../../types';

interface Step2AddContentProps {
  selectedType: QRCodeType;
  value: string;
  title: string;
  onValueChange: (value: string) => void;
  onTitleChange: (title: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2AddContent = ({
  selectedType,
  value,
  title,
  onValueChange,
  onTitleChange,
  onNext,
  onBack,
}: Step2AddContentProps) => {
  const [wifiConfig, setWifiConfig] = useState<WiFiConfig>({
    ssid: '',
    security: 'WPA',
    password: '',
  });

  const qrType = QR_TYPES.find((t) => t.id === selectedType);

  const handleWifiChange = (field: keyof WiFiConfig, val: string) => {
    const newConfig = { ...wifiConfig, [field]: val };
    setWifiConfig(newConfig);
    
    const wifiString = `WIFI:T:${newConfig.security};S:${newConfig.ssid};P:${newConfig.password};;`;
    onValueChange(wifiString);
  };

  const isValid = title.trim() !== '' && (selectedType === 'wifi' 
    ? wifiConfig.ssid.trim() !== '' && (wifiConfig.security === 'nopass' || wifiConfig.password.trim() !== '')
    : value.trim() !== '');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Add {qrType?.label} Content
        </h2>
        <p className="text-gray-600 mb-6">
          {qrType?.description}
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR Code Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter a title for your QR code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {selectedType === 'wifi' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network Name (SSID)
              </label>
              <input
                type="text"
                value={wifiConfig.ssid}
                onChange={(e) => handleWifiChange('ssid', e.target.value)}
                placeholder="WiFi Network Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Type
              </label>
              <select
                value={wifiConfig.security}
                onChange={(e) => handleWifiChange('security', e.target.value as WiFiConfig['security'])}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>

            {wifiConfig.security !== 'nopass' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={wifiConfig.password}
                  onChange={(e) => handleWifiChange('password', e.target.value)}
                  placeholder="WiFi Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            )}
          </div>
        ) : selectedType === 'website' || selectedType === 'pdf' || selectedType === 'video' || selectedType === 'image' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedType === 'website' ? 'Website URL' : selectedType === 'pdf' ? 'PDF URL' : selectedType === 'video' ? 'Video URL' : 'Image URL'}
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
              <span className="px-4 py-3 text-gray-500 bg-gray-50 border-r border-gray-300">https://</span>
              <input
                type="text"
                value={value.startsWith('https://') ? value.substring(8) : value.startsWith('http://') ? value.substring(7) : value}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // Remove any protocol prefix if user pastes full URL
                  const cleanValue = inputValue.replace(/^(https?:\/\/)/, '');
                  onValueChange('https://' + cleanValue);
                }}
                placeholder={qrType?.placeholder?.replace('https://', '')}
                className="flex-1 px-4 py-3 outline-none"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedType === 'email' ? 'Email Address' : selectedType === 'phone' ? 'Phone Number' : selectedType === 'whatsapp' ? 'WhatsApp Number' : selectedType === 'text' ? 'Text Message' : selectedType === 'location' ? 'GPS Coordinates' : 'Content'}
            </label>
            <textarea
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder={qrType?.placeholder}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
            />
            <div className="text-right text-sm text-gray-500 mt-2">
              {value.length} characters
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            onClick={onNext}
            disabled={!isValid}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
