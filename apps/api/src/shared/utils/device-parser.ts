import type { Request } from 'express';

export interface ParsedDeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  ipAddress: string;
  city: string | null;
  country: string | null;
  region: string | null;
  location: string;
  userAgent: string;
}

/**
 * Robust User-Agent and IP header parser.
 * Extracts device telemetry, browser name, operating system, and approximate location.
 */
export function parseDeviceFromRequest(req: Request): ParsedDeviceInfo {
  const userAgent = (req.headers['user-agent'] as string | undefined) ?? 'Unknown';

  // 1. IP Address extraction
  let ipAddress = '127.0.0.1';
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    ipAddress = forwarded.split(',')[0]?.trim() ?? '127.0.0.1';
  } else if (typeof req.headers['x-real-ip'] === 'string') {
    ipAddress = req.headers['x-real-ip'];
  } else if (req.ip) {
    ipAddress = req.ip;
  } else if (req.socket?.remoteAddress) {
    ipAddress = req.socket.remoteAddress;
  }

  // Normalize IPv6 mapped IPv4 (e.g. ::ffff:127.0.0.1)
  if (ipAddress.startsWith('::ffff:')) {
    ipAddress = ipAddress.replace('::ffff:', '');
  } else if (ipAddress === '::1') {
    ipAddress = '127.0.0.1';
  }

  // 2. Location parsing from CDN / Edge proxy headers
  const city = (req.headers['cf-ipcity'] as string) || (req.headers['x-vercel-ip-city'] as string) || null;
  const country = (req.headers['cf-ipcountry'] as string) || (req.headers['x-vercel-ip-country'] as string) || null;
  const region = (req.headers['cf-region'] as string) || (req.headers['x-vercel-ip-country-region'] as string) || null;

  let location = 'Unknown Location';
  if (city && country) {
    location = `${city}, ${country}`;
  } else if (country) {
    location = country;
  } else if (ipAddress === '127.0.0.1' || ipAddress === 'localhost' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
    location = 'Local Network (Dev)';
  }

  // 3. Device Type detection
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'desktop';
  const uaLower = userAgent.toLowerCase();

  if (/ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|silk/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|phone|iemobile|opera mini/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/windows|macintosh|linux|cros|x11/i.test(userAgent)) {
    deviceType = 'desktop';
  } else {
    deviceType = 'unknown';
  }

  // 4. Operating System detection
  let os = 'Unknown OS';
  if (/windows nt 10\.0/i.test(userAgent)) {
    // Windows 10 / 11 share NT 10.0
    os = 'Windows 11/10';
  } else if (/windows nt 6\.3/i.test(userAgent)) {
    os = 'Windows 8.1';
  } else if (/windows nt 6\.1/i.test(userAgent)) {
    os = 'Windows 7';
  } else if (/windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/iphone os (\d+_\d+)/i.test(userAgent)) {
    const match = userAgent.match(/iphone os (\d+_\d+)/i);
    os = `iOS ${match ? match[1]?.replace('_', '.') : ''}`.trim();
  } else if (/ipad.*os (\d+_\d+)/i.test(userAgent)) {
    const match = userAgent.match(/ipad.*os (\d+_\d+)/i);
    os = `iPadOS ${match ? match[1]?.replace('_', '.') : ''}`.trim();
  } else if (/mac os x (\d+[._]\d+)/i.test(userAgent)) {
    const match = userAgent.match(/mac os x (\d+[._]\d+)/i);
    os = `macOS ${match ? match[1]?.replace('_', '.') : ''}`.trim();
  } else if (/android (\d+(\.\d+)?)/i.test(userAgent)) {
    const match = userAgent.match(/android (\d+(\.\d+)?)/i);
    os = `Android ${match ? match[1] : ''}`.trim();
  } else if (/ubuntu/i.test(userAgent)) {
    os = 'Ubuntu Linux';
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux';
  } else if (/cros/i.test(userAgent)) {
    os = 'Chrome OS';
  }

  // 5. Browser detection (order matters for overlapping user agents)
  let browser = 'Unknown Browser';
  if (/edg\/(\d+)/i.test(userAgent)) {
    const match = userAgent.match(/edg\/(\d+)/i);
    browser = `Edge ${match ? match[1] : ''}`.trim();
  } else if (/opr\/(\d+)|opera\/(\d+)/i.test(userAgent)) {
    const match = userAgent.match(/(?:opr|opera)\/(\d+)/i);
    browser = `Opera ${match ? match[1] : ''}`.trim();
  } else if (/chrome\/(\d+)/i.test(userAgent) && !/chromium/i.test(userAgent)) {
    const match = userAgent.match(/chrome\/(\d+)/i);
    browser = `Chrome ${match ? match[1] : ''}`.trim();
  } else if (/version\/(\d+).*safari/i.test(userAgent)) {
    const match = userAgent.match(/version\/(\d+).*safari/i);
    browser = `Safari ${match ? match[1] : ''}`.trim();
  } else if (/firefox\/(\d+)/i.test(userAgent)) {
    const match = userAgent.match(/firefox\/(\d+)/i);
    browser = `Firefox ${match ? match[1] : ''}`.trim();
  } else if (/safari/i.test(userAgent)) {
    browser = 'Safari';
  }

  return {
    deviceType,
    browser,
    os,
    ipAddress,
    city,
    country,
    region,
    location,
    userAgent,
  };
}
