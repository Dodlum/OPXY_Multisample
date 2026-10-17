# Changelog

## 0.2.0 — stage 2: auto-sample

- Auto-sample mode: choose a MIDI output and channel, an audio input and channel pick (1, 2 or the
  1+2 pair), with a live input meter.
- Test note measures round-trip latency, release tail, noise floor and peak; latency and release
  can be overridden by hand.
- Range planner: start / end note, step in semitones, optional snap to the C grid, hold time and
  velocity; live zone count and estimated time; refuses more than 24 zones and offers the nearest
  step or end note that fits; warns when hold + release exceeds 20 s.
- Run records one continuous stream through an AudioWorklet and slices each note out, with
  per-note progress and abort (sends all-notes-off).
- Auto-sampled zones use the measured latency as the onset guard and the held portion of the note
  as the loop search window; a zone can be re-recorded from the detail panel.
- Preset name and note convention moved to a shared strip; processing / zones / export panels are
  now shared by both modes.

## 0.1.0 — stage 1: import and export

- Import a folder (or drag-and-drop a directory) of WAV / AIFF / FLAC samples, one note per file.
  Note is read from the filename (`c3`, `C#3`, `Db3`, `60`, with space / hyphen / underscore
  separators), then the WAV `smpl` chunk or AIFF `INST` chunk, then by pitch detection, then by asking.
- Long-recording mode: chop one file of ascending notes by silence and assign notes from a start
  note and a semitone step.
- Processing pipeline: trim leading / trailing silence, loop-point search on zero crossings favouring
  the longest clean region, peak normalise, 20 s cap, optional cut at loop end and fade out.
- 24-slot zone map, per-zone waveform, loop nudge, computer-keyboard audition with pitch shifting.
- Export a `name.preset.zip` with `patch.json` (schema cloned from a device-written preset) and
  16-bit WAVs at 44.1 / 22.05 / 11.025 kHz, mono or stereo, root note and loop in the `smpl` chunk.
- Thinning to 24 evenly spaced zones when more are loaded.
- Light / dark theme.
