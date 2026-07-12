export function getPrivacySetting(id: 'private' | 'hide_age' | 'hide_dist' | 'antifraud'): boolean {
  const stored = localStorage.getItem('matchdeck_privacy');
  if (!stored) {
    // Default preferences
    if (id === 'hide_dist' || id === 'antifraud') return true;
    return false;
  }
  try {
    const prefs = JSON.parse(stored);
    const item = prefs.find((p: any) => p.id === id);
    return item ? !!item.checked : false;
  } catch (e) {
    return false;
  }
}

export function getSystemSetting(id: 'push' | 'email' | 'sounds' | '2fa'): boolean {
  const stored = localStorage.getItem('matchdeck_settings');
  if (!stored) {
    // Default system settings
    if (id === 'push' || id === 'sounds') return true;
    return false;
  }
  try {
    const prefs = JSON.parse(stored);
    const item = prefs.find((p: any) => p.id === id);
    return item ? !!item.checked : false;
  } catch (e) {
    return false;
  }
}

