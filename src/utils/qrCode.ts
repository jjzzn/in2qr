import QRCodeStyling from 'qr-code-styling';
import type { QRConfig, QRCodeType } from '../types';

export const formatQRValue = (type: QRCodeType, value: string): string => {
  const trimmedValue = value.trim();
  
  switch (type) {
    case 'website':
    case 'pdf':
    case 'video':
    case 'image':
      if (!trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
        return `https://${trimmedValue}`;
      }
      return trimmedValue;
    
    case 'email':
      return `mailto:${trimmedValue}`;
    
    case 'phone':
      return `tel:${trimmedValue}`;
    
    case 'whatsapp':
      const phone = trimmedValue.replace(/[^\d+]/g, '');
      return `https://wa.me/${phone}`;
    
    case 'location':
      return `geo:${trimmedValue}`;
    
    case 'facebook':
    case 'instagram':
      return trimmedValue;
    
    case 'wifi':
    case 'text':
    default:
      return trimmedValue;
  }
};

export const createQRCode = (config: QRConfig): QRCodeStyling => {
  const dotsOptions: any = {
    type: config.dotStyle === 'extra-rounded' ? 'extra-rounded' : config.dotStyle
  };

  const qrCodeOptions: any = {
    width: config.size,
    height: config.size,
    data: formatQRValue(config.type, config.value),
    dotsOptions: {
      color: config.fgColor,
      type: dotsOptions.type,
    },
    backgroundOptions: {
      color: config.bgColor,
    },
    cornersSquareOptions: {
      color: config.fgColor,
      type: config.cornerSquareStyle,
    },
    cornersDotOptions: {
      color: config.fgColor,
      type: config.cornerDotStyle,
    },
    qrOptions: {
      errorCorrectionLevel: config.errorCorrectionLevel,
    },
  };

  if (config.logo) {
    qrCodeOptions.image = config.logo;
    qrCodeOptions.imageOptions = {
      hideBackgroundDots: true,
      imageSize: config.logoSize / 100,
      margin: 5,
    };
  }

  const qrCode = new QRCodeStyling(qrCodeOptions);

  return qrCode;
};

export const downloadQRCode = async (
  qrCode: QRCodeStyling,
  format: 'png' | 'svg' | 'jpeg' | 'webp',
  filename?: string
): Promise<void> => {
  const timestamp = Date.now();
  const name = filename || `qr-code-${timestamp}`;
  
  await qrCode.download({
    name,
    extension: format,
  });
};

export const copyQRToClipboard = async (qrCode: QRCodeStyling): Promise<void> => {
  return new Promise((resolve, reject) => {
    qrCode.getRawData('png').then((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate QR code'));
        return;
      }
      
      navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]).then(resolve).catch(reject);
    }).catch(reject);
  });
};
