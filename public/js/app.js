// UI wiring: library sidebar, alphaTab player, speed trainer and practice log.
import { DRILLS, CATEGORIES, LEVELS } from './drills.js';
import * as library from './library.js';
import {
    SpeedTrainer, LoopCounter, clampSpeed, summarizeSessions, formatDuration, effectiveBpm,
} from './practice.js';
import {
    parseYouTubeId, parseStartTime, formatTime, parseTime, validateRiff, playerErrorMessage,
} from './youtube.js';
import { YouTubePlayer } from './video.js';
import { RiffTab } from './rifftab.js';
import { drumTrackTex, barsFromScore } from './drums.js';
import { applyTone as applyToneTo } from './tone.js';
import { VENDOR } from './vendor.js';
import {
    APP_NAME, shareUrl, drillFromUrl, shareText, smsHref, facebookHref, isLocalOnly,
} from './share.js';

/* global alphaTab */
const $ = id => document.getElementById(id);
const MIN_SESSION_SECONDS = 10;

const el = {
    fileInput: $('file-input'),
    shareBtn: $('share-btn'),
    shareMenu: $('share-menu'),
    shareSms: $('share-sms'),
    shareFacebook: $('share-facebook'),
    shareCopy: $('share-copy'),
    shareNote: $('share-note'),
    ytAdd: $('yt-add'),
    ytUrl: $('yt-url'),
    videoList: $('video-list'),
    videoListEmpty: $('video-list-empty'),
    videoArea: $('video-area'),
    ytPlayer: $('yt-player'),
    timeline: $('riff-timeline'),
    timelineDraft: $('timeline-draft'),
    timelinePlayhead: $('timeline-playhead'),
    riffName: $('riff-name'),
    riffStart: $('riff-start'),
    riffEnd: $('riff-end'),
    riffSetStart: $('riff-set-start'),
    riffSetEnd: $('riff-set-end'),
    riffSave: $('riff-save'),
    riffNew: $('riff-new'),
    riffDelete: $('riff-delete'),
    metronomeToggle: $('metronome-toggle'),
    drums: $('drums'),
    drumsToggle: $('drums-toggle'),
    tone: $('tone'),
    countInToggle: $('count-in-toggle'),
    goalLabel: $('goal-label'),
    goalUnit: $('goal-unit'),
    tagFilter: $('tag-filter'),
    levelFilter: $('level-filter'),
    songList: $('song-list'),
    songListEmpty: $('song-list-empty'),
    drillGroups: $('drill-groups'),
    drillCount: $('drill-count'),
    drillListEmpty: $('drill-list-empty'),
    overall: $('overall-stats'),
    title: $('song-title'),
    artist: $('song-artist'),
    tip: $('song-tip'),
    trackSelect: $('track-select'),
    muteTrack: $('mute-track'),
    notationToggle: $('notation-toggle'),
    deleteSong: $('delete-song'),
    play: $('play'),
    stop: $('stop'),
    speed: $('speed'),
    speedValue: $('speed-value'),
    bpm: $('bpm'),
    loop: $('loop'),
    metronome: $('metronome'),
    countIn: $('count-in'),
    clearSelection: $('clear-selection'),
    trStart: $('tr-start'),
    trStep: $('tr-step'),
    trTarget: $('tr-target'),
    trLoops: $('tr-loops'),
    trToggle: $('tr-toggle'),
    trBack: $('tr-back'),
    trStatus: $('tr-status'),
    songStats: $('song-stats'),
    goalBpm: $('goal-bpm'),
    goalMeter: $('goal-meter'),
    songTags: $('song-tags'),
    scoreWrap: $('score-wrap'),
    score: $('score'),
    loading: $('loading'),
    drop: $('drop-overlay'),
    toast: $('toast'),
};

const state = {
    current: null,       // { kind: 'drill'|'song'|'video', id, title, artist, tags, goalBpm | goalSpeed }
    mode: 'tab',         // 'tab' (alphaTab) or 'video' (YouTube)
    videos: [],
    video: null,         // open YouTube video record
    draft: { start: null, end: null },  // riff editor range
    scoreTempo: 120,
    userTone: 'distortion', // the listener's saved tone; drills with their own tone override it
    songs: [],
    activeTag: null,
    activeLevel: null,
    closedCategories: new Set(),
    showNotation: false,
    playing: false,
    playingSince: null,  // performance.now() when playback started
    sessionSeconds: 0,
    sessionMaxSpeed: 0,
    trainer: null,
    loopCounter: new LoopCounter(),
    mutedTrack: null,
};

/* ---------- alphaTab setup ---------- */

const api = new alphaTab.AlphaTabApi(el.score, {
    core: { fontDirectory: VENDOR.font },
    display: {
        staveProfile: alphaTab.StaveProfile.Tab,
        layoutMode: alphaTab.LayoutMode.Page,
    },
    player: {
        playerMode: alphaTab.PlayerMode.EnabledAutomatic,
        soundFont: VENDOR.soundFont,
        scrollElement: el.scoreWrap,
        scrollOffsetY: -40,
        enableUserInteraction: true,
    },
});

/* ---------- YouTube player ---------- */

const yt = new YouTubePlayer(el.ytPlayer, {
    onReady: () => { if (state.mode === 'video') setTransportEnabled(true); },
    onStateChange: playing => { if (state.mode === 'video') onPlayingChanged(playing); },
    onLoop: () => { if (state.mode === 'video' && state.trainer && state.playing) onTrainerLoop(); },
    onTime: t => {
        updatePlayhead(t);
        riffTab.syncToTime(t);
    },
    onError: code => toast(playerErrorMessage(code), true),
});

// The transport, speed trainer and practice log talk to whichever player is active.
const tabPlayer = {
    playPause: () => api.playPause(),
    stop: () => api.stop(),
    setSpeed: pct => { api.playbackSpeed = pct / 100; },
    speedPct: () => Math.round(api.playbackSpeed * 100),
    setLooping: on => { api.isLooping = on; },
};
const videoPlayer = {
    playPause: () => yt.playPause(),
    stop: () => yt.stop(),
    setSpeed: pct => { yt.setSpeed(pct / 100); },
    speedPct: () => Math.round(yt.speed * 100),
    setLooping: on => yt.setLooping(on),
};
const player = () => (state.mode === 'video' ? videoPlayer : tabPlayer);

