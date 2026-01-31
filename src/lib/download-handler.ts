/**
 * Download Handler
 *
 * Handles package downloads with iframe-aware logic:
 * - DEV mode (in iframe): Sends postMessage to parent app to add to vault
 * - PRODUCTION mode: Direct download of zip file
 */

export interface PackageDownloadPayload {
  packageSlug: string;
  title: string;
  downloadUrl?: string;
  author?: string;
  version?: string;
  price?: number;
}

/**
 * Check if running inside an iframe
 */
export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to cross-origin, we're in an iframe
    return true;
  }
}

/**
 * Check if running in dev mode (localhost)
 */
export function isDevMode(): boolean {
  return import.meta.env.DEV ||
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
}

/**
 * Check if we should use iframe communication (dev mode + in iframe)
 */
export function shouldUseParentCommunication(): boolean {
  return isDevMode() && isInIframe();
}

/**
 * Send a message to the parent window
 */
export function notifyParentApp(action: string, payload: any): void {
  if (!window.parent || window.parent === window) {
    console.warn('[Exchange] Not in iframe, cannot notify parent');
    return;
  }

  const message = {
    source: 'hermetic-labs-exchange',
    action,
    payload,
    timestamp: Date.now(),
  };

  // In dev mode, parent is localhost:5173 (Final Production)
  // Use '*' for simplicity, or specify origin for security
  const targetOrigin = isDevMode() ? 'http://localhost:5173' : '*';

  window.parent.postMessage(message, targetOrigin);
  console.log('[Exchange] Sent message to parent:', action, payload);
}

/**
 * Handle package download/get action
 *
 * In dev mode (iframed): Tells parent app to add package to vault
 * In production: Opens download URL directly
 */
export function handlePackageDownload(
  packageSlug: string,
  title: string,
  downloadUrl?: string,
  metadata?: Partial<PackageDownloadPayload>
): void {
  if (shouldUseParentCommunication()) {
    // DEV mode in iframe: Send to parent app
    notifyParentApp('ADD_TO_VAULT', {
      packageSlug,
      title,
      downloadUrl,
      ...metadata,
    });
  } else {
    // PRODUCTION mode: Direct download
    if (downloadUrl) {
      // Create temporary link and click it
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${packageSlug}.zip`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('[Exchange] No download URL available for', packageSlug);
    }
  }
}

/**
 * Handle install action (download + install)
 * Only meaningful in dev mode where parent can install directly
 */
export function handlePackageInstall(
  packageSlug: string,
  title: string,
  downloadUrl?: string,
  metadata?: Partial<PackageDownloadPayload>
): void {
  if (shouldUseParentCommunication()) {
    // DEV mode: Tell parent to add to vault AND install
    notifyParentApp('INSTALL_PACKAGE', {
      packageSlug,
      title,
      downloadUrl,
      ...metadata,
    });
  } else {
    // Production: Just download, user will install manually
    handlePackageDownload(packageSlug, title, downloadUrl, metadata);
  }
}
