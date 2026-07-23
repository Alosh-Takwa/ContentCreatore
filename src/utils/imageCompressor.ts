/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility to compress and resize images client-side before storing them in local state/localStorage.
 * This prevents QuotaExceededError when saving large images.
 */
export function compressAndResizeImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if it's actually an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('الملف المرفق ليس صورة صالحة.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while keeping aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('فشل تهيئة سياق الرسم ثنائي الأبعاد (Canvas Context).'));
            return;
          }

          // Draw the image scaled to the canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Get Compressed Data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => {
        reject(new Error('فشل تحميل الصورة لمعالجتها وضغطها.'));
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('حدث خطأ أثناء قراءة ملف الصورة.'));
    };
    reader.readAsDataURL(file);
  });
}
