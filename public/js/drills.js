// Built-in practice drills. All are original exercises (no copyrighted songs).
// Files live in public/drills/ and are written in alphaTex.

export const CATEGORIES = ['Rhythm', 'Drop D', 'Picking', 'Lead', 'Legato & Expression', 'Death Metal'];
export const LEVELS = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

// Optional drill fields:
//   tuning      'E standard' (default) or 'Drop D'; checked against the file by the tests
//   meter       time signature(s) used, e.g. '4/4' or '4/4 + 7/8'
//   startTempo  where the speed trainer starts; the file's own tempo is the goal (targetTempo)
export const TUNINGS = {
    'E standard': [64, 59, 55, 50, 45, 40],
    'Drop D': [64, 59, 55, 50, 45, 38],
};

export const DRILLS = [
    /* ---------- Rhythm ---------- */
    {
        file: 'power-chord-shifts.alphatex',
        title: 'Power Chord Shifts',
        category: 'Rhythm', level: 1,
        tags: ['power chords', 'fretting-hand shifts'],
        targetTempo: 160,
        tip: 'Lift off slightly between chords so they don\'t ring into each other, and land each shape fully at once.',
    },
    {
        file: 'palm-mute-accents.alphatex',
        title: 'Palm Mute Accents',
        category: 'Rhythm', level: 1,
        tags: ['palm muting', 'downpicking', 'power chords'],
        targetTempo: 180,
        tip: 'Rest the edge of your picking hand on the bridge for the chugs, then lift it just enough for the open chords to ring.',
    },
    {
        file: 'downpicking-endurance.alphatex',
        title: 'Downpicking Endurance',
        category: 'Rhythm', level: 1,
        tags: ['downpicking', 'palm muting', 'power chords'],
        targetTempo: 200,
        tip: 'All downstrokes. Keep the motion small and from the wrist; if your forearm tightens up, drop the speed.',
    },
    {
        file: 'gallop-drill.alphatex',
        title: 'Gallop Drill',
        category: 'Rhythm', level: 2,
        tags: ['gallops', 'palm muting', 'downpicking'],
        targetTempo: 180,
        tip: 'Pick down-up-down on each gallop (or all downs at slower tempos). The two 16ths should be even, not rushed.',
    },
    {
        file: 'reverse-gallop.alphatex',
        title: 'Reverse Gallop',
        category: 'Rhythm', level: 2,
        tags: ['gallops', 'palm muting'],
        targetTempo: 180,
        tip: 'Two fast notes first, then the longer one. Count "1-e-and" out loud until the rhythm locks in.',
    },
    {
        file: 'triplet-chugs.alphatex',
        title: 'Triplet Chugs',
        category: 'Rhythm', level: 2,
        tags: ['triplets', 'palm muting', 'timing'],
        targetTempo: 160,
        tip: 'Turn the click on. Three even notes per beat, and the accent moves between down and up strokes, so keep it steady.',
    },
    {
        file: 'dead-note-chugs.alphatex',
        title: 'Dead Note Chugs',
        category: 'Rhythm', level: 2,
        tags: ['dead notes', 'palm muting', 'muting'],
        targetTempo: 160,
        tip: 'The x notes are percussive: loosen your fretting hand on the string so it clicks without a pitch.',
    },
    {
        file: 'syncopated-chugs.alphatex',
        title: 'Syncopated Chugs',
        category: 'Rhythm', level: 3,
        tags: ['syncopation', 'palm muting', 'timing', 'muting'],
        targetTempo: 140,
        tip: 'Keep your picking hand moving in constant 16ths and just miss the string on the rests. The silences matter as much as the notes.',
    },
    {
        file: 'octave-riff.alphatex',
        title: 'Octave Riff',
        category: 'Rhythm', level: 2,
        tags: ['octaves', 'muting'],
        targetTempo: 160,
        tip: 'Let your index finger lightly touch the string between the two notes to mute it, then strum freely.',
    },

    /* ---------- Drop D ---------- */
    {
        file: 'drop-d-one-finger-chords.alphatex',
        title: 'Drop D One-Finger Chords',
        category: 'Drop D', level: 1, tuning: 'Drop D',
        tags: ['drop d', 'power chords', 'palm muting'],
        targetTempo: 180,
        tip: 'Tune your low E down to D first. Barre the bottom three strings with one finger and slide it cleanly between frets.',
    },
    {
        file: 'drop-d-pedal-chugs.alphatex',
        title: 'Drop D Pedal Chugs',
        category: 'Drop D', level: 2, tuning: 'Drop D',
        tags: ['drop d', 'palm muting', 'alternate picking'],
        targetTempo: 170,
        tip: 'Alternate pick the whole thing. Keep the open D muted and let the fretted notes pop out slightly.',
    },

    /* ---------- Picking ---------- */
    {
        file: 'chromatic-alternate-picking.alphatex',
        title: 'Chromatic Alternate Picking',
        category: 'Picking', level: 1,
        tags: ['alternate picking', 'sync'],
        targetTempo: 160,
        tip: 'Strict down-up picking. One finger per fret; keep fingers close to the fretboard.',
    },
    {
        file: 'spider-permutations.alphatex',
        title: 'Spider Permutations',
        category: 'Picking', level: 1,
        tags: ['alternate picking', 'finger independence', 'sync'],
        targetTempo: 140,
        tip: 'The 1-3-2-4 finger order trains independence. Go slow enough that every note is clean.',
    },
    {
        file: 'tremolo-picking.alphatex',
        title: 'Tremolo Picking',
        category: 'Picking', level: 1,
        tags: ['tremolo picking', 'alternate picking'],
        targetTempo: 180,
        tip: 'Relax your grip and pick from the wrist. Even volume on up and down strokes is the goal.',
    },
    {
        file: 'pedal-point-picking.alphatex',
        title: 'Pedal Point Picking',
        category: 'Picking', level: 2,
        tags: ['pedal point', 'alternate picking', 'string crossing'],
        targetTempo: 170,
        tip: 'The open E is the pedal; the melody moves on the A string. Keep the open string slightly muted.',
    },
    {
        file: 'speed-bursts.alphatex',
        title: 'Speed Bursts',
        category: 'Picking', level: 2,
        tags: ['alternate picking', 'speed', 'string crossing'],
        targetTempo: 180,
        tip: 'Play each burst as fast as the tempo allows, then relax completely on the long note before the next one.',
    },
    {
        file: 'string-skipping-pedal.alphatex',
        title: 'String Skipping Pedal',
        category: 'Picking', level: 3,
        tags: ['string skipping', 'pedal point', 'alternate picking'],
        targetTempo: 160,
        tip: 'Skip over the A string. Aim the pick with a small arc and mute the skipped string with your picking hand.',
    },

    /* ---------- Lead ---------- */
    {
        file: 'pentatonic-fours.alphatex',
        title: 'Pentatonic Fours',
        category: 'Lead', level: 1,
        tags: ['pentatonic', 'scale sequences', 'alternate picking'],
        targetTempo: 150,
        tip: 'E minor pentatonic at the 12th fret, in groups of four. Say the group starts in your head to keep your place.',
    },
    {
        file: 'minor-scale-sextuplets.alphatex',
        title: 'Minor Scale Sextuplets',
        category: 'Lead', level: 2,
        tags: ['scales', 'three notes per string', 'alternate picking'],
        targetTempo: 120,
        tip: 'E natural minor, three notes per string. Six notes per click; accent the first of each group.',
    },
    {
        file: 'harmonic-minor-pedal.alphatex',
        title: 'Harmonic Minor Pedal',
        category: 'Lead', level: 3,
        tags: ['harmonic minor', 'neoclassical', 'pedal point'],
        targetTempo: 160,
        tip: 'A harmonic minor over a repeated pedal note. The G# gives the neoclassical sound; make it ring clearly.',
    },
    {
        file: 'sweep-arpeggios.alphatex',
        title: 'Three-String Sweeps',
        category: 'Lead', level: 3,
        tags: ['sweep picking', 'arpeggios', 'legato'],
        targetTempo: 120,
        tip: 'One smooth pick stroke across the strings, like a slow strum. Roll your fingertips so only one note sounds at a time.',
    },
    {
        file: 'diminished-shifts.alphatex',
        title: 'Diminished Shifts',
        category: 'Lead', level: 3,
        tags: ['arpeggios', 'diminished', 'position shifts'],
        targetTempo: 140,
        tip: 'The same diminished shape moves up three frets at a time. Shift on the last note of each group.',
    },

    /* ---------- Legato & Expression ---------- */
    {
        file: 'legato-trills.alphatex',
        title: 'Legato Trills',
        category: 'Legato & Expression', level: 1,
        tags: ['legato', 'hammer-ons', 'pull-offs'],
        targetTempo: 140,
        tip: 'Pick only the very first note. Hammer on from above and pull slightly sideways so both notes stay loud.',
    },
    {
        file: 'vibrato-control.alphatex',
        title: 'Vibrato Control',
        category: 'Legato & Expression', level: 1,
        tags: ['vibrato', 'bends'],
        targetTempo: 90,
        tip: 'Pivot from the wrist, not the finger. Aim for an even, controlled width that matches the tempo.',
    },
    {
        file: 'bending-accuracy.alphatex',
        title: 'Bending Accuracy',
        category: 'Legato & Expression', level: 2,
        tags: ['bends', 'pitch accuracy'],
        targetTempo: 90,
        tip: 'Play the target note first, then bend up to match it exactly. Use two or three fingers to push the string.',
    },
    {
        file: 'legato-three-note-runs.alphatex',
        title: 'Legato Three-Note Runs',
        category: 'Legato & Expression', level: 2,
        tags: ['legato', 'hammer-ons', 'pull-offs', 'three notes per string'],
        targetTempo: 150,
        tip: 'Pick once per string and hammer/pull the other two notes. All three should match in volume.',
    },
    {
        file: 'pinch-harmonic-squeals.alphatex',
        title: 'Pinch Harmonic Squeals',
        category: 'Legato & Expression', level: 2,
        tags: ['pinch harmonics', 'palm muting', 'bends'],
        targetTempo: 140,
        tip: 'Choke up on the pick so your thumb grazes the string right after the pick hits it. Use gain and move your picking spot until it squeals.',
    },

    /* ---------- Death Metal ----------
     * Original riffs in the styles of classic death metal: Cannibal Corpse-style
     * tremolo and dissonance, Dying Fetus-style slams and stop-start grooves,
     * Entombed-style d-beat "buzzsaw" riffs. All in Drop D (the bands tune lower;
     * tune the whole guitar down and the same shapes work).
     * Pass mark for each: 3 clean loops in a row at the goal tempo, click on.
     */
    {
        file: 'dm-chromatic-tremolo-crawl.alphatex',
        title: 'Chromatic Tremolo Crawl',
        category: 'Death Metal', level: 2, tuning: 'Drop D',
        style: 'Cannibal Corpse-style',
        tags: ['tremolo picking', 'chromatic', 'alternate picking', 'death metal'],
        meter: '4/4', startTempo: 100, targetTempo: 170,
        tip: 'Metronome: 16th notes, four picks per click. Chromatic tremolo on the low D with a tritone jump in bar 2. Keep the pick grip loose and the motion tiny. Pass: 3 clean loops at 170.',
    },
    {
        file: 'dm-tritone-tremolo.alphatex',
        title: 'Tritone Tremolo',
        category: 'Death Metal', level: 2, tuning: 'Drop D',
        style: 'Cannibal Corpse-style',
        tags: ['tremolo picking', 'dissonance', 'death metal'],
        meter: '4/4', startTempo: 90, targetTempo: 150,
        tip: 'Metronome: 16ths. Tremolo two-note tritone shapes (index on the low string, the note one fret back on the A string). Both strings must sound on every pick. Pass: 3 clean loops at 150.',
    },
    {
        file: 'dm-single-string-runs.alphatex',
        title: 'Single-String Death Runs',
        category: 'Death Metal', level: 2, tuning: 'Drop D',
        style: 'Cannibal Corpse-style',
        tags: ['alternate picking', 'chromatic', 'position shifts', 'pedal point', 'death metal'],
        meter: '4/4', startTempo: 90, targetTempo: 160,
        tip: 'Metronome: 16ths. Fast chromatic runs and open-string pedal shifts. Shift your whole hand, not just a finger, and land each shift on the click. Pass: 3 clean loops at 160.',
    },
    {
        file: 'dm-tremolo-endurance.alphatex',
        title: 'Tremolo Endurance',
        category: 'Death Metal', level: 2, tuning: 'Drop D',
        style: 'Cannibal Corpse-style',
        tags: ['tremolo picking', 'endurance', 'string crossing', 'death metal'],
        meter: '4/4', startTempo: 110, targetTempo: 180,
        tip: 'Metronome: 16ths. Eight bars of non-stop tremolo that moves to the A string halfway. This is a stamina test: stay relaxed, and stop if your forearm burns. Pass: 3 clean loops at 180.',
    },
    {
        file: 'dm-slam-groove.alphatex',
        title: 'Slam Groove',
        category: 'Death Metal', level: 2, tuning: 'Drop D',
        style: 'Dying Fetus-style',
        tags: ['slam', 'syncopation', 'palm muting', 'pinch harmonics', 'death metal'],
        meter: '4/4', startTempo: 70, targetTempo: 110,
        tip: 'Metronome: quarter notes; count 16ths ("1-e-and-a") in your head. Slow, heavy syncopated chugs with pinch-harmonic squeals. The rests must be dead silent: mute with both hands. Pass: 3 clean loops at 110.',
    },
    {
        file: 'dm-triplet-burst-chugs.alphatex',
        title: 'Triplet Burst Chugs',
        category: 'Death Metal', level: 2, tuning: 'Drop D',
        style: 'Dying Fetus-style',
        tags: ['triplets', 'speed bursts', 'palm muting', 'death metal'],
        meter: '4/4', startTempo: 70, targetTempo: 110,
        tip: 'Metronome: quarter notes. Each burst is six even chugs per click (16th-note triplets), then a chord hit. Say "tri-pl-et-tri-pl-et" to lock it in. Pass: 3 clean loops at 110.',
    },
    {
        file: 'dm-stop-start-odd-meter.alphatex',
        title: 'Stop-Start in 7/8',
        category: 'Death Metal', level: 2, tuning: 'Drop D',
        style: 'Dying Fetus-style',
        tags: ['odd meter', 'syncopation', 'palm muting', 'death metal'],
        meter: '4/4 + 7/8', startTempo: 90, targetTempo: 140,
        tip: 'Metronome: turn the click on. It follows the meter change, so the 7/8 bars (7 eighth notes) come around half a beat early. Count "1-2-3-4-5-6-7". Pass: 3 clean loops at 140 without losing the bar line.',
    },
    {
        file: 'dm-d-beat-buzzsaw.alphatex',
        title: 'D-Beat Buzzsaw',
        category: 'Death Metal', level: 2, tuning: 'Drop D',
        style: 'Entombed-style',
        tags: ['d-beat', 'power chords', 'alternate picking', 'death metal'],
        meter: '4/4', startTempo: 120, targetTempo: 190,
        tip: 'Metronome: quarter notes, two strums per click. Driving one-finger power chords over a d-beat. Use a thick, fuzzy tone and alternate pick once it gets fast. Pass: 3 clean loops at 190.',
    },
    {
        file: 'dm-death-n-roll-shuffle.alphatex',
        title: "Death 'n' Roll Shuffle",
        category: 'Death Metal', level: 2, tuning: 'Drop D',
        style: 'Entombed-style',
        tags: ['shuffle', 'groove', 'power chords', 'death metal'],
        meter: '4/4', startTempo: 100, targetTempo: 150,
        tip: 'Metronome: quarter notes. A swung "long-short" feel: chord on the click, muted chug just before the next one. Keep it bouncy, not straight. Pass: 3 clean loops at 150.',
    },
    {
        file: 'dm-buzzsaw-tremolo-melody.alphatex',
        title: 'Buzzsaw Tremolo Melody',
        category: 'Death Metal', level: 2, tuning: 'Drop D',
        style: 'Entombed-style',
        tags: ['tremolo picking', 'melody', 'death metal'],
        meter: '4/4', startTempo: 100, targetTempo: 170,
        tip: 'Metronome: 16ths. A tremolo-picked minor melody on the D string. Change notes exactly on the click without a gap in the picking. Pass: 3 clean loops at 170.',
    },
    {
        file: 'dm-death-metal-gauntlet.alphatex',
        title: 'Death Metal Gauntlet',
        category: 'Death Metal', level: 2, tuning: 'Drop D',
        style: 'Final test: all three styles',
        tags: ['exam', 'tremolo picking', 'slam', 'd-beat', 'odd meter', 'death metal'],
        meter: '4/4 + 7/8', startTempo: 100, targetTempo: 160,
        tip: 'The final test. 12 bars: tremolo and tritones, d-beat, a 7/8 bar, triplet bursts, then a half-time slam (the tempo drops from 160 to 100 at bar 7) and back up for the ending. Click on. Pass: one clean run at 100% speed.',
    },
];

