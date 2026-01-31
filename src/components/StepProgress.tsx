import type { WizardStep } from '../types';

interface StepProgressProps {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  onStepClick: (step: WizardStep) => void;
}

const steps = [
  { number: 1, title: 'Select Type', subtitle: 'Choose QR type' },
  { number: 2, title: 'Add Content', subtitle: 'Enter information' },
  { number: 3, title: 'Customize', subtitle: 'Design your QR' },
  { number: 4, title: 'Download', subtitle: 'Get your QR code' },
];

export const StepProgress = ({ currentStep, completedSteps, onStepClick }: StepProgressProps) => {
  const isStepClickable = (stepNumber: WizardStep) => {
    return completedSteps.includes(stepNumber) || stepNumber === currentStep;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="relative flex items-start justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center" style={{ flex: '1' }}>
            <button
              onClick={() => isStepClickable(step.number as WizardStep) && onStepClick(step.number as WizardStep)}
              disabled={!isStepClickable(step.number as WizardStep)}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg
                transition-all duration-300 mb-2 relative z-10
                ${currentStep === step.number
                  ? 'bg-primary-500 text-white shadow-lg scale-110'
                  : completedSteps.includes(step.number as WizardStep)
                  ? 'bg-primary-500 text-white cursor-pointer hover:scale-105'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {step.number}
            </button>
            <div className="text-center">
              <div className={`font-semibold text-sm ${currentStep === step.number ? 'text-primary-600' : 'text-gray-700'}`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500 hidden sm:block">
                {step.subtitle}
              </div>
            </div>
          </div>
        ))}
        
        <div className="absolute top-6 left-0 right-0 flex items-center px-12" style={{ zIndex: 0 }}>
          {steps.slice(0, -1).map((step, index) => (
            <div
              key={`line-${step.number}`}
              className={`h-1 transition-all duration-300 ${
                completedSteps.includes(step.number as WizardStep) ? 'bg-primary-500' : 'bg-gray-200'
              }`}
              style={{ flex: '1' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