// Tab shown under the video for the selected riff.
const riffTab = new RiffTab({
    toast,
    songs: () => state.songs,
    save: async tab => {
        await saveVideoItem({ tab });
        riffTab.show(state.video.riffs.find(r => r.id === state.current.riffId));
        toast(tab ? 'Tab saved for this riff.' : 'Tab removed from this riff.');
    },
});

// Open the app with ?debug to poke at the players from the dev console.
if (new URLSearchParams(location.search).has('debug')) window.mrt = { api, yt, state, riffTab };

api.renderStarted.on(() => { el.loading.hidden = false; });
api.renderFinished.on(() => { el.loading.hidden = true; });

api.error.on(err => {
    el.loading.hidden = true;
    console.error(err);
    toast(`Couldn't load that file: ${err.message ?? err}`, true);
});

api.soundFontLoad.on(e => {
    if (e.total > 0 && e.loaded < e.total) {
        el.loading.hidden = false;
        el.loading.textContent = `Loading sounds… ${Math.round((e.loaded / e.total) * 100)}%`;
    }
});

api.playerReady.on(() => {
    el.loading.textContent = 'Loading…';
    el.loading.hidden = true;
    if (state.mode === 'tab') setTransportEnabled(true);
});

api.scoreLoaded.on(score => {
    if (state.mode !== 'tab') return;
    el.tone.value = state.current?.tone ?? state.userTone;
    applyTone(score);
    state.scoreTempo = score.tempo || 120;
    state.mutedTrack = null;
    el.muteTrack.classList.remove('active');
    el.muteTrack.textContent = 'Mute this track';
    el.title.textContent = score.title || state.current?.title || 'Untitled';
    el.artist.textContent = state.current?.kind === 'drill'
        ? state.current.artist
        : score.artist || state.current?.artist || '';

    el.trackSelect.replaceChildren(...score.tracks.map((t, i) => {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = t.name || `Track ${i + 1}`;
        return opt;
    }));
    el.trackSelect.disabled = score.tracks.length < 2;
    el.muteTrack.disabled = score.tracks.length < 2;
    updateBpm();
    renderSongPanel();
});

api.playerStateChanged.on(e => {
    if (state.mode === 'tab') onPlayingChanged(e.state === alphaTab.synth.PlayerState.Playing);
});

function onPlayingChanged(playing) {
    if (playing === state.playing) return;
    state.playing = playing;
    el.play.textContent = playing ? '❚❚ Pause' : '▶ Play';
    if (playing) {
        state.playingSince = performance.now();
        state.loopCounter.reset();
        noteSpeed();
    } else {
        accumulatePlayTime();
        saveSession();
    }
}

api.playerPositionChanged.on(e => {
    if (state.mode !== 'tab' || !state.trainer || !state.playing || e.endTick <= 0) return;
    const range = api.playbackRange ?? { startTick: 0, endTick: e.endTick };
    // endTime is already scaled by the playback speed.
    const loopMs = (range.endTick - range.startTick) * (e.endTime / e.endTick);
    if (state.loopCounter.update(e.currentTick, range, loopMs)) onTrainerLoop();
});

api.playbackRangeChanged.on(e => {
    el.clearSelection.hidden = !e.playbackRange;
    // Selecting a riff to drill almost always means you want it looped.
    if (e.playbackRange && !el.loop.checked) {
        el.loop.checked = true;
        api.isLooping = true;
    }
});

/* ---------- Loading songs ---------- */

async function openDrill(drill) {
    await switchAway();
    const prefs = library.getDrillPrefs()[drill.file] ?? {};
    state.current = {
        kind: 'drill',
        id: `drill:${drill.file}`,
        title: drill.title,
        artist: [`${LEVELS[drill.level]} · ${drill.category} drill`, drill.style, drill.tuning, meterSummary(drill)]
            .filter(Boolean).join(' · '),
        tip: drill.tip,
        tags: drill.tags,
        goalBpm: prefs.goalBpm ?? drill.targetTempo,
        file: drill.file,
        tone: drill.tone,
    };
    beginLoad();
    if (drill.startTempo) {
        // The file plays at the goal tempo; start the trainer at the drill's start tempo.
        el.trStart.value = String(Math.round((drill.startTempo / drill.targetTempo) * 100));
        el.trTarget.value = '100';
        el.trStep.value = '5';
        el.trLoops.value = '2';
    }
    try {
        const res = await fetch(new URL(`drills/${drill.file}`, document.baseURI));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // Show only the guitar (track 0); the generated drum track plays along.
        api.tex(withDrums(await res.text(), drill.drums), [0]);
    } catch (err) {
        toast(`Couldn't load drill: ${err.message}`, true);
    }
}

/** Appends a generated drum track that fits the drill's bars and groove. */
function withDrums(tex, style) {
    try {
        const score = alphaTab.importer.ScoreLoader.loadAlphaTex(tex, new alphaTab.Settings());
        return `${tex}\n${drumTrackTex(barsFromScore(score), style)}`;
    } catch (err) {
        console.error('Drum track skipped', err);
        return tex;
    }
}

/* ---------- Sound: guitar tone and drums ---------- */

const isDrumTrack = t => !!t.staves[0]?.isPercussion;
const applyTone = score => applyToneTo(score, el.tone.value, alphaTab.model.AutomationType.Instrument);

function applyMutes() {
    const score = api.score;
    if (!score) return;
    const drums = score.tracks.filter(isDrumTrack);
    if (drums.length) {
        // changeTrackMute silences the synth channel; keep the model's flag in step with it.
        for (const t of drums) t.playbackInfo.isMute = !el.drums.checked;
        api.changeTrackMute(drums, !el.drums.checked);
    }
    if (state.mutedTrack) api.changeTrackMute([state.mutedTrack], true);
}

