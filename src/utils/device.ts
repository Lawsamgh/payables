/**
 * Detects if the user is on a mobile device (phone or tablet).
 * Used to restrict app access to VendorCollectView only on mobile.
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return false;
  }
  const ua = navigator.userAgent;
  const mobileKeywords =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isTabletOrPhone =
    mobileKeywords.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return isTabletOrPhone || window.innerWidth < 768;
}
