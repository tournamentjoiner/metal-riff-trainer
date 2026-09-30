# Metal Riff Trainer

A practice app for learning metal songs on guitar. It is modeled on Songsterr's synced tab player and adds tools aimed at metal practice.

## Run it

```sh
npm install
npm start          # http://localhost:5173
npm test           # unit + server tests
```

## Learn a song from YouTube

1. **Drag a YouTube link onto the app.** It can come from the address bar, a video thumbnail or any link. You can also press Ctrl+V anywhere on the page, or paste into the box in the sidebar. Links with a start time (`&t=1m23s`) open at that point.
2. The video plays inside the app through YouTube's official embedded player. **Nothing is downloaded.**
3. While it plays, press **`[`** at the start of a riff and **`]`** at the end (or use "Set to now" / type times like `1:23.5`). Name it and click **Save as drill**.
4. The riff becomes a drill under the video in the sidebar. It loops, slows down (25%–200% in any step), works with the speed trainer, and logs time and best speed toward a goal speed. You can tag it (e.g. "gallops") so it shows up in the technique filter next to the built-in drills.

### Tab for a riff

Select a riff and a **Tab** panel appears under the video. The video shrinks so both fit on screen. Give the riff its tab in one of two ways:

- **Paste or type tab**: the usual six text lines, high e on top:
  ```
  e|----------------|
  B|----------------|
  G|----------------|
  D|----------------|
  A|-------2---3----|
  E|-0-0-0---0---0--|
  ```
  A drawn preview appears as you type. The app understands two-digit frets, chords, several blocks in a row, and `h` `p` `/` `b` `~` `x`. It reads tunings from the string names (e.g. a bottom line starting `D|` means Drop D; `d A F C G D` means D standard). Text tab has no rhythm, so note spacing is estimated from how the tab is spaced.
- **Use bars from a Guitar Pro song** in "My songs": pick the song, track and bar range (e.g. bars 9–12) and those exact bars are shown.

While the video plays, a cursor in the tab moves through the riff's notes, spread evenly across the riff's start and end times. The cursor is most accurate when the riff's start and end match the first and last notes of the tab.

Some video owners block playback outside YouTube. If a video won't play, the app says so; try another upload of the song.

## What it does

