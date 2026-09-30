// Wrapper around YouTube's official IFrame Player API: playback, speed and
// section looping. Nothing is downloaded; the video streams from YouTube.

const API_URL = 'https://www.youtube.com/iframe_api';
const POLL_MS = 40;

let apiPromise = null;

function loadApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
        const previous = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            previous?.();
            resolve(window.YT);
        };
        const script = document.createElement('script');
        script.src = API_URL;
        script.onerror = () => {
            apiPromise = null;
            reject(new Error('Couldn\'t reach YouTube. Check your internet connection.'));
        };
        document.head.append(script);
    });
    return apiPromise;
}

export class YouTubePlayer {
    /**
     * @param container element the player iframe replaces a child of
     * @param handlers { onStateChange(playing), onLoop(), onTime(seconds), onError(code), onReady() }
     */
    constructor(container, handlers) {
        this.container = container;
        this.handlers = handlers;
        this.player = null;
        this.videoId = null;
        this.range = null;      // { start, end } in seconds
        this.looping = false;
        this.playing = false;
        this.speed = 1;
        this.pollTimer = null;
    }

    async load(videoId, startSeconds = 0) {
        const YT = await loadApi();
        this.videoId = videoId;
        this.range = null;
        this.ready = false;
        this.pendingSeek = null;
        if (this.player) {
            this.player.cueVideoById({ videoId, startSeconds });
            this.ready = true;
            this.handlers.onReady?.();
            return;
        }
        const mount = document.createElement('div');
        this.container.replaceChildren(mount);
        await new Promise(resolve => {
            this.player = new YT.Player(mount, {
                videoId,
                width: '100%',
                height: '100%',
                playerVars: {
                    playsinline: 1,
                    rel: 0,
                    start: Math.floor(startSeconds),
                    origin: location.origin,
                },
                events: {
                    onReady: () => {
                        this.ready = true;
                        this.player.setPlaybackRate(this.speed);
                        this.handlers.onReady?.();
                        resolve();
                    },
                    onStateChange: e => this.#onState(e.data),
                    onError: e => {
                        this.handlers.onError?.(e.data);
                        resolve();
                    },
                },
            });
        });
    }

    /** Title/channel as reported by the player once a video is cued. */
    get info() {
        const data = this.player?.getVideoData?.() ?? {};
        return { title: data.title || '', author: data.author || '' };
    }

    get duration() {
        return this.player?.getDuration?.() || 0;
    }

    get currentTime() {
        if (this.pendingSeek != null) return this.pendingSeek;
        return this.player?.getCurrentTime?.() || 0;
    }

    // YouTube starts playback when you seek a video that hasn't been played yet
    // (unstarted or cued), so jumps are held until the user presses Play.
    #notStarted() {
        const s = this.player?.getPlayerState?.();
        return s === -1 || s === 5;
    }

    playPause() {
        if (!this.ready) return;
        if (this.playing) {
            this.player.pauseVideo();
            return;
        }
        // Starting outside the section jumps to its start.
        let t = this.currentTime;
        if (this.range && (t < this.range.start - 0.05 || t >= this.range.end)) t = this.range.start;
        this.pendingSeek = null;
        this.player.seekTo(t, true);
        this.player.playVideo();
    }

    stop() {
        if (!this.ready) return;
        this.player.pauseVideo();
        this.seek(this.range?.start ?? 0);
    }

    seek(seconds) {
        if (this.#notStarted()) {
            this.pendingSeek = seconds;
        } else {
            this.pendingSeek = null;
            this.player?.seekTo(seconds, true);
        }
        this.handlers.onTime?.(seconds);
    }

    /** Speed as a fraction (0.25-2). The embed accepts arbitrary rates in that range. */
    setSpeed(rate) {
        this.speed = Math.min(2, Math.max(0.25, rate));
        if (this.ready) this.player.setPlaybackRate(this.speed);
        return this.speed;
    }

    /** Section to play/loop, or null for the whole video. */
    setRange(range) {
        this.range = range ? { start: range.start, end: range.end } : null;
    }

    setLooping(on) {
        this.looping = on;
    }

    destroy() {
        clearInterval(this.pollTimer);
        this.player?.destroy?.();
        this.player = null;
        this.ready = false;
    }

    #onState(code) {
        const YT = window.YT;
        const playing = code === YT.PlayerState.PLAYING;
        if (code === YT.PlayerState.ENDED && this.looping && !this.range) {
            // Whole-video loop.
            this.player.seekTo(0, true);
            this.player.playVideo();
            this.handlers.onLoop?.();
            return;
        }
        if (playing === this.playing) return;
        this.playing = playing;
        clearInterval(this.pollTimer);
        if (playing) this.pollTimer = setInterval(() => this.#poll(), POLL_MS);
        this.handlers.onStateChange?.(playing);
    }

    #poll() {
        const t = this.currentTime;
        const r = this.range;
        if (r && t >= r.end) {
            if (this.looping) {
                this.player.seekTo(r.start, true);
                this.handlers.onTime?.(r.start);
                this.handlers.onLoop?.();
                return;
            }
            // Play the section once, then park at its start.
            this.player.pauseVideo();
            this.player.seekTo(r.start, true);
        }
        this.handlers.onTime?.(t);
    }
}
