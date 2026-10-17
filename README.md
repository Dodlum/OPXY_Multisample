# multisample builder for OP-XY

A browser-based tool that builds multisampler presets for the Teenage Engineering OP-XY
(firmware 1.2.0). It runs entirely client-side — nothing is uploaded anywhere.

**Live:** https://dodlum.github.io/OPXY_multisample/

Two ways in, one processing pipeline out:

- **import** — drop a folder of one-note-per-file WAV/AIFF samples (note in the filename or in
  the WAV `smpl` chunk), or one long recording of ascending notes to chop by silence.
- **auto-sample** *(stage 2)* — play a connected synth over Web MIDI, record it through your
  audio interface, and build the preset automatically, Tonverk-style.

The output is a zip containing `name.preset/patch.json` plus the WAVs, ready to drop into the
OP-XY's `presets/` folder.

## Requirements

- **Chrome or Edge** on the desktop. Web MIDI (needed for auto-sampling) is not available in
  Safari or Firefox; the import mode will mostly work there but is untested.
- For auto-sampling: a MIDI connection to the synth (USB or a MIDI interface) and the synth's
  audio coming into an input on your interface.

## Setup

There is nothing to install. Open the live link above, or clone the repo and open `index.html`
through any static server (ES modules will not load from `file://`):

```
python3 -m http.server 8000
# then open http://localhost:8000
```

### Permissions

- **Microphone / audio input** — Chrome asks the first time you start auto-sampling. Choose your
  audio interface, not the built-in mic. If you dismiss the prompt, click the camera/mic icon in
  the address bar to re-enable it.
- **MIDI** — Chrome asks separately for MIDI access (and for SysEx, which this tool does not use).
- On macOS, Chrome itself must be allowed to use the microphone in
  *System Settings → Privacy & Security → Microphone*.

## Using the preset on the device

1. Unzip the download. You get a folder called `name.preset`.
2. Put the OP-XY in disk mode (or use the field kit app) and copy the whole folder into `presets/`
   (or a subfolder of it).
3. Eject. The preset appears in the sampler's preset list.

Filenames may contain only `a-z A-Z 0-9 space # - ( )` plus the dot for the extension; the tool
sanitises names to match.

## Limits (from the device)

- Max **24 zones** per multisampler.
- Max **20 seconds** per sample.
- WAV or AIFF, mono or stereo. The device itself writes 44.1 kHz / 16-bit / stereo; that is the
  default here, with 22.05 kHz and 11.025 kHz and a mono option to save space.
- Zones fill down: every region has `lokey 0` and the device plays a note from the region with
  the lowest `hikey` that is ≥ the note.

## Note naming

The OP-XY calls MIDI 60 **c3** (so `piano-c3.wav` is middle C). Most DAWs call it C4. The
convention is switchable in the UI; the root note is also written into each WAV's `smpl` chunk,
which the device reads in preference to the name.

## Project layout

```
index.html        the app shell
css/style.css
js/app.js         UI and state
js/notes.js       note name parsing / formatting
js/audio.js       decode, resample, WAV writer (with smpl chunk)
js/process.js     trim, loop search, normalise, cap, fade
js/pitch.js       fallback pitch detection
js/chop.js        silence chopper for long recordings
js/patch.js       patch.json builder (schema from a device-written preset)
js/zip.js         store-only zip writer
js/player.js      audition playback
reference/        patch.json from the device, Tonverk auto-sampler notes
```

No build step: edit, push to `main`, GitHub Pages serves it.
