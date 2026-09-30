// Guitar tone for playback: switches guitar tracks to a General MIDI electric sound.
// Pure (works on an alphaTab score model) so it can be tested in Node.

// General MIDI programs (0-based): 27 clean electric, 29 overdriven, 30 distortion.
export const TONE_PROGRAMS = { distortion: 30, crunch: 29, clean: 27 };
export const TONES = { distortion: 'Distortion', crunch: 'Crunch', clean: 'Clean', original: "File's own sound" };

const isGuitarProgram = p => p >= 24 && p <= 31;

function forEachBeat(track, fn) {
    for (const staff of track.staves) {
        for (const bar of staff.bars) {
            for (const voice of bar.voices) {
                for (const beat of voice.beats) fn(beat);
            }
        }
    }
}

/**
 * Applies a tone to every guitar track (GM 24-31); bass and other instruments are untouched.
 * Instrument changes inside the music (alphaTab adds one on each track's first note)
 * are switched too, otherwise they'd put the guitar straight back to its old sound.
 * @param score           alphaTab Score
 * @param tone            key of TONES
 * @param instrumentType  alphaTab.model.AutomationType.Instrument
 */
export function applyTone(score, tone, instrumentType) {
    for (const track of score.tracks) {
        if (track.staves[0]?.isPercussion) {
            // A program change on the drum channel can swap the drum kit; drop them.
            forEachBeat(track, beat => {
                beat.automations = beat.automations.filter(a => a.type !== instrumentType);
            });
            continue;
        }
        track.originalProgram ??= track.playbackInfo.program;
        if (!isGuitarProgram(track.originalProgram)) continue;
        const program = tone === 'original' ? null : TONE_PROGRAMS[tone];
        track.playbackInfo.program = program ?? track.originalProgram;
        forEachBeat(track, beat => {
            for (const a of beat.automations) {
                if (a.type !== instrumentType) continue;
                a.originalValue ??= a.value;
                if (isGuitarProgram(a.originalValue)) a.value = program ?? a.originalValue;
            }
        });
    }
}
