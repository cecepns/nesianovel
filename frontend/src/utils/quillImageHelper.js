import { toast } from 'react-toastify';
import { apiClient, getImageUrl, getCdnDomain } from './api';

/**
 * Normalizes an S3/R2 key from a URL or relative path.
 * e.g., 'https://cdn.komiknesia.net/komiknesia/editor/abc.webp' -> 'komiknesia/editor/abc.webp'
 * e.g., '/komiknesia/editor/abc.webp' -> 'komiknesia/editor/abc.webp'
 */
export function extractS3KeyFromPathOrUrl(urlOrPath) {
  if (!urlOrPath || typeof urlOrPath !== 'string') return null;
  const str = urlOrPath.trim();
  if (!str) return null;

  // If it's a full URL
  if (/^https?:\/\//i.test(str)) {
    try {
      const parsed = new URL(str);
      const pathname = decodeURIComponent(parsed.pathname || '').replace(/^\/+/, '');
      if (pathname.startsWith('komiknesia/') || pathname.startsWith('editor/') || pathname.startsWith('banners/')) {
        return pathname;
      }
      const komiknesiaIndex = pathname.indexOf('komiknesia/');
      if (komiknesiaIndex >= 0) {
        return pathname.slice(komiknesiaIndex);
      }
    } catch {
      return null;
    }
    return null;
  }

  // If it's a relative path
  const normalized = str.replace(/^\/+/, '');
  if (
    normalized.startsWith('komiknesia/') ||
    normalized.startsWith('editor/') ||
    normalized.startsWith('banners/')
  ) {
    return normalized;
  }

  return null;
}

/**
 * Resolves all <img> tags in an HTML string to use the current dynamic CDN domain.
 * Used when rendering rich text publicly or when loading content into ReactQuill for editing.
 *
 * @param {string} html - HTML string from database
 * @param {string} [customCdn] - Optional override for CDN domain
 * @returns {string} HTML with resolved image URLs
 */
export function resolveHtmlImages(html, customCdn) {
  if (!html || typeof html !== 'string') return html || '';

  const activeCdn = (customCdn || getCdnDomain() || 'https://cdn.komiknesia.net').replace(/\/+$/, '');

  return html.replace(/(<img\b[^>]*?\bsrc=["'])([^"']+)(["'][^>]*?>)/gi, (match, prefix, src, suffix) => {
    // Keep data URIs as is (if any remain)
    if (src.startsWith('data:')) {
      return match;
    }

    // Local /uploads/ files
    if (src.startsWith('/uploads/') || src.startsWith('uploads/')) {
      return `${prefix}${getImageUrl(src)}${suffix}`;
    }

    // Check if it's an S3/R2 key (relative or from an old/existing CDN domain)
    const s3Key = extractS3KeyFromPathOrUrl(src);
    if (s3Key) {
      return `${prefix}${activeCdn}/${s3Key}${suffix}`;
    }

    // Other relative paths (komiknesia/..., etc.)
    if (!/^https?:\/\//i.test(src)) {
      return `${prefix}${getImageUrl(src)}${suffix}`;
    }

    return match;
  });
}

/**
 * Sanitizes HTML rich text before saving to database:
 * Strips absolute CDN domains from <img> src attributes so that only the relative
 * path/key (e.g. "komiknesia/editor/...") is stored in the database.
 *
 * @param {string} html - HTML string from editor
 * @returns {string} HTML with relative image paths only
 */
export function sanitizeHtmlImagesForSave(html) {
  if (!html || typeof html !== 'string') return html || '';

  return html.replace(/(<img\b[^>]*?\bsrc=["'])([^"']+)(["'][^>]*?>)/gi, (match, prefix, src, suffix) => {
    // Don't modify base64 here (handled by sanitizeAndUploadBase64InHtml)
    if (src.startsWith('data:')) {
      return match;
    }

    const s3Key = extractS3KeyFromPathOrUrl(src);
    if (s3Key) {
      return `${prefix}${s3Key}${suffix}`;
    }

    return match;
  });
}

/**
 * Inspects HTML for any embedded base64 images (from paste/drag-drop),
 * uploads them directly to Cloudflare R2, and replaces their src with the relative path.
 * Also strips absolute CDN domains from all other images so only relative paths are saved.
 *
 * @param {string} html - HTML string from ReactQuill
 * @returns {Promise<string>} Clean HTML ready for database storage
 */
