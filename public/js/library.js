// Persistent storage (IndexedDB) for the user's own tab files and practice sessions.
// Nothing leaves the browser.

const DB_NAME = 'metal-riff-trainer';
const DB_VERSION = 2;

let dbPromise = null;

function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = e => {
            const db = req.result;
            if (e.oldVersion < 1) {
                // { id, title, artist, fileName, data: ArrayBuffer, tags: string[], targetTempo, addedAt }
                db.createObjectStore('songs', { keyPath: 'id' });
                // { id (auto), songId, date, seconds, speed }
                const sessions = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
                sessions.createIndex('songId', 'songId');
            }
            if (e.oldVersion < 2) {
                // { id, videoId, title, author, tags, goalSpeed, addedAt,
                //   riffs: [{ id, name, start, end, tags, goalSpeed }] }
                db.createObjectStore('videos', { keyPath: 'id' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    return dbPromise;
}

async function run(storeName, mode, fn) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const req = fn(tx.objectStore(storeName));
        tx.oncomplete = () => resolve(req?.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

export function listSongs() {
    return run('songs', 'readonly', store => store.getAll());
}

export function getSong(id) {
    return run('songs', 'readonly', store => store.get(id));
}

export async function addSong({ title, artist, fileName, data }) {
    const song = {
        id: `song:${crypto.randomUUID()}`,
        title: title || fileName,
        artist: artist || '',
        fileName,
        data,
        tags: [],
        targetTempo: null,
        addedAt: new Date(),
    };
    await run('songs', 'readwrite', store => store.put(song));
    return song;
}

export async function updateSong(id, changes) {
    const song = await getSong(id);
    if (!song) throw new Error(`Song ${id} not found`);
    const updated = { ...song, ...changes, id };
    await run('songs', 'readwrite', store => store.put(updated));
    return updated;
}

export async function deleteSong(id) {
    await run('songs', 'readwrite', store => store.delete(id));
    const sessions = await listSessions(id);
    await run('sessions', 'readwrite', store => {
        for (const s of sessions) store.delete(s.id);
    });
}

/* ---------- YouTube videos and their riff drills ---------- */

export function listVideos() {
    return run('videos', 'readonly', store => store.getAll());
}

export function getVideo(id) {
    return run('videos', 'readonly', store => store.get(id));
}

export async function addVideo({ videoId, title, author }) {
    const video = {
        id: `yt:${crypto.randomUUID()}`,
        videoId,
        title: title || 'YouTube video',
        author: author || '',
        tags: [],
        goalSpeed: 100,
        riffs: [],
        addedAt: new Date(),
    };
    await run('videos', 'readwrite', store => store.put(video));
    return video;
}

export async function updateVideo(id, changes) {
    const video = await getVideo(id);
    if (!video) throw new Error(`Video ${id} not found`);
    const updated = { ...video, ...changes, id };
    await run('videos', 'readwrite', store => store.put(updated));
    return updated;
}

/** Practice-log id for a riff (or for the whole video when riffId is null). */
export function riffSessionId(videoRecordId, riffId) {
    return riffId ? `riff:${videoRecordId}:${riffId}` : videoRecordId;
}

export async function deleteVideo(id) {
    const video = await getVideo(id);
    await run('videos', 'readwrite', store => store.delete(id));
    const ids = [id, ...(video?.riffs ?? []).map(r => riffSessionId(id, r.id))];
    for (const songId of ids) await deleteSessionsFor(songId);
}

export async function deleteSessionsFor(songId) {
    const sessions = await listSessions(songId);
    await run('sessions', 'readwrite', store => {
        for (const s of sessions) store.delete(s.id);
    });
}

export function addSession({ songId, seconds, speed }) {
    return run('sessions', 'readwrite', store =>
        store.add({ songId, date: new Date(), seconds, speed }));
}

export function listSessions(songId) {
    return run('sessions', 'readonly', store => store.index('songId').getAll(songId));
}

export function listAllSessions() {
    return run('sessions', 'readonly', store => store.getAll());
}

// Drill settings (target tempo overrides) are small, so they live in localStorage.
const DRILL_PREFS_KEY = 'mrt:drill-prefs';

export function getDrillPrefs() {
    try {
        return JSON.parse(localStorage.getItem(DRILL_PREFS_KEY)) ?? {};
    } catch {
        return {};
    }
}

export function setDrillPref(file, prefs) {
    const all = getDrillPrefs();
    all[file] = { ...all[file], ...prefs };
    try {
        localStorage.setItem(DRILL_PREFS_KEY, JSON.stringify(all));
    } catch {
        // Storage unavailable (private mode); preference just won't persist.
    }
}