el.tone.addEventListener('change', () => {
    // On a drill with its own tone (e.g. Clean for country) a change lasts only for that drill.
    if (!state.current?.tone) state.userTone = el.tone.value;
    try {
        localStorage.setItem('mrt:tone', state.userTone);
    } catch {
        // Preference just won't persist.
    }
    if (!api.score) return;
    applyTone(api.score);
    api.loadMidiForScore();
});

el.drums.addEventListener('change', applyMutes);

// Regenerating the playback data resets channel mutes, so re-apply them.
api.midiLoaded.on(() => applyMutes());

/** "4/4 · ♩ 100→170" for drills that list a meter and start tempo. */
function meterSummary(drill) {
    if (!drill.meter) return '';
    const tempo = drill.startTempo ? ` · ♩ ${drill.startTempo}→${drill.targetTempo}` : '';
    return `${drill.meter}${tempo}`;
}

async function openSong(song) {
    await switchAway();
    state.current = {
        kind: 'song',
        id: song.id,
        title: song.title,
        artist: song.artist,
        tags: song.tags,
        goalBpm: song.targetTempo,
    };
    beginLoad();
    api.load(new Uint8Array(song.data), [0]);
}

function beginLoad() {
    setMode(state.current.kind === 'video' ? 'video' : 'tab');
    syncAddressBar();
    el.loading.hidden = state.mode === 'video';
    el.title.textContent = state.current.title;
    el.artist.textContent = state.current.artist;
    el.tip.textContent = state.current.tip ?? '';
    el.tip.hidden = !state.current.tip;
    el.deleteSong.hidden = state.current.kind === 'drill';
    el.deleteSong.textContent = state.current.kind === 'video' ? 'Remove video' : 'Remove song';
    el.goalBpm.disabled = false;
    el.clearSelection.hidden = true;
    setSpeed(100);
    renderLists();
    renderSongPanel();
    setTransportEnabled(state.mode === 'video' ? yt.ready : api.isReadyForPlayback);
}

function setMode(mode) {
    state.mode = mode;
    const video = mode === 'video';
    el.videoArea.hidden = !video;
    el.scoreWrap.hidden = video;
    for (const e of [el.trackSelect, el.muteTrack, el.notationToggle, el.metronomeToggle, el.countInToggle,
        el.bpm, el.drumsToggle, el.tone]) {
        e.hidden = video;
    }
    el.goalLabel.textContent = video ? 'Goal speed' : 'Goal tempo';
    el.goalUnit.textContent = video ? '%' : 'BPM';
    el.goalBpm.min = video ? '25' : '20';
    el.goalBpm.max = video ? '200' : '400';
    if (!video && yt.playing) yt.stop();
    if (!video) riffTab.show(null);
}

async function switchAway() {
    stopTrainer();
    if (state.playing) {
        // The player reports "stopped" asynchronously; mark it now so nothing
        // (speed resets, play time) from the next item is logged against this one.
        noteSpeed();
        player().stop();
        state.playing = false;
        el.play.textContent = '▶ Play';
    }
    accumulatePlayTime();
    await saveSession({ final: true });
}

async function addFile(file) {
    const data = await file.arrayBuffer();
    let score;
    try {
        score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(data), api.settings);
    } catch (err) {
        console.error(err);
        toast(`"${file.name}" isn't a tab format I can read (Guitar Pro 3-7, GPX or MusicXML).`, true);
        return;
    }
    const song = await library.addSong({
        title: score.title || file.name.replace(/\.[^.]+$/, ''),
        artist: score.artist,
        fileName: file.name,
        data,
    });
    await refreshSongs();
    toast(`Added "${song.title}"`);
    openSong(song);
}

/* ---------- Practice session tracking ---------- */

function accumulatePlayTime() {
    if (state.playingSince == null) return;
    state.sessionSeconds += (performance.now() - state.playingSince) / 1000;
    state.playingSince = state.playing ? performance.now() : null;
}

function noteSpeed() {
    if (state.playing) {
        state.sessionMaxSpeed = Math.max(state.sessionMaxSpeed, player().speedPct());
    }
}

// Short plays keep accumulating until they add up to a session. `final` is
// used when leaving a song, where anything under the minimum is dropped.
async function saveSession({ final = false } = {}) {
    noteSpeed();
    const seconds = Math.round(state.sessionSeconds);
    const speed = state.sessionMaxSpeed;
    const songId = state.current?.id;
    if (seconds < MIN_SESSION_SECONDS && !final) return;
    state.sessionSeconds = 0;
    state.sessionMaxSpeed = 0;
    if (!songId || seconds < MIN_SESSION_SECONDS) return;
    try {
        await library.addSession({ songId, seconds, speed });
        renderSongPanel();
        renderOverall();
        renderLists();
    } catch (err) {
        console.error('Failed to save practice session', err);
    }
}

window.addEventListener('pagehide', () => {
    accumulatePlayTime();
    saveSession({ final: true });
});

/* ---------- Transport ---------- */

function setTransportEnabled(enabled) {
    const ready = enabled && !!state.current;
    el.play.disabled = !ready;
    el.stop.disabled = !ready;
    el.trToggle.disabled = !ready;
}

function setSpeed(pct, { fromTrainer = false } = {}) {
    const speed = clampSpeed(pct);
    if (!fromTrainer && state.trainer) stopTrainer();
    noteSpeed();
    player().setSpeed(speed);
    el.speed.value = String(speed);
    el.speedValue.textContent = `${speed}%`;
    noteSpeed();
    updateBpm();
}

function updateBpm() {
    el.bpm.textContent = `${effectiveBpm(state.scoreTempo, Number(el.speed.value))} BPM`;
}

