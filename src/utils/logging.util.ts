/**
 * Lemora Wallet Tracker - Logging Utils
 */

export function logDebug(message: string, ...optionalParams: any[]): void {
  console.debug(`DEBUG: ${message}`, ...optionalParams);
}

export function logInfo(message: string, ...optionalParams: any[]): void {
  console.info(`INFO: ${message}`, ...optionalParams);
}

export function logWarning(message: string, ...optionalParams: any[]): void {
  console.warn(`WARNING: ${message}`, ...optionalParams);
}

export function logError(message: string, ...optionalParams: any[]): void {
  console.error(`ERROR: ${message}`, ...optionalParams);
}

