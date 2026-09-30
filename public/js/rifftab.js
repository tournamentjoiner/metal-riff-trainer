// Tab panel for YouTube riff drills: shows tab for the selected riff, either
// typed/pasted as text or taken from a bar range of a Guitar Pro song in the
// library, with a cursor that follows the video.
import { asciiTabToAlphaTex } from './asciitab.js';
import * as library from './library.js';
import { tickForProgress } from './practice.js';
import { VENDOR } from './vendor.js';

/* global alphaTab */
const $ = id => document.getElementById(id);

export class RiffTab {
    /**
     * @param handlers { toast(msg, isError), save(tab|null) -> Promise, songs() -> song[] }
     */
    constructor(handlers) {
        this.handlers = handlers;
        this.el = {
            panel: $('riff-tab-panel'),
            area: $('video-area'),
            heading: $('riff-tab-heading'),
            edit: $('tab-edit'),
            remove: $('tab-remove'),
            empty: $('tab-empty'),
            pasteBtn: $('tab-paste-btn'),
            linkBtn: $('tab-link-btn'),
            pasteForm: $('tab-paste-form'),
            text: $('tab-text'),
            pasteStatus: $('tab-paste-status'),
            pasteSave: $('tab-paste-save'),
            linkForm: $('tab-link-form'),
            song: $('tab-song'),
            track: $('tab-track'),
            barStart: $('tab-bar-start'),
            barEnd: $('tab-bar-end'),
            linkStatus: $('tab-link-status'),
            linkSave: $('tab-link-save'),
            view: $('tab-view'),
            score: $('riff-tab-score'),
            note: $('tab-note'),
        };
        this.api = null;
        this.riff = null;
        this.range = null;      // { startTick, endTick } the riff's tab covers
        this.beats = [];        // [{ tick, duration }] written notes in that range, for the cursor
        this.linkedScore = null;
        this.previewTimer = null;
        this.#wire();
    }

    /** Show the panel for a riff (or hide it when riff is null). */
    show(riff) {
        this.riff = riff;
        this.el.panel.hidden = !riff;
        this.el.area.classList.toggle('has-tab', !!riff?.tab);
        if (!riff) return;
        this.el.heading.textContent = `Tab: ${riff.name}`;
        this.#closeForms();
        if (riff.tab) this.#render(riff.tab);
        else this.#setView('empty');
    }

    /** Move the tab cursor to match the video's time within the riff. */
    syncToTime(seconds) {
        const r = this.riff;
        if (!r?.tab || !this.beats.length || !this.api?.isReadyForPlayback) return;
        const tick = tickForProgress(this.beats, (seconds - r.start) / (r.end - r.start));
        if (Math.abs(tick - (this.lastTick ?? -1)) < 10) return;
        this.lastTick = tick;
        this.api.tickPosition = tick;
    }

    /* ---------- rendering ---------- */

    #ensureApi() {
        if (this.api) return this.api;
        this.api = new alphaTab.AlphaTabApi(this.el.score, {
            core: { fontDirectory: VENDOR.font },
            display: { staveProfile: alphaTab.StaveProfile.Tab, layoutMode: alphaTab.LayoutMode.Page },
            player: {
                // The player is only used to drive the cursor; it never makes sound.
                playerMode: alphaTab.PlayerMode.EnabledSynthesizer,
                soundFont: VENDOR.soundFont,
                scrollElement: this.el.view,
                enableUserInteraction: false,
            },
        });
        this.api.masterVolume = 0;
        this.api.scoreLoaded.on(score => this.#onScoreLoaded(score));
        this.api.error.on(err => {
            console.error(err);
            this.handlers.toast(`Couldn't draw the tab: ${err.message ?? err}`, true);
        });
        return this.api;
    }