el.play.addEventListener('click', () => player().playPause());
el.stop.addEventListener('click', () => { stopTrainer(); player().stop(); });
el.speed.addEventListener('input', () => setSpeed(Number(el.speed.value)));
el.loop.addEventListener('change', () => player().setLooping(el.loop.checked));
el.metronome.addEventListener('change', () => { api.metronomeVolume = el.metronome.checked ? 1 : 0; });
el.countIn.addEventListener('change', () => { api.countInVolume = el.countIn.checked ? 1 : 0; });
el.clearSelection.addEventListener('click', clearSelection);

function clearSelection() {
    if (state.mode === 'video') {
        if (state.video && state.current?.riffId) openVideo(state.video, null);
        return;
    }
    api.playbackRange = null;
    api.clearPlaybackRangeHighlight();
    el.clearSelection.hidden = true;
}

el.trackSelect.addEventListener('change', () => {
    const track = api.score.tracks[Number(el.trackSelect.value)];
    api.renderTracks([track]);
    if (state.mutedTrack) {
        api.changeTrackMute([state.mutedTrack], false);
        state.mutedTrack = null;
        el.muteTrack.classList.remove('active');
        el.muteTrack.textContent = 'Mute this track';
    }
});

el.muteTrack.addEventListener('click', () => {
    const track = api.score.tracks[Number(el.trackSelect.value)];
    const mute = state.mutedTrack !== track;
    if (state.mutedTrack) api.changeTrackMute([state.mutedTrack], false);
    if (mute) api.changeTrackMute([track], true);
    state.mutedTrack = mute ? track : null;
    el.muteTrack.classList.toggle('active', mute);
    el.muteTrack.textContent = mute ? 'Track muted' : 'Mute this track';
});

el.notationToggle.addEventListener('click', () => {
    state.showNotation = !state.showNotation;
    api.settings.display.staveProfile = state.showNotation
        ? alphaTab.StaveProfile.ScoreTab
        : alphaTab.StaveProfile.Tab;
    api.updateSettings();
    api.render();
    el.notationToggle.textContent = state.showNotation ? 'Tab + notation' : 'Tab only';
});

el.deleteSong.addEventListener('click', async () => {
    const kind = state.current?.kind;
    if (kind !== 'song' && kind !== 'video') return;
    const id = kind === 'video' ? state.current.recId : state.current.id;
    const title = kind === 'video' ? state.video.title : state.current.title;
    const what = kind === 'video' ? 'its riff drills and practice history' : 'its practice history';
    if (!window.confirm(`Remove "${title}" and ${what}?`)) return;
    await switchAway();
    if (kind === 'video') {
        await library.deleteVideo(id);
        state.video = null;
        setMode('tab');
        await refreshVideos();
    } else {
        await library.deleteSong(id);
    }
    state.current = null;
    el.title.textContent = 'Pick a song or drill';
    el.artist.textContent = '';
    el.tip.hidden = true;
    el.deleteSong.hidden = true;
    setTransportEnabled(false);
    await refreshSongs();
    renderSongPanel();
    renderOverall();
    toast(`Removed "${title}"`);
});

/* ---------- Speed trainer ---------- */

el.trToggle.addEventListener('click', () => (state.trainer ? stopTrainer() : startTrainer()));
el.trBack.addEventListener('click', () => {
    if (!state.trainer) return;
    state.trainer.stepBack();
    setSpeed(state.trainer.speed, { fromTrainer: true });
    renderTrainerStatus();
});

function startTrainer() {
    try {
        state.trainer = new SpeedTrainer({
            start: Number(el.trStart.value),
            step: Number(el.trStep.value),
            target: Number(el.trTarget.value),
            loopsPerStep: Number(el.trLoops.value),
        });
    } catch (err) {
        toast(err.message, true);
        return;
    }
    el.loop.checked = true;
    player().setLooping(true);
    setSpeed(state.trainer.speed, { fromTrainer: true });
    el.trToggle.textContent = 'Stop trainer';
    el.trToggle.classList.add('active');
    el.trBack.disabled = false;
    renderTrainerStatus();
    state.loopCounter.reset();
    if (!state.playing) player().playPause();
}

function stopTrainer() {
    if (!state.trainer) return;
    state.trainer = null;
    el.trToggle.textContent = 'Start trainer';
    el.trToggle.classList.remove('active');
    el.trBack.disabled = true;
    el.trStatus.textContent = '';
}

function onTrainerLoop() {
    const trainer = state.trainer;
    if (trainer.loopCompleted()) {
        setSpeed(trainer.speed, { fromTrainer: true });
    }
    if (trainer.done) {
        const loops = trainer.totalLoops;
        stopTrainer();
        toast(`Target reached: ${trainer.target}% after ${loops} loops 🤘`);
        return;
    }
    renderTrainerStatus();
}

function renderTrainerStatus() {
    const t = state.trainer;
    if (!t) return;
    const bpm = state.mode === 'tab' ? ` (${effectiveBpm(state.scoreTempo, t.speed)} BPM)` : '';
    el.trStatus.textContent = `${t.speed}%${bpm} · loop ${t.loopsAtSpeed + 1}/${t.loopsPerStep}`;
}

/* ---------- Progress panel ---------- */

el.goalBpm.addEventListener('change', async () => {
    const cur = state.current;
    if (!cur) return;
    const bpm = Number(el.goalBpm.value) || null;
    if (cur.kind === 'video') {
        cur.goalSpeed = bpm;
        await saveVideoItem({ goalSpeed: bpm });
        renderSongPanel();
        return;
    }
    cur.goalBpm = bpm;
    if (cur.kind === 'drill') {
        library.setDrillPref(cur.file, { goalBpm: bpm });
    } else {
        await library.updateSong(cur.id, { targetTempo: bpm });
        await refreshSongs();
    }
    renderSongPanel();
});

