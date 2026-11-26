const API_BASE_URL = typeof window !== 'undefined'
  ? ''
  : (process.env.INTERNAL_API_URL || `http://127.0.0.1:${process.env.INTERNAL_API_PORT || 4055}`);

interface FetchOptions extends RequestInit {
  retries?: number;
  backoffMs?: number;
  timeoutMs?: number;
}

/**
 * Robust fetch with exponential backoff retry
 * Ensures backend cold-starts/restarts never break Next.js server-side rendering or client calls
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    retries = 3,
    backoffMs = 500,
    timeoutMs = 8000,
    headers = {},
    ...restOptions
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  let attempt = 0;
  let delay = backoffMs;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...restOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // If 4xx client error (except 429), don't retry, throw immediately
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${response.status}`);
        }
        throw new Error(`Server returned status ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      attempt++;

      if (attempt > retries) {
        console.error(`[apiFetch Failed after ${retries} retries] ${url}:`, error.message);
        throw error;
      }

      console.warn(`[apiFetch Retry ${attempt}/${retries}] Retrying ${url} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // exponential backoff
    }
  }

  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

// Format Pakistani Rupees with comma separator (e.g., Rs. 495,000)
export function formatPKR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return 'Rs.\u00A00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rs.\u00A00';
  return `Rs.\u00A0${num.toLocaleString('en-PK')}`;
}

// Generate direct WhatsApp chat URL with message
export function getWhatsAppOrderUrl(params: {
  phone?: string;
  productName: string;
  storage?: string;
  color?: string;
  price?: number;
  ptaStatus?: string;
  batteryHealth?: number;
  conditionGrade?: string;
  slug?: string;
}): string {
  const storePhone = (params.phone || '923001234567').replace(/[^0-9]/g, '');
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://czns.pk';
  const productUrl = params.slug ? `${siteUrl}/phone/${params.slug}` : siteUrl;

  const msg = [
    `*Salam CZNS Mobile Store!* 📱`,
    `I am interested in ordering:`,
    `• *Model:* ${params.productName}`,
    params.storage ? `• *Storage:* ${params.storage}` : '',
    params.color ? `• *Color:* ${params.color}` : '',
    params.conditionGrade ? `• *Condition:* ${params.conditionGrade}` : '',
    params.batteryHealth ? `• *Battery Health:* 🔋 ${params.batteryHealth}%` : '',
    params.ptaStatus ? `• *PTA Status:* ${params.ptaStatus}` : '',
    params.price ? `• *Price:* ${formatPKR(params.price)}` : '',
    `• *Link:* ${productUrl}`,
    ``,
    `Please confirm availability and dispatch time. Thank you!`
  ].filter(Boolean).join('\n');

  return `https://wa.me/${storePhone}?text=${encodeURIComponent(msg)}`;
}
