# Background music

Drop a music file here named **`background.mp3`** (or change `MUSIC_SRC` in
`src/components/music.jsx` to point to a different path / format).

Supported formats: `.mp3`, `.ogg`, `.wav` — anything an `<audio>` element plays.

The track is looped automatically and starts at low volume. Browsers block
audio until the user interacts with the page, so playback begins on the first
click or keypress (or via the floating note button at the bottom-left of the
screen). Volume and on/off toggle live in the **Tweaks** panel under "Music".