- **Synced tab player** for Guitar Pro (`.gp`, `.gp3`–`.gp7`, `.gpx`) and MusicXML files. The playhead follows the music; click any note to jump there.
- **Section looping.** Drag across the tab to select a riff; it loops automatically.
- **Speed control** from 25% to 150%, with the real BPM shown.
- **Speed trainer.** Starts a riff slow and raises the speed by a set step after every N loops until it reaches your target. "Step back" drops one step when a speed is too fast.
- **Mute this track.** Silences the displayed guitar part so you can play it yourself over the rest of the band (for multi-track files).
- **Practice log.** Records time practiced, sessions, best speed/BPM, a goal-tempo progress bar per song, and a day streak.
- **Technique tags** (gallops, downpicking, tremolo picking…) with technique and level filters in the sidebar.
- **78 original technique drills** in sixteen categories, each with a difficulty level, a goal tempo and a practice tip:

  | Category | Drills |
  |---|---|
  | Rhythm | Power Chord Shifts, Palm Mute Accents, Downpicking Endurance, Gallop Drill, Reverse Gallop, Triplet Chugs, Dead Note Chugs, Syncopated Chugs, Octave Riff |
  | Drop D | Drop D One-Finger Chords, Drop D Pedal Chugs |
  | Picking | Chromatic Alternate Picking, Spider Permutations, Tremolo Picking, Pedal Point Picking, Speed Bursts, String Skipping Pedal |
  | Lead | Pentatonic Fours, Minor Scale Sextuplets, Harmonic Minor Pedal, Three-String Sweeps, Diminished Shifts |
  | Legato & Expression | Legato Trills, Vibrato Control, Bending Accuracy, Legato Three-Note Runs, Pinch Harmonic Squeals |
  | Death Metal | Chromatic Tremolo Crawl, Tritone Tremolo, Single-String Death Runs, Tremolo Endurance, Slam Groove, Triplet Burst Chugs, Stop-Start in 7/8, D-Beat Buzzsaw, Death 'n' Roll Shuffle, Buzzsaw Tremolo Melody, Death Metal Gauntlet (final test) |
  | Black Metal | Waltz of the North, Minor Chord Tremolo, Harmonic Minor Tremolo, Tremolo Arpeggios |
  | Thrash | Chug and Stab, Downpicked Thrash Riff, Chromatic Skank Riff, Pedal String Crossing |
  | Power Metal | Key Change Anthem, Gallop Anthem, Neoclassical Fours, Sextuplet Speed Runs |
  | Doom | Let It Ring, Tritone Crawl, Wide Vibrato, Doom Shuffle |
  | Deathcore | Downtempo Dead Stops, Half-Time Breakdown, Polyrhythmic Breakdown, Blast to Breakdown |
  | Metalcore | Bounce Breakdown, Harmonized Thirds, Melodic Gallops, Skip-Picked Pedal Melody |
  | Djent | Chug and Chime, Open-String Arpeggios, Displaced Riff, Groups of Five |
  | Industrial | Staccato Stomp, Machine Accents, Octave Synth Line, Kick-Sync Chugs |
  | Punk | All-Downstroke Eighths, Mute to Open, Skate Punk Sixteenths, Chromatic Walk-Ups |
  | Country | Boom-Chick Bass Lines, Travis Picking, Chicken Pickin', Pedal Steel Bends |

  The Death Metal drills are original riffs in the styles of Cannibal Corpse (tremolo, chromatic and tritone lines), Dying Fetus (slams, syncopation, triplet bursts, odd meters) and Entombed (d-beat buzzsaw, death 'n' roll, tremolo melodies). They're aimed at intermediate players and all use Drop D. Each lists its time signature and a start → goal tempo (e.g. `4/4 · ♩ 100→170`). The speed trainer is pre-set to climb from the start tempo to the goal. The pass mark is 3 clean loops in a row at the goal tempo with the click on.

  The genre drills work the same way, each with a start → goal tempo and the same pass mark. **Black Metal** (E standard) covers tremolo-picked minor chords, harmonic-minor tremolo melodies and tremolo arpeggios over blast beats, plus a Bathory-style 3/4 waltz, in the styles of Darkthrone, Mayhem, Dissection and Bathory. **Thrash** (E standard) covers chug-and-stab rhythms, all-downstroke riffs, chromatic skank-beat riffs and pedal-point string crossing like Exodus, Metallica, Slayer and Megadeth. **Power Metal** (E standard) covers a key-change chorus, chord gallops, neoclassical harmonic-minor sequences and sextuplet speed runs over double kick, like Helloween, Iron Maiden, Stratovarius and DragonForce. **Doom** (C standard, with the same shapes as E standard) is slow and precise: holding chords for their exact length, a Sabbath-style tritone riff, wide vibrato and a swung doom shuffle, in the styles of Electric Wizard, Black Sabbath, Candlemass and Saint Vitus. **Deathcore** (Drop C) covers breakdowns, dead stops, 3-against-4 polyrhythms and blast-to-breakdown transitions, in the styles of Suicide Silence, Thy Art Is Murder and Whitechapel. **Metalcore** (Drop C) covers bouncy breakdowns, twin-guitar harmonies in thirds, melodic gallops and skip-picked pedal melodies like Killswitch Engage, Parkway Drive, As I Lay Dying and August Burns Red. **Djent** (Drop C) is all about rhythm: syncopated chugs against ringing chords, a riff displaced by a 16th every bar, and groups of five over 4/4 in the styles of Meshuggah, Periphery and TesseracT, plus clean open-string arpeggios. **Industrial** (Drop D) is machine-tight staccato, accents and octave "synth" lines like Rammstein, Ministry, Nine Inch Nails and Fear Factory. **Punk** (E standard) covers downstroke endurance, palm-mute-to-open dynamics, skate-punk 16ths and chromatic walk-ups. **Country** (E standard; switches to the Clean tone while open) covers boom-chick bass lines, Travis picking, chicken pickin' and pedal-steel double-stop bends.

  To add your own drill, write a `.alphatex` file in `public/drills/` and add an entry to `public/js/drills.js`. `npm test` checks that it parses and that every bar is a full 4/4 bar.