async function renderSongPanel() {
    const cur = state.current;
    if (!cur) {
        el.songStats.replaceChildren();
        el.songTags.replaceChildren();
        el.goalBpm.value = '';
        el.goalBpm.disabled = true;
        setMeter(0);
        return;
    }
    const sessions = await library.listSessions(cur.id).catch(() => []);
    const s = summarizeSessions(sessions);
    if (cur.kind === 'video') {
        const goal = cur.goalSpeed ?? 100;
        el.songStats.replaceChildren(
            stat('Practiced', formatDuration(s.totalSeconds)),
            stat('Sessions', String(s.sessionCount)),
            stat('Best speed', s.bestSpeed ? `${s.bestSpeed}%` : '—'),
            stat('Goal', `${goal}%`),
        );
        el.goalBpm.value = String(goal);
        setMeter(s.bestSpeed ? Math.min(100, (s.bestSpeed / goal) * 100) : 0);
        renderTags();
        return;
    }
    const bestBpm = effectiveBpm(state.scoreTempo, s.bestSpeed);
    const goal = cur.goalBpm ?? state.scoreTempo;

    el.songStats.replaceChildren(
        stat('Practiced', formatDuration(s.totalSeconds)),
        stat('Sessions', String(s.sessionCount)),
        stat('Best speed', s.bestSpeed ? `${s.bestSpeed}%` : '—'),
        stat('Best BPM', s.bestSpeed ? String(bestBpm) : '—'),
    );
    el.goalBpm.value = String(goal);
    setMeter(s.bestSpeed ? Math.min(100, (bestBpm / goal) * 100) : 0);
    renderTags();
}

function stat(label, value) {
    const div = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value;
    div.append(dt, dd);
    return div;
}

function setMeter(pct) {
    el.goalMeter.querySelector('span').style.width = `${pct}%`;
    el.goalMeter.setAttribute('aria-valuenow', String(Math.round(pct)));
    el.goalMeter.classList.toggle('reached', pct >= 100);
}

function renderTags() {
    const cur = state.current;
    const editable = cur.kind === 'song' || cur.kind === 'video';
    const chips = cur.tags.map(tag => {
        const chip = document.createElement(editable ? 'button' : 'span');
        chip.className = 'chip';
        chip.textContent = tag;
        if (editable) {
            chip.title = `Remove tag "${tag}"`;
            const x = document.createElement('span');
            x.className = 'x';
            x.textContent = '×';
            chip.append(x);
            chip.addEventListener('click', () => setSongTags(cur.tags.filter(t => t !== tag)));
        }
        return chip;
    });
    if (editable) {
        const input = document.createElement('input');
        input.placeholder = '+ technique tag';
        input.setAttribute('list', 'tag-suggestions');
        input.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            const tag = input.value.trim().toLowerCase();
            if (tag && !cur.tags.includes(tag)) setSongTags([...cur.tags, tag]);
        });
        chips.push(input, tagSuggestions());
    }
    el.songTags.replaceChildren(...chips);
}

function tagSuggestions() {
    const list = document.createElement('datalist');
    list.id = 'tag-suggestions';
    for (const tag of allTags()) {
        const opt = document.createElement('option');
        opt.value = tag;
        list.append(opt);
    }
    return list;
}

async function setSongTags(tags) {
    state.current.tags = tags;
    if (state.current.kind === 'video') {
        await saveVideoItem({ tags });
    } else {
        await library.updateSong(state.current.id, { tags });
        await refreshSongs();
    }
    renderTags();
}

/** Saves changes to the open riff, or to the video itself when no riff is selected. */
async function saveVideoItem(changes) {
    const video = state.video;
    const riffId = state.current.riffId;
    const updated = riffId
        ? await library.updateVideo(video.id, {
            riffs: video.riffs.map(r => (r.id === riffId ? { ...r, ...changes } : r)),
        })
        : await library.updateVideo(video.id, changes);
    state.video = updated;
    await refreshVideos();
}

/* ---------- Sidebar ---------- */

function allTags() {
    const tags = new Set(DRILLS.flatMap(d => d.tags));
    for (const s of state.songs) s.tags.forEach(t => tags.add(t));
    for (const v of state.videos) {
        v.tags.forEach(t => tags.add(t));
        v.riffs.forEach(r => r.tags.forEach(t => tags.add(t)));
    }
    return [...tags].sort();
}

async function refreshSongs() {
    state.songs = (await library.listSongs()).sort((a, b) => a.title.localeCompare(b.title));
    renderLists();
}

function renderLists() {
    const matchesTag = item => !state.activeTag || item.tags.includes(state.activeTag);

    const videos = state.videos.filter(v => matchesTag(v) || v.riffs.some(matchesTag));
    el.videoList.replaceChildren(...videos.map(video => {
        const riffs = matchesTag(video) ? video.riffs : video.riffs.filter(matchesTag);
        const count = video.riffs.length;
        const meta = [video.author, count ? `${count} riff${count === 1 ? '' : 's'}` : 'no riffs yet']
            .filter(Boolean).join(' · ');
        const li = listItem(video.id, video.title, meta, () => openVideo(video, null));
        if (riffs.length) {
            const ul = document.createElement('ul');
            ul.className = 'song-list riff-list';
            ul.append(...[...riffs].sort((a, b) => a.start - b.start).map(riff =>
                listItem(library.riffSessionId(video.id, riff.id), riff.name,
                    [`${formatTime(riff.start)}–${formatTime(riff.end)}`, riff.tags.join(', ')].filter(Boolean).join(' · '),
                    () => openVideo(video, riff))));
            li.append(ul);
        }
        return li;
    }));
    el.videoListEmpty.hidden = videos.length > 0;
    el.videoListEmpty.textContent = state.videos.length
        ? 'No videos with that tag.'
        : 'No videos yet. Drop a YouTube link here to start.';

    const songs = state.songs.filter(matchesTag);
    el.songList.replaceChildren(...songs.map(song =>
        listItem(song.id, song.title, [song.artist, song.tags.join(', ')].filter(Boolean).join(' · '),
            () => openSong(song))));
    el.songListEmpty.hidden = songs.length > 0;
    el.songListEmpty.textContent = state.songs.length
        ? 'No songs with that tag.'
        : 'No songs yet. Add a Guitar Pro file you own to start.';

    const drills = DRILLS.filter(d => matchesTag(d) && (!state.activeLevel || d.level === state.activeLevel));
    const filtering = !!(state.activeTag || state.activeLevel);
    el.drillCount.textContent = filtering ? `(${drills.length} of ${DRILLS.length})` : `(${DRILLS.length})`;
    el.drillListEmpty.hidden = drills.length > 0;
    el.drillGroups.replaceChildren(...CATEGORIES.map(category => {
        const inCategory = drills
            .filter(d => d.category === category)
            .sort((a, b) => a.level - b.level || a.title.localeCompare(b.title));
        if (!inCategory.length) return null;
        const details = document.createElement('details');
        details.className = 'drill-group';
        // Filtering always expands matches; otherwise remember what the user collapsed.
        details.open = filtering || !state.closedCategories.has(category);
        const summary = document.createElement('summary');
        summary.textContent = `${category} `;
        const count = document.createElement('span');
        count.className = 'count';
        count.textContent = String(inCategory.length);
        summary.append(count);
        details.addEventListener('toggle', () => {
            if (filtering) return;
            if (details.open) state.closedCategories.delete(category);
            else state.closedCategories.add(category);
        });
        const ul = document.createElement('ul');
        ul.className = 'song-list';
        ul.append(...inCategory.map(drill =>
            listItem(`drill:${drill.file}`, drill.title,
                [meterSummary(drill), drill.tags.join(', ')].filter(Boolean).join(' · '),
                () => openDrill(drill), LEVELS[drill.level])));
        details.append(summary, ul);
        return details;
    }).filter(Boolean));

    renderFilterOptions();
}

