import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

function getUser() {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function isWebSocketEnabled() {
  return Boolean(import.meta.env.VITE_REVERB_HOST);
}

export function getEcho() {
  if (echoInstance) return echoInstance;

  const token = localStorage.getItem('token');
  if (!token) return null;

  const reverbHost = import.meta.env.VITE_REVERB_HOST;
  if (!reverbHost) return null;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const backendOrigin = apiUrl.replace(/\/+$/, '').replace(/\/api$/, '');

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'local-key',
    wsHost: reverbHost,
    wsPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
    wssPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME === 'https'),
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${backendOrigin}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  return echoInstance;
}

export function getUserChannel() {
  const echo = getEcho();
  const user = getUser();
  if (!echo || !user) return null;
  return echo.private(`user.${user.id}`);
}

export function getConversationChannel(conversationId) {
  const echo = getEcho();
  if (!echo) return null;
  return echo.private(`conversation.${conversationId}`);
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
