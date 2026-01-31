import { QRTypeCard } from '../QRTypeCard';
import { QR_TYPES } from '../../constants/qrTypes';
import type { QRCodeType } from '../../types';

interface Step1SelectTypeProps {
  onSelectType: (type: QRCodeType) => void;
}

export const Step1SelectType = ({ onSelectType }: Step1SelectTypeProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          QR Code Generator
        </h1>
        <p className="text-lg text-gray-600">
          Create beautiful, customizable QR codes in minutes
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QR_TYPES.map((qrType) => (
          <QRTypeCard
            key={qrType.id}
            qrType={qrType}
            onSelect={() => onSelectType(qrType.id)}
          />
        ))}
      </div>
    </div>
  );
};
