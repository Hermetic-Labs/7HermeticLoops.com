/**
 * Download Handler
 *
 * Handles package downloads with iframe-aware logic:
 * - DEV mode (in iframe): Sends postMessage to parent app to add to vault
 * - PRODUCTION mode: Direct download of zip file
 *
 * Two-way communication:
 * - Exchange -> Parent: ADD_TO_VAULT, INSTALL_PACKAGE, REQUEST_VAULT_STATUS
 * - Parent -> Exchange: VAULT_STATUS (list of packages in vault)
 */

export interface PackageDownloadPayload {
  packageSlug: string;
  title: string;
  downloadUrl?: string;
  author?: string;
  version?: string;
  price?: number;
}

// Vault status from parent app
export interface VaultPackage {
  id: string;
  installed: boolean;
}

// Global vault state (updated by parent messages)
let vaultPackages: VaultPackage[] = [];
let vaultStatusListeners: Array<(packages: VaultPackage[]) => void> = [];

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

  // In dev mode, parent could be on various localhost ports
  // Use '*' for dev since ports can vary (5173, 5174, etc.)
  const targetOrigin = isDevMode() ? '*' : window.location.origin;

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

/**
 * Check if a package is in the parent's vault
 */
export function isPackageInVault(packageSlug: string): boolean {
  return vaultPackages.some(p => p.id === packageSlug);
}

/**
 * Check if a package is installed (in vault AND installed)
 */
export function isPackageInstalled(packageSlug: string): boolean {
  const pkg = vaultPackages.find(p => p.id === packageSlug);
  return pkg?.installed ?? false;
}

/**
 * Get current vault packages
 */
export function getVaultPackages(): VaultPackage[] {
  return [...vaultPackages];
}

/**
 * Subscribe to vault status changes
 */
export function subscribeToVaultStatus(listener: (packages: VaultPackage[]) => void): () => void {
  vaultStatusListeners.push(listener);
  // Immediately call with current state
  listener(vaultPackages);
  // Return unsubscribe function
  return () => {
    vaultStatusListeners = vaultStatusListeners.filter(l => l !== listener);
  };
}

/**
 * Request vault status from parent app
 */
export function requestVaultStatus(): void {
  if (shouldUseParentCommunication()) {
    notifyParentApp('REQUEST_VAULT_STATUS', {});
  }
}

/**
 * Initialize listener for parent messages
 * Call this once on app startup
 */
export function initParentMessageListener(): void {
  if (!shouldUseParentCommunication()) return;

  window.addEventListener('message', (event: MessageEvent) => {
    // Accept any localhost origin in dev mode
    if (!event.origin.includes('localhost')) return;

    const { source, action, payload } = event.data || {};
    if (source !== 'hermetic-app') return;

    console.log('[Exchange] Received message from parent:', action, payload);

    if (action === 'VAULT_STATUS' && Array.isArray(payload?.packages)) {
      vaultPackages = payload.packages;
      // Notify all listeners
      vaultStatusListeners.forEach(listener => listener(vaultPackages));
    }
  });

  // Request initial vault status
  requestVaultStatus();
}