export async function sanitizeAndUploadBase64InHtml(html) {
  if (!html || typeof html !== 'string') return html || '';

  let sanitized = html;
  const base64Regex = /<img\b([^>]*?)\bsrc=["'](data:image\/[^;]+;base64,[^"']+)["']([^>]*?>)/gi;
  const matches = [];
  let m;

  while ((m = base64Regex.exec(sanitized)) !== null) {
    matches.push({
      fullMatch: m[0],
      beforeSrc: m[1],
      base64Data: m[2],
      afterSrc: m[3],
    });
  }

  if (matches.length > 0) {
    const toastId = toast.loading(`Mengunggah ${matches.length} gambar ke Cloudflare R2...`);
    try {
      for (const item of matches) {
        try {
          const res = await apiClient.uploadEditorBase64(item.base64Data);
          if (res?.path) {
            sanitized = sanitized.replace(
              item.fullMatch,
              `<img${item.beforeSrc}src="${res.path}"${item.afterSrc}`
            );
          }
        } catch (err) {
          console.error('Failed to upload base64 image in HTML:', err);
        }
      }
      toast.update(toastId, {
        render: 'Semua gambar berhasil diunggah ke R2!',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
    } catch {
      toast.update(toastId, {
        render: 'Sebagian gambar gagal diunggah ke R2',
        type: 'warning',
        isLoading: false,
        autoClose: 3000,
      });
    }
  }

  // Strip any full CDN domain URLs to keep only relative paths
  sanitized = sanitizeHtmlImagesForSave(sanitized);

  return sanitized;
}

/**
 * Creates a custom image handler function for Quill toolbar.
 *
 * @param {React.MutableRefObject} quillRef - Ref to ReactQuill component
 * @returns {Function} Toolbar image handler
 */
export function createQuillImageHandler(quillRef) {
  return function handleQuillImage() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/png, image/jpeg, image/webp, image/gif');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 15MB');
        return;
      }

      const toastId = toast.loading('Mengunggah gambar ke Cloudflare R2...');

      try {
        const res = await apiClient.uploadEditorImage(file);
        if (!res || !res.url) {
          throw new Error(res?.error || 'Gagal mengunggah gambar');
        }

        const quill = quillRef?.current?.getEditor ? quillRef.current.getEditor() : this.quill;
        if (quill) {
          const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
          quill.insertEmbed(range.index, 'image', res.url);
          quill.setSelection(range.index + 1);
        }

        toast.update(toastId, {
          render: 'Gambar berhasil diunggah ke Cloudflare R2!',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });
      } catch (err) {
        console.error('Error uploading editor image:', err);
        toast.update(toastId, {
          render: err?.message || 'Gagal mengunggah gambar ke R2',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
      }
    };
  };
}

/**
 * Attaches paste and drop event listeners to a Quill instance
 * to prevent base64 embedding and upload files directly to Cloudflare R2.
 *
 * @param {Object} quill - Quill instance
 * @returns {Function} Cleanup function to remove event listeners
 */
export function setupQuillImagePasteAndDrop(quill) {
  if (!quill || !quill.root) return () => {};

  const handlePaste = async (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const toastId = toast.loading('Mengunggah gambar tempelan ke Cloudflare R2...');
          try {
            const res = await apiClient.uploadEditorImage(file);
            if (res?.url) {
              const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
              quill.insertEmbed(range.index, 'image', res.url);
              quill.setSelection(range.index + 1);
              toast.update(toastId, {
                render: 'Gambar tempelan berhasil diunggah ke R2!',
                type: 'success',
                isLoading: false,
                autoClose: 2000,
              });
            }
          } catch (err) {
            toast.update(toastId, {
              render: 'Gagal mengunggah gambar tempelan ke R2',
              type: 'error',
              isLoading: false,
              autoClose: 3000,
            });
          }
          return;
        }
      }
    }
  };

  const handleDrop = async (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      e.preventDefault();
      const file = files[0];
      const toastId = toast.loading('Mengunggah gambar seretan ke Cloudflare R2...');
      try {
        const res = await apiClient.uploadEditorImage(file);
        if (res?.url) {
          const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
          quill.insertEmbed(range.index, 'image', res.url);
          quill.setSelection(range.index + 1);
          toast.update(toastId, {
            render: 'Gambar seretan berhasil diunggah ke R2!',
            type: 'success',
            isLoading: false,
            autoClose: 2000,
          });
        }
      } catch (err) {
        toast.update(toastId, {
          render: 'Gagal mengunggah gambar seretan ke R2',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
      }
    }
  };

  quill.root.addEventListener('paste', handlePaste);
  quill.root.addEventListener('drop', handleDrop);

  return () => {
    quill.root.removeEventListener('paste', handlePaste);
    quill.root.removeEventListener('drop', handleDrop);
  };
}
