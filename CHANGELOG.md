# Changelog

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
