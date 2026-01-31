import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { StepProgress } from './components/StepProgress';
import { Step1SelectType } from './components/steps/Step1SelectType';
import { Step2AddContent } from './components/steps/Step2AddContent';
import { Step3Customize } from './components/steps/Step3Customize';
import { Step4Download } from './components/steps/Step4Download';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import type { WizardStep, QRCodeType, QRConfig } from './types';

type AppView = 'generator' | 'login' | 'register' | 'dashboard';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>('generator');
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [config, setConfig] = useState<QRConfig>({
    type: 'website',
    value: '',
    size: 300,
    bgColor: '#ffffff',
    fgColor: '#000000',
    errorCorrectionLevel: 'M',
    dotStyle: 'square',
    cornerSquareStyle: 'square',
    cornerDotStyle: 'square',
    logoSize: 40,
    format: 'png',
  });

  const handleSelectType = (type: QRCodeType) => {
    setConfig({ ...config, type, value: '' });
    setCompletedSteps([1]);
    setCurrentStep(2);
  };

  const handleValueChange = (value: string) => {
    setConfig({ ...config, value });
  };

  const handleConfigChange = (updates: Partial<QRConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const handleStepClick = (step: WizardStep) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  const goToStep2 = () => {
    setCompletedSteps([1, 2]);
    setCurrentStep(3);
  };

  const goToStep3 = () => {
    setCompletedSteps([1, 2, 3]);
    setCurrentStep(4);
  };

  const goBackToStep1 = () => {
    setCurrentStep(1);
  };

  const goBackToStep2 = () => {
    setCurrentStep(2);
  };

  const handleCreateAnother = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setConfig({
      type: 'website',
      value: '',
      size: 300,
      bgColor: '#ffffff',
      fgColor: '#000000',
      errorCorrectionLevel: 'M',
      dotStyle: 'square',
      cornerSquareStyle: 'square',
      cornerDotStyle: 'square',
      logoSize: 40,
      format: 'png',
    });
  };

  if (currentView === 'login') {
    return (
      <Login
        onSwitchToRegister={() => setCurrentView('register')}
        onClose={() => setCurrentView('generator')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register
        onSwitchToLogin={() => setCurrentView('login')}
        onClose={() => setCurrentView('generator')}
      />
    );
  }

  if (currentView === 'dashboard') {
    return (
      <>
        <Header
          onDashboardClick={() => setCurrentView('dashboard')}
          onLoginClick={() => setCurrentView('login')}
        />
        <Dashboard onCreateNew={() => {
          handleCreateAnother();
          setCurrentView('generator');
        }} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onDashboardClick={() => setCurrentView('dashboard')}
        onLoginClick={() => setCurrentView('login')}
      />
      
      <StepProgress
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {currentStep === 1 && (
        <Step1SelectType onSelectType={handleSelectType} />
      )}

      {currentStep === 2 && (
        <Step2AddContent
          selectedType={config.type}
          value={config.value}
          onValueChange={handleValueChange}
          onNext={goToStep2}
          onBack={goBackToStep1}
        />
      )}

      {currentStep === 3 && (
        <Step3Customize
          config={config}
          onConfigChange={handleConfigChange}
          onNext={goToStep3}
          onBack={goBackToStep2}
        />
      )}

      {currentStep === 4 && (
        <Step4Download
          config={config}
          onCreateAnother={handleCreateAnother}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
