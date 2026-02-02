import { supabase } from '../lib/supabase';
import QRCodeStyling from 'qr-code-styling';

/**
 * Interface for QR code asset URLs
 */
export interface QRCodeAssets {
  qrImageUrl: string;
  logoUrl?: string;
}

/**
 * Convert blob URL to actual Blob object
 */
async function blobUrlToBlob(blobUrl: string): Promise<Blob> {
  const response = await fetch(blobUrl);
  return await response.blob();
}

/**
 * Upload a blob to Supabase Storage
 */
async function uploadToStorage(
  blob: Blob,
  path: string,
  contentType: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('qr-assets')
    .upload(path, blob, {
      contentType,
      upsert: true,
      cacheControl: '3600',
    });

  if (error) {
    console.error('Storage upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('qr-assets')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Upload QR code and logo assets to Supabase Storage
 * @param qrCodeInstance - QRCodeStyling instance
 * @param logoUrl - Optional logo URL (blob URL or data URL)
 * @param userId - User ID for organizing files
 * @returns Object containing public URLs for QR code and logo
 */
export async function uploadQRCodeAssets(
  qrCodeInstance: QRCodeStyling,
  logoUrl: string | undefined,
  userId: string
): Promise<QRCodeAssets> {
  try {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    
    // 1. Generate and upload QR code image
    const qrBlob = await qrCodeInstance.getRawData('png');
    if (!qrBlob) {
      throw new Error('Failed to generate QR code image');
    }

    const qrPath = `${userId}/qr-codes/qr_${timestamp}_${randomId}.png`;
    const qrImageUrl = await uploadToStorage(qrBlob, qrPath, 'image/png');

    // 2. Upload logo if exists
    let uploadedLogoUrl: string | undefined;
    if (logoUrl) {
      try {
        let logoBlob: Blob;
        
        // Handle blob URL
        if (logoUrl.startsWith('blob:')) {
          logoBlob = await blobUrlToBlob(logoUrl);
        }
        // Handle data URL
        else if (logoUrl.startsWith('data:')) {
          const response = await fetch(logoUrl);
          logoBlob = await response.blob();
        }
        // Handle regular URL (already uploaded)
        else if (logoUrl.startsWith('http')) {
          uploadedLogoUrl = logoUrl; // Already a public URL
        } else {
          throw new Error('Invalid logo URL format');
        }

        // Upload logo if we have a blob
        if (logoBlob!) {
          const logoPath = `${userId}/logos/logo_${timestamp}_${randomId}.${logoBlob.type.split('/')[1]}`;
          uploadedLogoUrl = await uploadToStorage(logoBlob, logoPath, logoBlob.type);
        }
      } catch (logoError) {
        console.error('Failed to upload logo:', logoError);
        // Continue without logo rather than failing completely
        uploadedLogoUrl = undefined;
      }
    }

    return {
      qrImageUrl,
      logoUrl: uploadedLogoUrl,
    };
  } catch (error) {
    console.error('Error uploading QR code assets:', error);
    throw error;
  }
}

/**
 * Delete QR code assets from storage
 * @param qrImageUrl - Public URL of QR code image
 * @param logoUrl - Optional public URL of logo
 */
export async function deleteQRCodeAssets(
  qrImageUrl: string,
  logoUrl?: string
): Promise<void> {
  try {
    const filesToDelete: string[] = [];

    // Extract path from public URL
    const extractPath = (url: string): string | null => {
      try {
        const urlObj = new URL(url);
        const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/qr-assets\/(.+)/);
        return pathMatch ? pathMatch[1] : null;
      } catch {
        return null;
      }
    };

    const qrPath = extractPath(qrImageUrl);
    if (qrPath) filesToDelete.push(qrPath);

    if (logoUrl) {
      const logoPath = extractPath(logoUrl);
      if (logoPath) filesToDelete.push(logoPath);
    }

    if (filesToDelete.length > 0) {
      const { error } = await supabase.storage
        .from('qr-assets')
        .remove(filesToDelete);

      if (error) {
        console.error('Failed to delete files:', error);
      }
    }
  } catch (error) {
    console.error('Error deleting QR code assets:', error);
    // Don't throw - deletion failure shouldn't block other operations
  }
}

/**
 * Clean up expired blob URLs
 * @param urls - Array of blob URLs to revoke
 */
export function cleanupBlobUrls(urls: (string | undefined)[]): void {
  urls.forEach(url => {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to revoke blob URL:', error);
      }
    }
  });
}
