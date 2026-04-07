const FALLBACK_PRODUCT_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#eef2f7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="26">Image unavailable</text></svg>'
  );

const IMAGE_EXT_PATTERN = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;

const stripSurroundingQuotes = value => {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

const toGoogleDriveDirectUrl = rawUrl => {
  const fileIdMatch = rawUrl.match(/\/file\/d\/([^/]+)/i);
  if (fileIdMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
  }

  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname.includes('drive.google.com')) {
      const id = parsed.searchParams.get('id');
      if (id) {
        return `https://drive.google.com/uc?export=view&id=${id}`;
      }
    }
  } catch {
    return rawUrl;
  }

  return rawUrl;
};

const toDropboxDirectUrl = rawUrl => {
  try {
    const parsed = new URL(rawUrl);
    if (!parsed.hostname.includes('dropbox.com')) return rawUrl;

    parsed.searchParams.delete('dl');
    parsed.searchParams.set('raw', '1');
    return parsed.toString();
  } catch {
    return rawUrl;
  }
};

export const normalizeImageUrl = url => {
  const cleaned = stripSurroundingQuotes(url);
  if (!cleaned) return '';

  if (cleaned.startsWith('data:image/')) return cleaned;

  let next = cleaned;
  if (next.includes('drive.google.com')) {
    next = toGoogleDriveDirectUrl(next);
  }
  if (next.includes('dropbox.com')) {
    next = toDropboxDirectUrl(next);
  }

  return next;
};

export const isLikelyDirectImageUrl = url => {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return false;
  if (normalized.startsWith('data:image/')) return true;
  if (IMAGE_EXT_PATTERN.test(normalized)) return true;
  if (normalized.includes('drive.google.com/uc?')) return true;
  if (normalized.includes('dropbox.com') && normalized.includes('raw=1')) return true;
  return false;
};

export const normalizeImageUrls = urls => {
  if (!Array.isArray(urls)) return [];
  return urls.map(normalizeImageUrl).filter(Boolean);
};

export const getPrimaryImageUrl = product => {
  const first = normalizeImageUrl(product?.imageUrls?.[0]);
  return first || FALLBACK_PRODUCT_IMAGE;
};

export const handleProductImageError = event => {
  const img = event.currentTarget;
  if (!img || img.src === FALLBACK_PRODUCT_IMAGE) return;
  img.onerror = null;
  img.src = FALLBACK_PRODUCT_IMAGE;
};
