import * as Icons from 'lucide-react';
import type { QRType } from '../types';

interface QRTypeCardProps {
  qrType: QRType;
  onSelect: () => void;
}

export const QRTypeCard = ({ qrType, onSelect }: QRTypeCardProps) => {
  const IconComponent = (Icons as any)[qrType.icon] || Icons.HelpCircle;
  
  return (
    <button
      onClick={onSelect}
      className="
        w-full bg-white rounded-xl border-2 border-gray-100 p-4
        hover:border-primary-500 hover:shadow-lg hover:bg-orange-50
        transition-all duration-300
        group
        animate-fade-in
      "
    >
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <div className="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform">
          <IconComponent className="w-full h-full" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm mb-0.5">
            {qrType.label}
          </h3>
          <p className="text-xs text-gray-500">
            {qrType.description}
          </p>
        </div>
      </div>
    </button>
  );
};
