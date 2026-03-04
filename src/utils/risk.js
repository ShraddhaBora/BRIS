/* ─────────────────────────────────────────────────────────
   src/utils/risk.js
   Single source of truth for:
   - User preferences (compact, notifications, autoSave, mc500)
   - Configurable risk thresholds (moderate%, high%)
   - getCategory() — reads thresholds from prefs, so all pages
     stay in sync even after the user changes them in Settings.
───────────────────────────────────────────────────────── */

export const DEFAULT_PREFS = {
    autoSave: true,
    notifications: true,
    compact: false,
    mc500: true,
    modThreshold: 45,   // % — below this = Stable
    highThreshold: 70,  // % — at or above this = High Risk
};

export function getPrefs() {
    try {
        return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem('bris_prefs') || '{}') };
    } catch {
        return { ...DEFAULT_PREFS };
    }
}

export function savePrefs(updates) {
    const merged = { ...getPrefs(), ...updates };
    localStorage.setItem('bris_prefs', JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('bris-prefs-change', { detail: merged }));
}

/** Returns the risk category for a raw score in [0, 1]. */
export function getCategory(score) {
    const { modThreshold, highThreshold } = getPrefs();
    const pct = score * 100;
    if (pct >= highThreshold) return { label: 'High Risk', cls: 'risk-high', color: 'var(--red)' };
    if (pct >= modThreshold) return { label: 'Moderate', cls: 'risk-med', color: 'var(--amber)' };
    return { label: 'Stable', cls: 'risk-low', color: 'var(--green)' };
}
