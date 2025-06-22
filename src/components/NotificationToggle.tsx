'use client';

interface NotificationToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function NotificationToggle({ enabled, onToggle }: NotificationToggleProps) {
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          onToggle();
        }
      });
    } else {
      onToggle();
    }
  };

  const handleToggle = () => {
    if (!enabled && 'Notification' in window && Notification.permission !== 'granted') {
      requestNotificationPermission();
    } else {
      onToggle();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
} 