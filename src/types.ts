export type QRCodeType = 
  | 'website' | 'pdf' | 'video' | 'image'
  | 'facebook' | 'instagram' | 'whatsapp' | 'text'
  | 'email' | 'phone' | 'wifi' | 'location';

export interface QRConfig {
  type: QRCodeType;
  value: string;
  size: number;
  bgColor: string;
  fgColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  dotStyle: 'square' | 'dots' | 'rounded' | 'extra-rounded';
  cornerSquareStyle: 'square' | 'extra-rounded' | 'dot';
  cornerDotStyle: 'square' | 'dot';
  logo?: string;
  logoSize: number;
  format: 'png' | 'svg' | 'jpeg' | 'webp';
}

export type WizardStep = 1 | 2 | 3 | 4;

export interface WiFiConfig {
  ssid: string;
  security: 'WPA' | 'WEP' | 'nopass';
  password: string;
}

export interface QRType {
  id: QRCodeType;
  label: string;
  description: string;
  icon: string;
  placeholder: string;
}