// Drum groove generated for each drill (see drums.js); anything not listed gets a rock beat.
// The Gauntlet changes groove with its sections, one entry per bar.
const DRUM_GROOVES = {
    'gallop-drill.alphatex': 'follow',
    'reverse-gallop.alphatex': 'follow',
    'syncopated-chugs.alphatex': 'follow',
    'dead-note-chugs.alphatex': 'follow',
    'downpicking-endurance.alphatex': 'double-kick',
    'drop-d-pedal-chugs.alphatex': 'double-kick',
    'tremolo-picking.alphatex': 'double-kick',
    'dm-chromatic-tremolo-crawl.alphatex': 'blast',
    'dm-tritone-tremolo.alphatex': 'blast',
    'dm-single-string-runs.alphatex': 'double-kick',
    'dm-tremolo-endurance.alphatex': 'blast',
    'dm-slam-groove.alphatex': 'follow',
    'dm-triplet-burst-chugs.alphatex': 'double-kick',
    'dm-stop-start-odd-meter.alphatex': 'follow',
    'dm-d-beat-buzzsaw.alphatex': 'dbeat',
    'dm-death-n-roll-shuffle.alphatex': 'shuffle',
    'dm-buzzsaw-tremolo-melody.alphatex': 'dbeat',
    'dm-death-metal-gauntlet.alphatex': [
        'blast', 'blast', 'dbeat', 'dbeat', 'follow', 'double-kick',
        'follow', 'follow', 'follow', 'follow', 'blast', 'blast',
    ],
};
for (const drill of DRILLS) drill.drums ??= DRUM_GROOVES[drill.file] ?? 'rock';
