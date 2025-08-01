/**
 * Lemora Wallet Tracker - WebSocket Utils
 */

export function connectWebSocket(url: string, protocols?: string | string[]): WebSocket {
  const ws = new WebSocket(url, protocols);
  ws.onopen = () => console.log('WebSocket connection opened');
  ws.onerror = (error) => console.error('WebSocket error:', error);
  ws.onclose = () => console.log('WebSocket connection closed');
  return ws;
}