    async #render(tab) {
        this.#setView('tab');
        this.el.note.textContent = '';
        this.range = null;
        this.lastTick = null;
        const api = this.#ensureApi();
        if (tab.source === 'text') {
            let result;
            try {
                result = asciiTabToAlphaTex(tab.text, { title: this.riff.name });
            } catch (err) {
                this.el.note.textContent = err.message;
                return;
            }
            this.pending = { startBar: 1, endBar: result.barCount };
            api.settings.display.startBar = 1;
            api.settings.display.barCount = -1;
            api.updateSettings();
            api.tex(result.tex);
            this.el.note.textContent = result.warnings.join(' ');
            return;
        }
        const song = await library.getSong(tab.songId);
        if (!song) {
            this.el.note.textContent = 'The Guitar Pro song this tab came from was removed. Link another song or paste the tab.';
            this.#setView('tab-missing');
            return;
        }
        this.pending = { startBar: tab.startBar, endBar: tab.endBar, track: tab.trackIndex ?? 0 };
        api.settings.display.startBar = tab.startBar;
        api.settings.display.barCount = tab.endBar - tab.startBar + 1;
        api.updateSettings();
        api.load(new Uint8Array(song.data), [tab.trackIndex ?? 0]);
        this.el.note.textContent = `From "${song.title}", bars ${tab.startBar}–${tab.endBar}.`;
    }

    #onScoreLoaded(score) {
        const bars = score.masterBars;
        const { startBar, endBar, track = 0 } = this.pending ?? { startBar: 1, endBar: bars.length };
        const from = Math.min(startBar, bars.length) - 1;
        const to = Math.min(endBar, bars.length) - 1;
        const first = bars[from];
        const last = bars[to];
        this.range = first && last
            ? { startTick: first.start, endTick: last.start + last.calculateDuration() }
            : null;
        // Absolute position of every written note (not rest) in the range.
        const staffBars = score.tracks[track]?.staves[0]?.bars ?? [];
        this.beats = [];
        for (let i = from; i <= to && i >= 0; i++) {
            for (const beat of staffBars[i]?.voices[0]?.beats ?? []) {
                if (beat.isRest && !beat.notes.length) continue;
                this.beats.push({ tick: bars[i].start + beat.playbackStart, duration: beat.playbackDuration });
            }
        }
        this.lastTick = null;
    }

    /* ---------- editing ---------- */

    #wire() {
        const e = this.el;
        e.pasteBtn.addEventListener('click', () => this.#openPaste());
        e.linkBtn.addEventListener('click', () => this.#openLink());
        e.edit.addEventListener('click', () => {
            if (this.riff?.tab?.source === 'song') this.#openLink();
            else this.#openPaste();
        });
        e.remove.addEventListener('click', async () => {
            if (!window.confirm('Remove the tab from this riff?')) return;
            await this.handlers.save(null);
        });
        for (const btn of this.el.panel.querySelectorAll('[data-tab-cancel]')) {
            btn.addEventListener('click', () => this.show(this.riff));
        }
        e.text.addEventListener('input', () => {
            clearTimeout(this.previewTimer);
            this.previewTimer = setTimeout(() => this.#preview(), 350);
        });
        e.pasteSave.addEventListener('click', async () => {
            const text = e.text.value;
            try {
                asciiTabToAlphaTex(text);
            } catch (err) {
                this.handlers.toast(err.message, true);
                return;
            }
            await this.handlers.save({ source: 'text', text });
        });
        e.song.addEventListener('change', () => this.#loadLinkSong());
        e.linkSave.addEventListener('click', async () => {
            const songId = e.song.value;
            const startBar = Number(e.barStart.value);
            const endBar = Number(e.barEnd.value);
            const total = this.linkedScore?.masterBars.length ?? 0;
            if (!songId || !this.linkedScore) {
                this.handlers.toast('Pick a song first.', true);
                return;
            }
            if (!(startBar >= 1 && endBar >= startBar && endBar <= total)) {
                this.handlers.toast(`Choose bars between 1 and ${total}, with the end after the start.`, true);
                return;
            }
            await this.handlers.save({ source: 'song', songId, trackIndex: Number(e.track.value) || 0, startBar, endBar });
        });
    }

    #setView(view) {
        const e = this.el;
        e.empty.hidden = view !== 'empty';
        e.view.hidden = view !== 'tab' && view !== 'preview';
        e.edit.hidden = !(view === 'tab' || view === 'tab-missing');
        e.remove.hidden = !(view === 'tab' || view === 'tab-missing');
        this.el.area.classList.toggle('has-tab', view === 'tab' || view === 'preview');
    }

    #closeForms() {
        this.el.pasteForm.hidden = true;
        this.el.linkForm.hidden = true;
    }

    #openPaste() {
        this.#closeForms();
        this.#setView('preview');
        this.el.pasteForm.hidden = false;
        this.el.text.value = this.riff?.tab?.source === 'text' ? this.riff.tab.text : '';
        this.el.pasteStatus.textContent = 'Paste six lines of tab (high e on top). A preview appears below as you type.';
        this.el.text.focus();
        if (this.el.text.value) this.#preview();
    }

    #preview() {
        const text = this.el.text.value;
        if (!text.trim()) return;
        try {
            const r = asciiTabToAlphaTex(text, { title: this.riff.name });
            this.el.pasteStatus.textContent =
                `Read ${r.barCount} bar${r.barCount === 1 ? '' : 's'}. ${r.warnings.join(' ')}`.trim();
            this.pending = { startBar: 1, endBar: r.barCount };
            const api = this.#ensureApi();
            api.settings.display.startBar = 1;
            api.settings.display.barCount = -1;
            api.updateSettings();
            api.tex(r.tex);
        } catch (err) {
            this.el.pasteStatus.textContent = err.message;
        }
    }

    #openLink() {
        const songs = this.handlers.songs();
        if (!songs.length) {
            this.handlers.toast('Add a Guitar Pro file under "My songs" first, then link its bars here.', true);
            return;
        }
        this.#closeForms();
        this.el.linkForm.hidden = false;
        const current = this.riff?.tab?.source === 'song' ? this.riff.tab : null;
        this.el.song.replaceChildren(...songs.map(s =>
            new Option(s.artist ? `${s.title} — ${s.artist}` : s.title, s.id, false, s.id === current?.songId)));
        this.#loadLinkSong(current);
    }

    async #loadLinkSong(current = null) {
        const song = await library.getSong(this.el.song.value);
        this.linkedScore = null;
        if (!song) return;
        try {
            this.linkedScore = alphaTab.importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(song.data), new alphaTab.Settings());
        } catch {
            this.el.linkStatus.textContent = 'Couldn\'t read that song file.';
            return;
        }
        const tracks = this.linkedScore.tracks;
        this.el.track.replaceChildren(...tracks.map((t, i) =>
            new Option(t.name || `Track ${i + 1}`, String(i), false, i === (current?.trackIndex ?? 0))));
        const total = this.linkedScore.masterBars.length;
        this.el.barStart.max = this.el.barEnd.max = String(total);
        this.el.barStart.value = String(current?.startBar ?? 1);
        this.el.barEnd.value = String(current?.endBar ?? Math.min(4, total));
        this.el.linkStatus.textContent = `This song has ${total} bars.`;
    }
}
