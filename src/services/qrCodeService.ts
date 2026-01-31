import { supabase } from '../lib/supabase';
import type { QRConfig } from '../types';

export interface SavedQRCode {
  id: string;
  user_id: string | null;
  qr_type: string;
  title: string;
  content: any;
  design_settings: any;
  short_code: string;
  redirect_url: string;
  is_dynamic: boolean;
  scan_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const generateShortCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const saveQRCode = async (
  config: QRConfig,
  title: string,
  userId: string | null
): Promise<{ data: SavedQRCode | null; error: any }> => {
  try {
    const shortCode = generateShortCode();
    
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        user_id: userId,
        qr_type: config.type,
        title,
        content: {
          value: config.value,
        },
        design_settings: {
          size: config.size,
          bgColor: config.bgColor,
          fgColor: config.fgColor,
          errorCorrectionLevel: config.errorCorrectionLevel,
          dotStyle: config.dotStyle,
          cornerSquareStyle: config.cornerSquareStyle,
          cornerDotStyle: config.cornerDotStyle,
          logo: config.logo,
          logoSize: config.logoSize,
        },
        short_code: shortCode,
        redirect_url: config.value,
        is_dynamic: true,
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const getUserQRCodes = async (
  userId: string
): Promise<{ data: SavedQRCode[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const getQRCode = async (
  id: string
): Promise<{ data: SavedQRCode | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateQRCode = async (
  id: string,
  updates: Partial<SavedQRCode>
): Promise<{ data: SavedQRCode | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteQRCode = async (
  id: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);

    return { error };
  } catch (error) {
    return { error };
  }
};

export const incrementScanCount = async (
  shortCode: string
): Promise<{ error: any }> => {
  try {
    const { data: qrCode, error: fetchError } = await supabase
      .from('qr_codes')
      .select('scan_count')
      .eq('short_code', shortCode)
      .single();

    if (fetchError) return { error: fetchError };

    const { error } = await supabase
      .from('qr_codes')
      .update({ scan_count: (qrCode.scan_count || 0) + 1 })
      .eq('short_code', shortCode);

    return { error };
  } catch (error) {
    return { error };
  }
};