function renderFilterOptions() {
    const tagOptions = allTags().map(tag => new Option(tag, tag, false, tag === state.activeTag));
    el.tagFilter.replaceChildren(new Option('All techniques', ''), ...tagOptions);
    if (!el.levelFilter.options.length || el.levelFilter.options.length === 1) {
        el.levelFilter.replaceChildren(new Option('All levels', ''),
            ...Object.entries(LEVELS).map(([value, label]) => new Option(label, value)));
    }
}

el.tagFilter.addEventListener('change', () => {
    state.activeTag = el.tagFilter.value || null;
    renderLists();
});

el.levelFilter.addEventListener('change', () => {
    state.activeLevel = Number(el.levelFilter.value) || null;
    renderLists();
});

function listItem(id, title, meta, onClick, badge) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.setAttribute('aria-current', String(state.current?.id === id));
    const t = document.createElement('span');
    t.className = 'title';
    t.textContent = title;
    if (badge) {
        const b = document.createElement('span');
        b.className = `level level-${badge.toLowerCase()}`;
        b.textContent = badge;
        t.append(' ', b);
    }
    const m = document.createElement('span');
    m.className = 'meta';
    m.textContent = meta;
    btn.append(t, m);
    btn.addEventListener('click', onClick);
    li.append(btn);
    return li;
}

async function renderOverall() {
    const sessions = await library.listAllSessions().catch(() => []);
    const s = summarizeSessions(sessions);
    el.overall.innerHTML = '';
    const line = (label, value) => {
        const p = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = value;
        p.append(`${label}: `, strong);
        return p;
    };
    el.overall.append(
        line('Total practice', formatDuration(s.totalSeconds)),
        line('Day streak', `${s.streak} ${s.streak === 1 ? 'day' : 'days'}`),
    );
}

/* ---------- File input & drag-and-drop ---------- */

el.fileInput.addEventListener('change', () => {
    const file = el.fileInput.files[0];
    el.fileInput.value = '';
    if (file) addFile(file);
});

// Accept tab files and YouTube links dragged from the address bar, a thumbnail
// or any link. While dragging, a full-page overlay catches the drop so it
// can't land inside the YouTube iframe (which would swallow it).
let internalDrag = false;
window.addEventListener('dragstart', () => { internalDrag = true; });
window.addEventListener('dragend', () => { internalDrag = false; });

const isDroppable = dt => !!dt && ['Files', 'text/uri-list', 'text/plain'].some(t => dt.types.includes(t));

window.addEventListener('dragenter', e => {
    if (internalDrag || !isDroppable(e.dataTransfer)) return;
    el.drop.hidden = false;
});
el.drop.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});
el.drop.addEventListener('dragleave', () => { el.drop.hidden = true; });
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => {
    e.preventDefault();
    el.drop.hidden = true;
    if (internalDrag) return;
    handleDropped(e.dataTransfer);
});

function handleDropped(dt) {
    const file = dt?.files[0];
    if (file) {
        addFile(file);
        return;
    }
    const text = dt?.getData('text/uri-list') || dt?.getData('text/plain') || '';
    if (text) addVideoFromLink(text);
}

// Ctrl+V anywhere (outside text fields) adds a YouTube link from the clipboard.
document.addEventListener('paste', e => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const text = e.clipboardData?.getData('text') ?? '';
    if (!parseYouTubeId(text)) return;
    e.preventDefault();
    addVideoFromLink(text);
});

el.ytAdd.addEventListener('submit', async e => {
    e.preventDefault();
    if (await addVideoFromLink(el.ytUrl.value)) el.ytUrl.value = '';
});

/* ---------- YouTube songs and riff drills ---------- */

async function refreshVideos() {
    state.videos = (await library.listVideos()).sort((a, b) => a.title.localeCompare(b.title));
    renderLists();
}

async function addVideoFromLink(text) {
    const videoId = parseYouTubeId(text);
    if (!videoId) {
        toast('That doesn\'t look like a YouTube video link.', true);
        return false;
    }
    const startAt = parseStartTime(text.trim());
    const existing = state.videos.find(v => v.videoId === videoId);
    if (existing) {
        toast(`"${existing.title}" is already in your library.`);
        await openVideo(existing, null, startAt);
        return true;
    }
    let video = await library.addVideo({ videoId });
    await refreshVideos();
    await openVideo(video, null, startAt);
    // The player knows the title and channel once the video is cued.
    const info = await waitForVideoInfo();
    // The video may have been removed while we waited for its title.
    if (!(await library.getVideo(video.id))) return true;
    if (info.title) {
        video = await library.updateVideo(video.id, { title: info.title, author: info.author });
        state.video = video;
        if (state.current?.recId === video.id && !state.current.riffId) {
            applyVideoCurrent(video, null);
            el.title.textContent = state.current.title;
            el.artist.textContent = state.current.artist;
        }
        await refreshVideos();
    }
    toast(`Added "${video.title}". Mark a riff's start and end below to make it a drill.`);
    return true;
}

