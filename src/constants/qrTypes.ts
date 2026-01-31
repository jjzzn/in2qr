import type { QRType } from '../types';

export const QR_TYPES: QRType[] = [
  {
    id: 'website',
    label: 'Website',
    description: 'Link to any website',
    icon: 'Link',
    placeholder: 'https://example.com'
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Share PDF document',
    icon: 'FileText',
    placeholder: 'https://example.com/document.pdf'
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Link to video content',
    icon: 'Video',
    placeholder: 'https://youtube.com/watch?v=...'
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Display image content',
    icon: 'Image',
    placeholder: 'https://example.com/image.jpg'
  },
  {
    id: 'facebook',
    label: 'Facebook',
    description: 'Link to Facebook profile or page',
    icon: 'Facebook',
    placeholder: 'https://facebook.com/username'
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'Link to Instagram profile',
    icon: 'Instagram',
    placeholder: 'https://instagram.com/username'
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Send WhatsApp message',
    icon: 'MessageCircle',
    placeholder: '+66812345678'
  },
  {
    id: 'text',
    label: 'Text',
    description: 'Plain text message',
    icon: 'FileText',
    placeholder: 'Enter your text here'
  },
  {
    id: 'email',
    label: 'Email',
    description: 'Send email with details',
    icon: 'Mail',
    placeholder: 'email@example.com'
  },
  {
    id: 'phone',
    label: 'Phone Number',
    description: 'Call phone number',
    icon: 'Phone',
    placeholder: '+66812345678'
  },
  {
    id: 'wifi',
    label: 'WiFi',
    description: 'Connect to WiFi',
    icon: 'Wifi',
    placeholder: 'WiFi Network Name'
  },
  {
    id: 'location',
    label: 'Location',
    description: 'Share GPS location',
    icon: 'MapPin',
    placeholder: '13.7563,100.5018'
  }
];
