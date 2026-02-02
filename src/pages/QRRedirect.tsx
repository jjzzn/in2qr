import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export const QRRedirect = () => {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleRedirect = async () => {
      // Get short code from URL path
      const path = window.location.pathname;
      const shortCode = path.split('/qr/')[1];

      if (!shortCode) {
        setError('Invalid QR code');
        return;
      }

      try {
        // Fetch QR code data
        const { data: qrCode, error: fetchError } = await supabase
          .from('qr_codes')
          .select('redirect_url, scan_count, is_active')
          .eq('short_code', shortCode)
          .single();

        if (fetchError || !qrCode) {
          setError('QR code not found');
          return;
        }

        if (!qrCode.is_active) {
          setError('This QR code is no longer active');
          return;
        }

        // Increment scan count
        await supabase
          .from('qr_codes')
          .update({ scan_count: (qrCode.scan_count || 0) + 1 })
          .eq('short_code', shortCode);

        // Redirect to the actual URL
        window.location.href = qrCode.redirect_url;
      } catch (err) {
        setError('An error occurred while processing your request');
        console.error(err);
      }
    };

    handleRedirect();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h1>
        <p className="text-gray-600">Please wait while we redirect you</p>
      </div>
    </div>
  );
};