async function waitForVideoInfo(timeoutMs = 5000) {
    const until = performance.now() + timeoutMs;
    while (performance.now() < until) {
        const info = yt.info;
        if (info.title) return info;
        await new Promise(r => setTimeout(r, 200));
    }
    return yt.info;
}

function applyVideoCurrent(video, riff) {
    const item = riff ?? video;
    state.current = {
        kind: 'video',
        id: library.riffSessionId(video.id, riff?.id),
        recId: video.id,
        riffId: riff?.id ?? null,
        title: riff ? riff.name : video.title,
        artist: riff
            ? `Riff from ${video.title} · ${formatTime(riff.start)}–${formatTime(riff.end)}`
            : [video.author, 'YouTube'].filter(Boolean).join(' · '),
        tip: riff ? null : 'Play the video and mark a riff with [ and ] (or "Set to now"), then save it as a drill.',
        tags: item.tags,
        goalSpeed: item.goalSpeed ?? 100,
    };
}

async function openVideo(video, riff = null, startAt = null) {
    await switchAway();
    state.video = video;
    applyVideoCurrent(video, riff);
    beginLoad();
    if (yt.videoId !== video.videoId) {
        setTransportEnabled(false);
        try {
            await yt.load(video.videoId, riff?.start ?? startAt ?? 0);
        } catch (err) {
            toast(err.message, true);
            return;
        }
    } else if (startAt != null) {
        yt.seek(startAt);
    }
    yt.setRange(riff);
    if (riff) {
        el.loop.checked = true;
        yt.seek(riff.start);
    }
    yt.setLooping(el.loop.checked);
    el.clearSelection.hidden = !riff;
    el.clearSelection.textContent = 'Whole video';
    setDraft(riff ? { start: riff.start, end: riff.end } : { start: null, end: null });
    el.riffName.value = riff?.name ?? '';
    el.riffSave.textContent = riff ? 'Update drill' : 'Save as drill';
    el.riffDelete.hidden = !riff;
    riffTab.show(riff);
    setTransportEnabled(yt.ready);
    renderTimeline();
}

function setDraft({ start, end }) {
    state.draft = { start, end };
    el.riffStart.value = start == null ? '' : formatTime(start);
    el.riffEnd.value = end == null ? '' : formatTime(end);
    renderTimeline();
}

function readDraftInput(input, key) {
    const value = input.value.trim() === '' ? null : parseTime(input.value);
    if (input.value.trim() !== '' && value == null) {
        toast('Use a time like 1:23.5', true);
        return;
    }
    state.draft[key] = value;
    renderTimeline();
}

el.riffStart.addEventListener('change', () => readDraftInput(el.riffStart, 'start'));
el.riffEnd.addEventListener('change', () => readDraftInput(el.riffEnd, 'end'));
el.riffSetStart.addEventListener('click', () => markNow('start'));
el.riffSetEnd.addEventListener('click', () => markNow('end'));

function markNow(key) {
    if (state.mode !== 'video' || !yt.ready) return;
    setDraft({ ...state.draft, [key]: Math.round(yt.currentTime * 10) / 10 });
}

el.riffSave.addEventListener('click', async () => {
    const video = state.video;
    if (!video) return;
    const { start, end } = state.draft;
    const error = validateRiff(start, end, yt.duration);
    if (error) {
        toast(error, true);
        return;
    }
    const existingId = state.current.riffId;
    const name = el.riffName.value.trim() || `Riff ${video.riffs.length + (existingId ? 0 : 1)}`;
    let riff;
    let riffs;
    if (existingId) {
        riffs = video.riffs.map(r => (r.id === existingId ? { ...r, name, start, end } : r));
        riff = riffs.find(r => r.id === existingId);
    } else {
        riff = { id: crypto.randomUUID().slice(0, 8), name, start, end, tags: [], goalSpeed: 100 };
        riffs = [...video.riffs, riff];
    }
    const updated = await library.updateVideo(video.id, { riffs });
    await refreshVideos();
    toast(existingId ? `Updated "${name}"` : `Saved "${name}" as a drill. Try the speed trainer on it.`);
    await openVideo(updated, riff);
});

el.riffNew.addEventListener('click', () => {
    if (state.video) openVideo(state.video, null);
});

el.riffDelete.addEventListener('click', async () => {
    const video = state.video;
    const riffId = state.current?.riffId;
    if (!video || !riffId) return;
    const riff = video.riffs.find(r => r.id === riffId);
    if (!window.confirm(`Delete the riff drill "${riff.name}" and its practice history?`)) return;
    await switchAway();
    const updated = await library.updateVideo(video.id, { riffs: video.riffs.filter(r => r.id !== riffId) });
    await library.deleteSessionsFor(library.riffSessionId(video.id, riffId));
    await refreshVideos();
    toast(`Deleted "${riff.name}"`);
    await openVideo(updated, null);
});