- **Drums and guitar tone.** Every drill plays with a generated drum track that fits its style: blast beats and double kick for tremolo drills, d-beat, a half-time groove whose kick follows the riff for slams and chugs, a shuffle, a punk/thrash skank beat, a straight industrial beat, a country two-step, or a rock beat. It follows each bar's time signature. **Drums** (or the D key) turns them on and off. **Tone** sets the guitar sound to Distortion, Crunch, Clean, or the file's own sound; it also applies to guitar tracks in your Guitar Pro files, while bass and drums are left alone. Sounds come from the built-in General MIDI sound library, so they're synthesized rather than a real amp.
- Metronome click, count-in, tab-only or tab + standard notation view.

### Keyboard shortcuts

| Key | Action |
|---|---|
| Space | Play / pause |
| S | Stop |
| L | Toggle loop |
| M | Toggle metronome |
| D | Toggle drums |
| + / − | Speed ±5% |
| Esc | Clear loop section (videos: back to the whole video) |
| [ / ] | Videos: set riff start / end at the current time |

## Share it online

To share by text or Facebook, the app needs a public web address; a `localhost` link only works on your computer.

1. **Build** a folder of plain files:
   ```sh
   npm run build -- --site-url https://YOUR-ADDRESS/
   ```
   `--site-url` is the address the app will live at. It's used for the link preview (title, description and picture) that Facebook and messaging apps show. If you don't know the address yet, build without it, put the site online, then rebuild with the address and upload again.
2. **Check it** with `npm run preview`, which serves `dist/` at http://localhost:5174 exactly as a host would.
3. **Put `dist/` online** on any free static host, for example:
   - **Netlify Drop**: sign in at app.netlify.com/drop (free) and drag the `dist` folder onto the page. You get an address like `https://your-name.netlify.app`.
   - **GitHub Pages**: publish `dist/` from a GitHub repository. You get `https://your-username.github.io/metal-riff-trainer/`.

Then use the **Share** button in the app:
- On a phone it opens the normal share sheet (Messages, Facebook and so on).
- On a computer it offers **Text message**, **Facebook** and **Copy link**.
- If a drill is open, the link opens that drill (e.g. `?drill=dm-death-metal-gauntlet`). Otherwise it shares the app.

Each person's songs, YouTube riffs and progress stay in their own browser. Sharing gives them the app and the built-in drills, never your personal library.

## Songs and copyright

The app ships with **no copyrighted songs**; the drills are original exercises. Load Guitar Pro files you own, for example files bought from the Guitar Pro store or tabs you transcribed yourself. Everything stays in your browser (IndexedDB); nothing is uploaded anywhere.

## Project layout

```
server.js              zero-dependency static server (serves public/ + alphaTab from node_modules)
public/index.html      page shell
public/css/styles.css
public/js/app.js       UI wiring and alphaTab player
public/js/practice.js  pure logic: speed trainer, loop counting, practice stats (unit-tested)
public/js/library.js   IndexedDB storage for songs, YouTube videos/riffs and practice sessions
public/js/video.js     YouTube IFrame player wrapper (speed, section looping)
public/js/youtube.js   pure helpers: link parsing, time formatting, riff validation (unit-tested)
public/js/asciitab.js  text tab -> alphaTex converter (unit-tested)
public/js/drums.js     generated drum tracks for drills (unit-tested)
public/js/tone.js      guitar tone switching (unit-tested)
public/js/rifftab.js   tab panel under the video: paste/link tab, cursor that follows the video
public/js/drills.js    built-in drill manifest
public/drills/*.alphatex
test/                  node:test suites
```

Tab rendering and audio come from [alphaTab](https://alphatab.net) (MPL-2.0).
Open the app with `?debug` to get `window.mrt.api` (the alphaTab API) in the dev console.

## Roadmap

- Phase 3: listen to your playing (single-note pitch detection through an audio interface) and score accuracy per section.
- Spaced-repetition queue: resurface riffs you haven't hit goal tempo on.
- Per-section best tempos (not just per song).
