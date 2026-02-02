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
import { QRRedirect } from './pages/QRRedirect';
import type { WizardStep, QRCodeType, QRConfig } from './types';
import type { SavedQRCode } from './services/qrCodeService';

type AppView = 'generator' | 'login' | 'register' | 'dashboard' | 'qr-redirect';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    // Check if URL is a QR redirect
    if (window.location.pathname.startsWith('/qr/')) {
      return 'qr-redirect';
    }
    return 'generator';
  });
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
  const [qrTitle, setQrTitle] = useState('');
  const [editingQR, setEditingQR] = useState<SavedQRCode | null>(null);

  const handleSelectType = (type: QRCodeType) => {
    setConfig({ ...config, type, value: '' });
    setCompletedSteps([1]);
    setCurrentStep(2);
  };

  const handleValueChange = (value: string) => {
    setConfig({ ...config, value });
  };

  const handleTitleChange = (title: string) => {
    setQrTitle(title);
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
    setQrTitle('');
    setEditingQR(null);
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

  const handleEditQR = (qr: SavedQRCode) => {
    setEditingQR(qr);
    setQrTitle(qr.title);
    setConfig({
      type: qr.qr_type as QRCodeType,
      value: qr.content.value,
      size: qr.design_settings.size || 300,
      bgColor: qr.design_settings.bgColor || '#ffffff',
      fgColor: qr.design_settings.fgColor || '#000000',
      errorCorrectionLevel: qr.design_settings.errorCorrectionLevel || 'M',
      dotStyle: qr.design_settings.dotStyle || 'square',
      cornerSquareStyle: qr.design_settings.cornerSquareStyle || 'square',
      cornerDotStyle: qr.design_settings.cornerDotStyle || 'square',
      logo: qr.design_settings.logo,
      logoSize: qr.design_settings.logoSize || 40,
      format: 'png',
    });
    setCurrentStep(2);
    setCompletedSteps([1]);
    setCurrentView('generator');
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
        <Dashboard 
          onCreateNew={() => {
            handleCreateAnother();
            setCurrentView('generator');
          }}
          onEditQR={handleEditQR}
        />
      </>
    );
  }

  if (currentView === 'qr-redirect') {
    return <QRRedirect />;
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
          title={qrTitle}
          onValueChange={handleValueChange}
          onTitleChange={handleTitleChange}
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
          title={qrTitle}
          editingQRId={editingQR?.id}
          onCreateAnother={handleCreateAnother}
          onDashboardNavigate={() => setCurrentView('dashboard')}
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