function renderTimeline() {
    const duration = yt.duration;
    const video = state.video;
    el.timeline.querySelectorAll('.timeline-riff').forEach(n => n.remove());
    if (!duration || !video) {
        el.timelineDraft.hidden = true;
        return;
    }
    const pct = t => `${(t / duration) * 100}%`;
    for (const riff of video.riffs) {
        const seg = document.createElement('button');
        seg.className = 'timeline-riff';
        seg.classList.toggle('active', riff.id === state.current?.riffId);
        seg.style.left = pct(riff.start);
        seg.style.width = pct(riff.end - riff.start);
        seg.title = `${riff.name} (${formatTime(riff.start)}–${formatTime(riff.end)})`;
        seg.setAttribute('aria-label', `Open riff ${riff.name}`);
        seg.addEventListener('click', e => {
            e.stopPropagation();
            openVideo(video, riff);
        });
        el.timeline.insertBefore(seg, el.timelinePlayhead);
    }
    const { start, end } = state.draft;
    const hasDraft = start != null && end != null && end > start;
    el.timelineDraft.hidden = !hasDraft;
    if (hasDraft) {
        el.timelineDraft.style.left = pct(start);
        el.timelineDraft.style.width = pct(end - start);
    }
    updatePlayhead(yt.currentTime);
}

function updatePlayhead(t) {
    const duration = yt.duration;
    if (!duration) return;
    el.timelinePlayhead.style.left = `${Math.min(100, (t / duration) * 100)}%`;
}

el.timeline.addEventListener('click', e => {
    const duration = yt.duration;
    if (!duration) return;
    const rect = el.timeline.getBoundingClientRect();
    const t = ((e.clientX - rect.left) / rect.width) * duration;
    yt.seek(Math.max(0, Math.min(duration, t)));
});

/* ---------- Keyboard shortcuts ---------- */

window.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = e.target.tagName;
    // Ignore keys typed into text fields and dropdowns; checkboxes and buttons still get shortcuts.
    const typing = e.target.matches?.('input:not([type=checkbox]):not([type=radio]):not([type=range]), select, textarea');
    if (typing) return;
    if (!state.current || el.play.disabled) return;

    switch (e.key) {
        case ' ':
            // Let Space activate a focused button normally.
            if (tag === 'BUTTON') return;
            e.preventDefault();
            player().playPause();
            break;
        case 's': case 'S':
            stopTrainer();
            player().stop();
            break;
        case '[':
            markNow('start');
            break;
        case ']':
            markNow('end');
            break;
        case 'l': case 'L':
            el.loop.click();
            break;
        case 'd': case 'D':
            if (state.mode === 'tab') el.drums.click();
            break;
        case 'm': case 'M':
            if (state.mode === 'tab') el.metronome.click();
            break;
        case '+': case '=':
            setSpeed(Number(el.speed.value) + 5);
            break;
        case '-': case '_':
            setSpeed(Number(el.speed.value) - 5);
            break;
        case 'Escape':
            clearSelection();
            break;
    }
});

/* ---------- Sharing ---------- */

function currentShare() {
    const drill = state.current?.kind === 'drill' ? state.current : null;
    return {
        url: shareUrl(location.href, drill?.file ?? null),
        text: shareText(drill?.title ?? null),
        // Songs and YouTube riffs live only in this browser, so those share the app instead.
        privateItem: !!state.current && !drill,
    };
}

el.shareBtn.addEventListener('click', async () => {
    if (!el.shareMenu.hidden) {
        closeShareMenu();
        return;
    }
    const { url, text } = currentShare();
    // Phones: the built-in share sheet (Messages, Facebook, WhatsApp...).
    if (navigator.share && !isLocalOnly(location.href)) {
        try {
            await navigator.share({ title: APP_NAME, text, url });
            return;
        } catch (err) {
            if (err.name === 'AbortError') return;
        }
    }
    openShareMenu();
});

function openShareMenu() {
    const { url, text, privateItem } = currentShare();
    el.shareSms.href = smsHref(text, url);
    el.shareFacebook.href = facebookHref(url);
    const notes = [];
    if (isLocalOnly(location.href)) {
        notes.push('This copy is running on your computer, so the link won\'t open on other people\'s phones yet. Put the app online first (see "Share it online" in the README).');
    }
    if (privateItem) notes.push('Your own songs and YouTube riffs stay on this device, so this shares the app itself.');
    el.shareNote.textContent = notes.join(' ');
    el.shareNote.hidden = !notes.length;
    el.shareMenu.hidden = false;
    el.shareBtn.setAttribute('aria-expanded', 'true');
}

function closeShareMenu() {
    el.shareMenu.hidden = true;
    el.shareBtn.setAttribute('aria-expanded', 'false');
}

el.shareCopy.addEventListener('click', async () => {
    const { url } = currentShare();
    try {
        await navigator.clipboard.writeText(url);
        toast('Link copied. Paste it into a text or post.');
    } catch {
        window.prompt('Copy this link:', url);
    }
    closeShareMenu();
});

for (const link of [el.shareSms, el.shareFacebook]) link.addEventListener('click', () => closeShareMenu());
document.addEventListener('click', e => {
    if (!el.shareMenu.hidden && !e.target.closest('.share-wrap')) closeShareMenu();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !el.shareMenu.hidden) closeShareMenu();
});

/** Keep the address bar pointing at the open drill, so it can be copied and shared too. */
function syncAddressBar() {
    const url = new URL(location.href);
    if (state.current?.kind === 'drill') url.searchParams.set('drill', state.current.file.replace(/\.alphatex$/, ''));
    else url.searchParams.delete('drill');
    if (url.href !== location.href) history.replaceState(null, '', url);
}

/* ---------- Misc ---------- */

let toastTimer;
function toast(message, isError = false) {
    el.toast.textContent = message;
    el.toast.classList.toggle('error', isError);
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.toast.hidden = true; }, isError ? 6000 : 3000);
}

// Start-up
try {
    const savedTone = localStorage.getItem('mrt:tone');
    if (savedTone && [...el.tone.options].some(o => o.value === savedTone)) state.userTone = savedTone;
} catch {
    // Storage unavailable; keep the default tone.
}
el.tone.value = state.userTone;
api.metronomeVolume = 0;
api.countInVolume = 0;
await refreshVideos().catch(err => console.error(err));
await refreshSongs().catch(err => {
    console.error(err);
    toast('Song library unavailable in this browser mode; drills still work.', true);
});
renderOverall();
// A shared link like ?drill=dm-slam-groove opens that drill.
openDrill(drillFromUrl(location.href, DRILLS) ?? DRILLS[0]);
