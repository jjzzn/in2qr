import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Upload, X, HelpCircle } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import type { QRConfig } from '../../types';
import { createQRCode } from '../../utils/qrCode';

interface Step3CustomizeProps {
  config: QRConfig;
  onConfigChange: (config: Partial<QRConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Customize = ({ config, onConfigChange, onNext, onBack }: Step3CustomizeProps) => {
  const [showFgPicker, setShowFgPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrRef.current && config.value) {
      qrRef.current.innerHTML = '';
      const qrCode = createQRCode(config);
      qrCode.append(qrRef.current);
    }
  }, [config]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onConfigChange({ logo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const dotStyles: Array<QRConfig['dotStyle']> = ['square', 'dots', 'rounded', 'extra-rounded'];
  const errorLevels: Array<QRConfig['errorCorrectionLevel']> = ['L', 'M', 'Q', 'H'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Live Preview</h3>
          <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
            <div style={{ padding: '20px', backgroundColor: config.bgColor }}>
              <div ref={qrRef} className="transition-all duration-300" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Customize Your QR Code</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foreground Color
                </label>
                <button
                  onClick={() => {
                    setShowFgPicker(!showFgPicker);
                    setShowBgPicker(false);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg flex items-center gap-2 hover:border-primary-500 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: config.fgColor }}
                  />
                  <span className="text-sm">{config.fgColor}</span>
                </button>
                {showFgPicker && (
                  <div className="absolute z-10 mt-2">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowFgPicker(false)}
                    />
                    <div className="relative bg-white p-3 rounded-lg shadow-xl">
                      <HexColorPicker
                        color={config.fgColor}
                        onChange={(color) => onConfigChange({ fgColor: color })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <button
                  onClick={() => {
                    setShowBgPicker(!showBgPicker);
                    setShowFgPicker(false);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg flex items-center gap-2 hover:border-primary-500 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: config.bgColor }}
                  />
                  <span className="text-sm">{config.bgColor}</span>
                </button>
                {showBgPicker && (
                  <div className="absolute z-10 mt-2">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowBgPicker(false)}
                    />
                    <div className="relative bg-white p-3 rounded-lg shadow-xl">
                      <HexColorPicker
                        color={config.bgColor}
                        onChange={(color) => onConfigChange({ bgColor: color })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dot Style
              </label>
              <div className="grid grid-cols-4 gap-2">
                {dotStyles.map((style) => (
                  <button
                    key={style}
                    onClick={() => onConfigChange({ dotStyle: style })}
                    className={`
                      px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${config.dotStyle === style
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Corner Square Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['square', 'extra-rounded', 'dot'] as Array<QRConfig['cornerSquareStyle']>).map((style) => (
                  <button
                    key={style}
                    onClick={() => onConfigChange({ cornerSquareStyle: style })}
                    className={`
                      px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${config.cornerSquareStyle === style
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Corner Dot Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['square', 'dot'] as Array<QRConfig['cornerDotStyle']>).map((style) => (
                  <button
                    key={style}
                    onClick={() => onConfigChange({ cornerDotStyle: style })}
                    className={`
                      px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${config.cornerDotStyle === style
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo (Optional)
              </label>
              {config.logo ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <img src={config.logo} alt="Logo" className="w-12 h-12 object-contain border rounded" />
                    <button
                      onClick={() => onConfigChange({ logo: undefined })}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Logo Size: {config.logoSize}%
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={config.logoSize}
                      onChange={(e) => onConfigChange({ logoSize: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Error Correction Level
                </label>
                <div className="group relative">
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg">
                    Higher levels allow QR code to be read even with damage
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {errorLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => onConfigChange({ errorCorrectionLevel: level })}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${config.errorCorrectionLevel === level
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
