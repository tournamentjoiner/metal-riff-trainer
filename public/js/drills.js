// Built-in practice drills. All are original exercises (no copyrighted songs).
// Files live in public/drills/ and are written in alphaTex.

export const CATEGORIES = [
    'Rhythm', 'Drop D', 'Picking', 'Lead', 'Legato & Expression',
    'Death Metal', 'Black Metal', 'Thrash', 'Deathcore', 'Industrial', 'Punk', 'Country',
];
export const LEVELS = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

// Optional drill fields:
//   tuning      'E standard' (default), 'Drop D' or 'Drop C'; checked against the file by the tests
//   meter       time signature(s) used, e.g. '4/4' or '4/4 + 7/8'
//   startTempo  where the speed trainer starts; the file's own tempo is the goal (targetTempo)
//   tone        a TONES key (tone.js) the drill switches to while it's open, e.g. 'clean'
export const TUNINGS = {
    'E standard': [64, 59, 55, 50, 45, 40],
    'Drop D': [64, 59, 55, 50, 45, 38],
    'Drop C': [62, 57, 53, 48, 43, 36],
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

    /* ---------- Black Metal ----------
     * Original riffs in the styles of Darkthrone, Mayhem, Dissection and Bathory:
     * tremolo-picked minor chords and melodies over blast beats. E standard.
     */
    {
        file: 'bm-waltz-of-the-north.alphatex',
        title: 'Waltz of the North',
        category: 'Black Metal', level: 1,
        style: 'Bathory-style',
        tags: ['open chords', 'odd meter', 'black metal'],
        meter: '3/4', startTempo: 90, targetTempo: 130,
        tip: 'Metronome: quarter notes, three clicks per bar. Epic mid-tempo strumming in 3/4 with open strings left ringing. Accent beat 1 of each bar and let the last chord ring out. Pass: 3 clean loops at 130.',
    },
    {
        file: 'bm-minor-chord-tremolo.alphatex',
        title: 'Minor Chord Tremolo',
        category: 'Black Metal', level: 2,
        style: 'Darkthrone-style',
        tags: ['tremolo picking', 'chords', 'black metal'],
        meter: '4/4', startTempo: 90, targetTempo: 150,
        tip: 'Metronome: 16ths. Tremolo pick a four-string minor barre shape (Em, Cm, Dm, Bm) moving between unrelated minor chords. Pick from the wrist across all four strings, and keep the shape pressed down so every note rings. Pass: 3 clean loops at 150.',
    },
    {
        file: 'bm-harmonic-minor-tremolo.alphatex',
        title: 'Harmonic Minor Tremolo',
        category: 'Black Metal', level: 2,
        style: 'Mayhem-style',
        tags: ['tremolo picking', 'melody', 'harmonic minor', 'black metal'],
        meter: '4/4', startTempo: 110, targetTempo: 170,
        tip: 'Metronome: 16ths. A tremolo-picked melody on the B string in E harmonic minor; the D# (4th fret) gives it the cold sound. Shift fingers on the click with no gap in the picking. Pass: 3 clean loops at 170.',
    },
    {
        file: 'bm-tremolo-arpeggios.alphatex',
        title: 'Tremolo Arpeggios',
        category: 'Black Metal', level: 3,
        style: 'Dissection-style',
        tags: ['tremolo picking', 'arpeggios', 'string crossing', 'black metal'],
        meter: '4/4', startTempo: 90, targetTempo: 150,
        tip: 'Metronome: 16ths. Hold each chord shape and tremolo pick its notes one string at a time, four picks per note. Crossing strings without breaking the tremolo is the skill; keep the pick angle the same on every string. Pass: 3 clean loops at 150.',
    },

    /* ---------- Thrash ----------
     * Original riffs in the styles of Slayer, Metallica, Megadeth and Exodus.
     * E standard.
     */
    {
        file: 'th-chug-and-stab.alphatex',
        title: 'Chug and Stab',
        category: 'Thrash', level: 1,
        style: 'Exodus-style',
        tags: ['palm muting', 'staccato', 'power chords', 'thrash'],
        meter: '4/4', startTempo: 110, targetTempo: 160,
        tip: 'Metronome: quarter notes. Four tight 16th chugs, then a short chord stab that you choke off right away. The rests are the point: silence both hands on every one. Pass: 3 clean loops at 160.',
    },
    {
        file: 'th-downpicked-thrash-riff.alphatex',
        title: 'Downpicked Thrash Riff',
        category: 'Thrash', level: 2,
        style: 'Metallica-style',
        tags: ['downpicking', 'palm muting', 'endurance', 'thrash'],
        meter: '4/4', startTempo: 130, targetTempo: 190,
        tip: 'Metronome: quarter notes, two picks per click. All downstrokes: a muted low E pedal with fifths on the A and D strings. Drive from the wrist and keep the stroke short so you can hold it at 190. Pass: 3 clean loops at 190.',
    },
    {
        file: 'th-chromatic-skank-riff.alphatex',
        title: 'Chromatic Skank Riff',
        category: 'Thrash', level: 2,
        style: 'Slayer-style',
        tags: ['alternate picking', 'chromatic', 'palm muting', 'thrash'],
        meter: '4/4', startTempo: 100, targetTempo: 160,
        tip: 'Metronome: 16ths. Alternate pick a muted low E with chromatic notes cutting in on the same string, over a skank beat. Let the fretted notes pop out of the palm mute slightly. Pass: 3 clean loops at 160.',
    },
    {
        file: 'th-pedal-string-crossing.alphatex',
        title: 'Pedal String Crossing',
        category: 'Thrash', level: 3,
        style: 'Megadeth-style',
        tags: ['alternate picking', 'pedal point', 'string crossing', 'thrash'],
        meter: '4/4', startTempo: 110, targetTempo: 170,
        tip: 'Metronome: 16ths. Strict alternate picking between the muted low E and a melody on the A string. Every string change happens on a different pick direction, so go slow until it stays even. Pass: 3 clean loops at 170.',
    },

    /* ---------- Deathcore ----------
     * Original breakdowns and blast sections in the styles of Suicide Silence,
     * Thy Art Is Murder and Whitechapel. Drop C (the bands often go lower still;
     * the shapes are the same).
     */
    {
        file: 'dc-downtempo-dead-stops.alphatex',
        title: 'Downtempo Dead Stops',
        category: 'Deathcore', level: 1, tuning: 'Drop C',
        style: 'Downtempo deathcore',
        tags: ['breakdowns', 'muting', 'pinch harmonics', 'deathcore'],
        meter: '4/4', startTempo: 50, targetTempo: 80,
        tip: 'Metronome: quarter notes. Slow and huge: every rest must be a dead stop, so choke the chord with both hands exactly on the beat. The last note is a pinch harmonic with wide vibrato. Pass: 3 clean loops at 80.',
    },
    {
        file: 'dc-half-time-breakdown.alphatex',
        title: 'Half-Time Breakdown',
        category: 'Deathcore', level: 2, tuning: 'Drop C',
        style: 'Suicide Silence-style',
        tags: ['breakdowns', 'syncopation', 'palm muting', 'deathcore'],
        meter: '4/4', startTempo: 80, targetTempo: 130,
        tip: 'Metronome: quarter notes; count 16ths in your head. The chugs land on "1", "a" and "and" (3+3+2), a classic breakdown rhythm. Keep the low C tightly palm muted and let the chords ring full. Pass: 3 clean loops at 130.',
    },
    {
        file: 'dc-polyrhythmic-breakdown.alphatex',
        title: 'Polyrhythmic Breakdown',
        category: 'Deathcore', level: 3, tuning: 'Drop C',
        style: 'Thy Art Is Murder-style',
        tags: ['breakdowns', 'polyrhythm', 'syncopation', 'pinch harmonics', 'deathcore'],
        meter: '4/4', startTempo: 70, targetTempo: 120,
        tip: 'Metronome: quarter notes. The chug-chug-rest groups are 3 sixteenths long, so they drift across the beat and only line up again at the bar line. Don\'t follow the drums; follow the 16th count. Pass: 3 clean loops at 120.',
    },
    {
        file: 'dc-blast-to-breakdown.alphatex',
        title: 'Blast to Breakdown',
        category: 'Deathcore', level: 2, tuning: 'Drop C',
        style: 'Whitechapel-style',
        tags: ['tremolo picking', 'breakdowns', 'transitions', 'deathcore'],
        meter: '4/4', startTempo: 90, targetTempo: 150,
        tip: 'Metronome: quarter notes. Two bars of tremolo-picked fifths over a blast beat, then the same tempo drops into a half-time breakdown. The switch is the hard part: stop tremolo picking dead on beat 1 of bar 3. Pass: 3 clean loops at 150.',
    },

    /* ---------- Industrial ----------
     * Original riffs in the styles of Rammstein, Ministry, Nine Inch Nails and
     * Fear Factory: machine-tight chugs locked to a straight drum grid. Drop D.
     */
    {
        file: 'ind-staccato-stomp.alphatex',
        title: 'Staccato Stomp',
        category: 'Industrial', level: 1, tuning: 'Drop D',
        style: 'Rammstein-style',
        tags: ['staccato', 'muting', 'power chords', 'industrial'],
        meter: '4/4', startTempo: 80, targetTempo: 110,
        tip: 'Metronome: quarter notes. Short, clipped chord hits: release the fretting-hand pressure right after each one so the rest is silent. It should sound like a machine, with no ringing between hits. Pass: 3 clean loops at 110.',
    },
    {
        file: 'ind-machine-accents.alphatex',
        title: 'Machine Accents',
        category: 'Industrial', level: 2, tuning: 'Drop D',
        style: 'Ministry-style',
        tags: ['accents', 'palm muting', 'alternate picking', 'industrial'],
        meter: '4/4', startTempo: 100, targetTempo: 150,
        tip: 'Metronome: 16ths. Constant palm-muted chugs with an open chord every third note (3+3+3+3+4). Keep the picking hand moving evenly and just open up the mute for the accents. Pass: 3 clean loops at 150.',
    },
    {
        file: 'ind-octave-synth-line.alphatex',
        title: 'Octave Synth Line',
        category: 'Industrial', level: 2, tuning: 'Drop D',
        style: 'Nine Inch Nails-style',
        tags: ['octaves', 'string skipping', 'alternate picking', 'industrial'],
        meter: '4/4', startTempo: 80, targetTempo: 120,
        tip: 'Metronome: 16ths. A sequencer-style line jumping between the low D string and its octave on the D string (same fret). Mute the A string with the underside of your index finger so the skip stays clean. Pass: 3 clean loops at 120.',
    },
    {
        file: 'ind-kick-sync-chugs.alphatex',
        title: 'Kick-Sync Chugs',
        category: 'Industrial', level: 3, tuning: 'Drop D',
        style: 'Fear Factory-style',
        tags: ['syncopation', 'palm muting', 'timing', 'industrial'],
        meter: '4/4', startTempo: 90, targetTempo: 140,
        tip: 'Metronome: quarter notes. The kick drum plays exactly with every chug, so any note that\'s early or late is obvious. Pick all downstrokes at first, then alternate once it\'s up to speed. Pass: 3 clean loops at 140.',
    },

    /* ---------- Punk ----------
     * Original riffs in the styles of the Ramones, Green Day and Blink-182,
     * Bad Religion and NOFX, and the Misfits. E standard.
     */
    {
        file: 'pk-all-downstroke-eighths.alphatex',
        title: 'All-Downstroke Eighths',
        category: 'Punk', level: 1,
        style: 'Ramones-style',
        tags: ['downpicking', 'power chords', 'endurance', 'punk'],
        meter: '4/4', startTempo: 120, targetTempo: 170,
        tip: 'Metronome: quarter notes, two strums per click. Every strum is a downstroke. Keep your wrist loose and the motion small; if your forearm burns, drop the speed and build back up. Pass: 3 clean loops at 170.',
    },
    {
        file: 'pk-mute-to-open.alphatex',
        title: 'Mute to Open',
        category: 'Punk', level: 1,
        style: 'Green Day / Blink-182-style',
        tags: ['palm muting', 'dynamics', 'power chords', 'punk'],
        meter: '4/4', startTempo: 110, targetTempo: 160,
        tip: 'Metronome: quarter notes. Bars 1-2 are palm-muted root notes (the verse), bars 3-4 are the same chords open and ringing (the chorus). Make the jump in volume obvious without speeding up. Pass: 3 clean loops at 160.',
    },
    {
        file: 'pk-skate-punk-sixteenths.alphatex',
        title: 'Skate Punk Sixteenths',
        category: 'Punk', level: 2,
        style: 'Bad Religion / NOFX-style',
        tags: ['alternate picking', 'power chords', 'speed', 'punk'],
        meter: '4/4', startTempo: 100, targetTempo: 150,
        tip: 'Metronome: 16ths, four strums per click. Alternate strum two-note power chords, hitting only the two strings. Change chords exactly on the beat without a gap in the picking. Pass: 3 clean loops at 150.',
    },
    {
        file: 'pk-chromatic-walk-ups.alphatex',
        title: 'Chromatic Walk-Ups',
        category: 'Punk', level: 2,
        style: 'Misfits-style',
        tags: ['power chords', 'chromatic', 'position shifts', 'punk'],
        meter: '4/4', startTempo: 120, targetTempo: 170,
        tip: 'Metronome: quarter notes. Each chord walks up (or down) a fret at a time into the next one. Slide the shape as one unit, keeping the same finger pressure. Pass: 3 clean loops at 170.',
    },

    /* ---------- Country ----------
     * Original exercises in the styles of Johnny Cash, Merle Travis and Chet Atkins,
     * and Brad Paisley. E standard. They switch the guitar tone to Clean while open.
     */
    {
        file: 'ct-boom-chick-bass-lines.alphatex',
        title: 'Boom-Chick Bass Lines',
        category: 'Country', level: 1, tone: 'clean',
        style: 'Johnny Cash-style',
        tags: ['alternating bass', 'open chords', 'country'],
        meter: '4/4', startTempo: 80, targetTempo: 120,
        tip: 'Metronome: quarter notes. Bass note on the beat ("boom"), then a short strum of the top strings ("chick"), through E, A and B7, with a walk down back to E. Pass: 3 clean loops at 120.',
    },
    {
        file: 'ct-travis-picking.alphatex',
        title: 'Travis Picking',
        category: 'Country', level: 2, tone: 'clean',
        style: 'Merle Travis / Chet Atkins-style',
        tags: ['hybrid picking', 'alternating bass', 'fingerstyle', 'country'],
        meter: '4/4', startTempo: 60, targetTempo: 100,
        tip: 'Metronome: quarter notes. Your thumb (or pick) plays the bass on every beat, alternating strings; your fingers pluck the higher notes in between. Get the thumb on autopilot first. Pass: 3 clean loops at 100.',
    },
    {
        file: 'ct-chicken-pickin.alphatex',
        title: "Chicken Pickin'",
        category: 'Country', level: 2, tone: 'clean',
        style: 'Brad Paisley-style',
        tags: ['hybrid picking', 'dead notes', 'double stops', 'country'],
        meter: '4/4', startTempo: 70, targetTempo: 110,
        tip: 'Metronome: 16ths. Each x is a muted pick stroke; the real note after it is snapped with your middle finger so it pops. Keep the double stops short and bright. Pass: 3 clean loops at 110.',
    },
    {
        file: 'ct-pedal-steel-bends.alphatex',
        title: 'Pedal Steel Bends',
        category: 'Country', level: 3, tone: 'clean',
        style: 'Pedal steel imitation',
        tags: ['bends', 'double stops', 'pitch accuracy', 'country'],
        meter: '4/4', startTempo: 50, targetTempo: 80,
        tip: 'Metronome: quarter notes. Bend one string a whole step while the note next to it holds still and keeps ringing. Bend with your ring finger (backed up by your middle) and keep the held note\'s finger arched so it doesn\'t get muted. Pass: 3 clean loops at 80.',
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
    'bm-waltz-of-the-north.alphatex': 'follow',
    'bm-minor-chord-tremolo.alphatex': 'blast',
    'bm-harmonic-minor-tremolo.alphatex': 'blast',
    'bm-tremolo-arpeggios.alphatex': 'blast',
    'th-chug-and-stab.alphatex': 'follow',
    'th-downpicked-thrash-riff.alphatex': 'double-kick',
    'th-chromatic-skank-riff.alphatex': 'punk',
    'th-pedal-string-crossing.alphatex': 'double-kick',
    'dc-downtempo-dead-stops.alphatex': 'follow',
    'dc-half-time-breakdown.alphatex': 'follow',
    'dc-polyrhythmic-breakdown.alphatex': 'follow',
    'dc-blast-to-breakdown.alphatex': ['blast', 'blast', 'follow', 'follow'],
    'ind-staccato-stomp.alphatex': 'industrial',
    'ind-machine-accents.alphatex': 'industrial',
    'ind-octave-synth-line.alphatex': 'industrial',
    'ind-kick-sync-chugs.alphatex': 'follow',
    'pk-all-downstroke-eighths.alphatex': 'punk',
    'pk-mute-to-open.alphatex': 'rock',
    'pk-skate-punk-sixteenths.alphatex': 'punk',
    'pk-chromatic-walk-ups.alphatex': 'punk',
    'ct-boom-chick-bass-lines.alphatex': 'twostep',
    'ct-travis-picking.alphatex': 'twostep',
    'ct-chicken-pickin.alphatex': 'twostep',
    'ct-pedal-steel-bends.alphatex': 'twostep',
};
for (const drill of DRILLS) drill.drums ??= DRUM_GROOVES[drill.file] ?? 'rock';
