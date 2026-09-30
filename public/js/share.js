// Sharing helpers: links to the app or to a drill, and text-message / Facebook
// share links. Pure functions so they can be unit-tested in Node.

export const APP_NAME = 'Metal Riff Trainer';

/** Drill file name -> short id used in links ("gallop-drill.alphatex" -> "gallop-drill"). */
export const drillSlug = file => file.replace(/\.alphatex$/, '');

/**
 * The link to share. `pageUrl` is the current address; any query/hash is dropped
 * so private state never leaks into a shared link.
 */
export function shareUrl(pageUrl, drillFile = null) {
    const url = new URL(pageUrl);
    url.search = '';
    url.hash = '';
    if (drillFile) url.searchParams.set('drill', drillSlug(drillFile));
    return url.href;
}

/** Finds the drill a shared link points at (accepts the id with or without ".alphatex"). */
export function drillFromUrl(pageUrl, drills) {
    const id = new URL(pageUrl).searchParams.get('drill');
    if (!id) return null;
    const slug = drillSlug(id.trim().toLowerCase());
    return drills.find(d => drillSlug(d.file) === slug) ?? null;
}

export function shareText(drillTitle = null) {
    return drillTitle
        ? `Try the "${drillTitle}" drill on ${APP_NAME} 🤘`
        : `${APP_NAME}: free metal guitar practice with tab, drums, a speed trainer and YouTube riff looping 🤘`;
}

/** Opens the phone's messaging app with the text filled in (works on iPhone and Android). */
export function smsHref(text, url) {
    return `sms:?&body=${encodeURIComponent(`${text} ${url}`)}`;
}

/** Facebook's share dialog. Facebook reads the title, description and image from the page itself. */
export function facebookHref(url) {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/** True when the app is only running on this computer, so a link wouldn't open elsewhere. */
export function isLocalOnly(pageUrl) {
    const { protocol, hostname } = new URL(pageUrl);
    if (protocol === 'file:') return true;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
        || hostname.endsWith('.localhost') || /^(10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(hostname);
}
