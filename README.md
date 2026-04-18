# Escribbo

**A free, open source, offline speech-to-text desktop app.**

Escribbo is a cross-platform desktop application that provides simple, privacy-focused speech transcription. Press a shortcut, speak, and have your words appear in any text field — all processed locally on your computer, with nothing sent to the cloud.

> Escribbo is a fork of [cjpais/Handy](https://github.com/cjpais/Handy) with a rebranded identity, a Material You UI refresh, and ongoing changes. Much credit to the upstream authors.

## Highlights

- **Offline** – Transcription runs entirely on your machine.
- **Fast** – Whisper (CPU/GPU) or Parakeet V3 (CPU-only) models.
- **Keyboard-first** – Global shortcuts for toggle, push-to-talk, or post-processing.
- **Cross-platform** – Windows, macOS, Linux.
- **Material You UI** – Customizable seed color; light/dark theme.

## How It Works

1. **Press** a configurable keyboard shortcut to start/stop recording (or hold it for push-to-talk).
2. **Speak** your words.
3. **Release** — Escribbo runs VAD (Silero) + Whisper/Parakeet on your audio.
4. **Get** the transcript pasted into whatever app is focused.

## Quick Start

### Installation

1. Download the latest build from the [releases page](https://github.com/andermendz/escribbo/releases).
2. Install and launch Escribbo. Grant it microphone / accessibility permissions.
3. Configure your shortcut(s) in Settings.
4. Start transcribing.

> **Note:** There are currently no Homebrew, winget, Scoop, or similar package listings for Escribbo. Install from the releases page only.

### Development Setup

For detailed build instructions including platform-specific requirements, see [BUILD.md](BUILD.md).

## Architecture

Escribbo is built with Tauri:

- **Frontend** – React + TypeScript, Tailwind v4 with Material 3 tokens, a few MUI primitives.
- **Backend** – Rust for audio, ML inference, global shortcuts, and OS integration.
- **Core libraries**
  - `whisper-rs` – Whisper inference (CPU/GPU).
  - `transcribe-rs` – Parakeet inference (CPU-only).
  - `cpal` – Cross-platform audio I/O.
  - `vad-rs` – Voice Activity Detection (Silero).
  - `rdev` – Global keyboard shortcuts.
  - `rubato` – Audio resampling.

### Debug Mode

- **macOS:** `Cmd+Shift+D`
- **Windows/Linux:** `Ctrl+Shift+D`

### CLI Parameters

Escribbo supports command-line flags for controlling a running instance and customizing startup behavior.

**Remote-control flags** (sent to a running instance):

```bash
Escribbo --toggle-transcription    # Toggle recording on/off
Escribbo --toggle-post-process     # Toggle recording with post-processing on/off
Escribbo --cancel                  # Cancel the current operation
```

**Startup flags:**

```bash
Escribbo --start-hidden            # Start without showing the main window
Escribbo --no-tray                 # Start without the system tray icon
Escribbo --debug                   # Enable debug mode with verbose logging
Escribbo --help                    # Show all available flags
```

Flags can be combined, e.g. `Escribbo --start-hidden --no-tray`.

> **macOS tip:** When installed as an app bundle, invoke the binary directly:
>
> ```bash
> /Applications/Escribbo.app/Contents/MacOS/Escribbo --toggle-transcription
> ```

## Platform Notes

### Platform Support

- **macOS** (Intel and Apple Silicon)
- **Windows** (x64)
- **Linux** (x64)

### System Requirements

**For Whisper models:**

- **macOS:** Any recent Intel / Apple Silicon Mac.
- **Windows:** Intel, AMD, or NVIDIA GPU recommended for real-time speeds.
- **Linux:** Intel, AMD, or NVIDIA GPU recommended (Ubuntu 22.04 / 24.04 tested).

**For Parakeet V3:**

- CPU-only, runs on a wide range of hardware.
- Minimum: Intel Skylake (6th gen) / equivalent AMD.
- ~5× real-time on mid-range CPUs, with automatic language detection.

### Linux Notes

**Text Input Tools**

For reliable text input on Linux, install the appropriate tool for your display server:

| Display Server | Recommended Tool | Install Command                                    |
| -------------- | ---------------- | -------------------------------------------------- |
| X11            | `xdotool`        | `sudo apt install xdotool`                         |
| Wayland        | `wtype`          | `sudo apt install wtype`                           |
| Both           | `dotool`         | `sudo apt install dotool` (requires `input` group) |

- `dotool` requires adding your user to the `input` group (`sudo usermod -aG input $USER`, then log out/in).
- Without these tools, Escribbo falls back to `enigo` which may have limited Wayland compatibility.

**Runtime library dependency (`libgtk-layer-shell.so.0`)**

Escribbo links `gtk-layer-shell` on Linux. If startup fails with `error while loading shared libraries: libgtk-layer-shell.so.0`, install the runtime package for your distro:

| Distro        | Package to install    | Example command                        |
| ------------- | --------------------- | -------------------------------------- |
| Ubuntu/Debian | `libgtk-layer-shell0` | `sudo apt install libgtk-layer-shell0` |
| Fedora/RHEL   | `gtk-layer-shell`     | `sudo dnf install gtk-layer-shell`     |
| Arch Linux    | `gtk-layer-shell`     | `sudo pacman -S gtk-layer-shell`       |

For building from source on Ubuntu/Debian, you may also need `libgtk-layer-shell-dev`.

**Other notes**

- The recording overlay is disabled by default on Linux (`Overlay Position: None`) because some compositors treat it as the active window, which can steal focus and break pasting.
- If the app misbehaves, try starting it with `WEBKIT_DISABLE_DMABUF_RENDERER=1`.
- If Escribbo fails to start reliably, see [Linux Startup Crashes or Instability](#linux-startup-crashes-or-instability) below.

**Global keyboard shortcuts (Wayland)**

On Wayland, system-level shortcuts must be configured through your desktop environment or window manager. Use the CLI flags as the command bound to your shortcut.

<details>
<summary>GNOME</summary>

1. **Settings → Keyboard → Keyboard Shortcuts → Custom Shortcuts**
2. Click **+** to add a new shortcut.
3. Name it `Toggle Escribbo Transcription`, set command to `Escribbo --toggle-transcription`, then assign a key combo (e.g. `Super+O`).

</details>

<details>
<summary>KDE Plasma</summary>

1. **System Settings → Shortcuts → Custom Shortcuts**
2. **Edit → New → Global Shortcut → Command/URL**
3. Name it `Toggle Escribbo Transcription`.
4. In **Trigger**, set your key combination. In **Action**, set `Escribbo --toggle-transcription`.

</details>

<details>
<summary>Sway / i3</summary>

In `~/.config/sway/config` or `~/.config/i3/config`:

```ini
bindsym $mod+o exec Escribbo --toggle-transcription
```

</details>

<details>
<summary>Hyprland</summary>

In `~/.config/hypr/hyprland.conf`:

```ini
bind = $mainMod, O, exec, Escribbo --toggle-transcription
```

</details>

**Unix signals (alternative to CLI flags)**

Wayland window managers or hotkey daemons can keep ownership of keybindings and drive Escribbo via signals:

| Signal    | Action                                    | Example                   |
| --------- | ----------------------------------------- | ------------------------- |
| `SIGUSR2` | Toggle transcription                      | `pkill -USR2 -n Escribbo` |
| `SIGUSR1` | Toggle transcription with post-processing | `pkill -USR1 -n Escribbo` |

```ini
# Sway example
bindsym $mod+o exec pkill -USR2 -n Escribbo
bindsym $mod+p exec pkill -USR1 -n Escribbo
```

`pkill` here only delivers the signal — it does not terminate the process.

## Known Issues

Escribbo is actively developed and inherits a few known issues from upstream. See [open issues](https://github.com/andermendz/escribbo/issues).

**Whisper model crashes**

- Whisper can crash on certain Windows and Linux configurations. Issue is hardware/driver dependent — debug logs and PRs are welcome.

**Wayland**

- Limited support; requires `wtype` or `dotool` (see above).

## Troubleshooting

### Manual Model Installation (proxies / restricted networks)

If Escribbo can't download models automatically, you can install them manually.

**1. Find your app data directory**

Settings → About shows "App Data Directory". Typical paths:

- **macOS:** `~/Library/Application Support/com.pais.Escribbo/`
- **Windows:** `C:\Users\{username}\AppData\Roaming\com.pais.Escribbo\`
- **Linux:** `~/.config/com.pais.Escribbo/`

**2. Create a `models` folder inside the app data directory**

```bash
# macOS/Linux
mkdir -p ~/Library/Application\ Support/com.pais.Escribbo/models

# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path "$env:APPDATA\com.pais.Escribbo\models"
```

**3. Download model files**

The following URLs are inherited from the upstream project and are publicly accessible:

- **Whisper Small** (487 MB): `https://blob.handy.computer/ggml-small.bin`
- **Whisper Medium** (492 MB): `https://blob.handy.computer/whisper-medium-q4_1.bin`
- **Whisper Turbo** (1600 MB): `https://blob.handy.computer/ggml-large-v3-turbo.bin`
- **Whisper Large** (1100 MB): `https://blob.handy.computer/ggml-large-v3-q5_0.bin`
- **Parakeet V2** (473 MB): `https://blob.handy.computer/parakeet-v2-int8.tar.gz`
- **Parakeet V3** (478 MB): `https://blob.handy.computer/parakeet-v3-int8.tar.gz`

**4. Install**

- Drop Whisper `.bin` files directly into `models/` using their original filenames.
- For Parakeet, extract the `.tar.gz` and place the resulting directory into `models/`. The directory name must be exactly:
  - Parakeet V2 → `parakeet-tdt-0.6b-v2-int8`
  - Parakeet V3 → `parakeet-tdt-0.6b-v3-int8`

Final layout:

```
{app_data_dir}/models/
├── ggml-small.bin
├── whisper-medium-q4_1.bin
├── parakeet-tdt-0.6b-v3-int8/
│   └── (model files)
└── ...
```

**5. Verify**

Restart Escribbo and check **Settings → Models**. Your models should show as "Downloaded".

### Custom Whisper Models

Escribbo auto-discovers custom Whisper GGML models placed in the `models` directory.

1. Get a Whisper GGML `.bin` file (e.g. from [Hugging Face](https://huggingface.co/models?search=whisper%20ggml)).
2. Drop it into `models/`.
3. Restart Escribbo. The model shows up in **Settings → Models → Custom Models**.

Community models are user-provided and may not receive troubleshooting assistance.

### Linux Startup Crashes or Instability

If Escribbo fails to start on Linux — crashes shortly after launch, never shows its window, or reports Wayland protocol errors — try the following in order.

**1. Install (or reinstall) `gtk-layer-shell`**

| Distro        | Package to install    | Example command                        |
| ------------- | --------------------- | -------------------------------------- |
| Ubuntu/Debian | `libgtk-layer-shell0` | `sudo apt install libgtk-layer-shell0` |
| Fedora/RHEL   | `gtk-layer-shell`     | `sudo dnf install gtk-layer-shell`     |
| Arch Linux    | `gtk-layer-shell`     | `sudo pacman -S gtk-layer-shell`       |

**2. Disable the GTK layer shell overlay**

```bash
HANDY_NO_GTK_LAYER_SHELL=1 Escribbo
```

**3. Disable the WebKit DMA-BUF renderer**

```bash
WEBKIT_DISABLE_DMABUF_RENDERER=1 Escribbo
```

**Making a workaround permanent**

Export the variable from your shell profile, or prefix your `.desktop` entry:

```ini
Exec=env HANDY_NO_GTK_LAYER_SHELL=1 Escribbo
```

If a workaround helps, please [open an issue](https://github.com/andermendz/escribbo/issues) with your distro, desktop environment, and session type — it helps narrow down the bug.

## Releasing a New Version

Escribbo ships via GitHub Releases. Only the **Release** workflow produces an
**updateable** build: it signs every installer with the minisign key and
generates the `latest.json` manifest that the in-app updater points at
(`plugins.updater.endpoints` in [`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json)).
Uploading installers **only** from **Main Branch Build** (or attaching
unsigned files to a release yourself) will **not** produce an updateable
release — those builds lack `latest.json` and per-file `.sig` signatures.
Use the **Release** workflow against a draft release as below.

### 1. Bump the version

Update the patch/minor/major number in all three files so they stay in sync:

- `package.json` → `"version"`
- `src-tauri/Cargo.toml` → `version`
- `src-tauri/tauri.conf.json` → `"version"`

Commit as a single change, for example:

```bash
git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
git commit -m "chore(release): vX.Y.Z"
git push origin main
```

> Do **not** touch `TSC_VERSION` in `.github/workflows/build.yml`. That is the
> crates.io version of `trusted-signing-cli`, unrelated to the app version.

### 2. Create a draft release, then run **Release**

The workflow builds against an **existing** GitHub release (tag + draft). It
does not create that release for you.

```bash
gh release create "vX.Y.Z" --draft --title "vX.Y.Z" --generate-notes --target main
```

That may start **Release** automatically (`release: created`). If nothing
appears under **Actions** within a minute, start it yourself. You **must** pass
the tag — `gh workflow run "Release" --ref main` alone fails with
`workflow_dispatch requires the tag input`:

```bash
gh workflow run "Release" --ref main -f tag=vX.Y.Z
gh run watch
```

Or **Actions → Release → Run workflow** and set **tag** to `vX.Y.Z`.

### 3. Publish

The **`finalize`** job in **Release** turns the draft into a published release
when the matrix finishes (unless the run was **cancelled**). You usually do not
need a manual step.

If the release stays a draft, run:

```bash
gh release edit "vX.Y.Z" --draft=false --latest
```

The updater uses
`https://github.com/andermendz/escribbo/releases/latest/download/latest.json`;
once this version is the **latest** published release, **Check for updates**
works.

### Troubleshooting

- **In-app check does nothing.** The release is probably missing
  `latest.json` or per-installer `.sig` files. Those are only created by the
  Release workflow — re-run it, don't upload installers by hand.
- **Only some installers ship.** If a matrix job failed (e.g. macOS),
  re-run just that job; it will add the missing `.dmg` + `.sig` to the same
  draft.
- **Wrong version appears in the draft.** The workflow reads the version from
  `src-tauri/tauri.conf.json`. Bump all three version files and push before
  running it.
- **`workflow_dispatch requires the tag input`.** Create the draft release
  first, then run **Release** with `-f tag=vX.Y.Z` (or fill **tag** in the UI).
- **`gh release edit` says release not found.** The tag/release was deleted or
  never created; create the draft again with `gh release create … --draft`.

## Verifying Release Signatures

Escribbo release artifacts are signed with Tauri's updater signature format. The public key is in [`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json) under `plugins.updater.pubkey`.

To verify a release manually, set `ARTIFACT` to the filename you downloaded, save the `pubkey` value from `tauri.conf.json` to `Escribbo.pub.b64`, then decode both files from base64 and verify with `minisign`:

```bash
# Replace with the file you downloaded
ARTIFACT="Escribbo_0.9.2_amd64.AppImage"

python3 - "$ARTIFACT" <<'PY'
import base64, pathlib, sys

artifact = sys.argv[1]

pub = pathlib.Path("Escribbo.pub.b64").read_text().strip()
pathlib.Path("Escribbo.pub").write_bytes(base64.b64decode(pub))

sig = pathlib.Path(f"{artifact}.sig").read_text().strip()
pathlib.Path(f"{artifact}.minisig").write_bytes(base64.b64decode(sig))
PY

minisign -Vm "$ARTIFACT" \
  -p Escribbo.pub \
  -x "$ARTIFACT.minisig"
```

On success, `minisign` prints:

```text
Signature and comment signature verified
```

Do not use `gpg` — these are not GPG signatures.

## Contributing

1. Check existing [issues](https://github.com/andermendz/escribbo/issues).
2. Fork the repository and create a feature branch.
3. Test thoroughly on your target platform.
4. Submit a PR with a clear description of your changes.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) for coding conventions.

## License

MIT License — see [LICENSE](LICENSE).

## Acknowledgments

- **[Handy](https://github.com/cjpais/Handy)** — the upstream project Escribbo is forked from.
- **Whisper** by OpenAI for the speech recognition model.
- **whisper.cpp** and **ggml** for cross-platform Whisper inference.
- **Silero** for the VAD model.
- **Tauri** for the app framework.
- **Community contributors** across both projects.
