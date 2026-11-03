# ActivePauseWallpaper

ActivePauseWallpaper is the MVC-style version of this web-audio wallpaper for [Lively Wallpaper](https://www.rocksdanister.com/lively/). It displays an audio visualizer, clock, date, system resource charts, and media information. An optional companion application displays the active-pause warning and break screens.

The JavaScript is separated into Lively callback adapters, views, and controller/client code. The existing timer State pattern is retained. The separation improves responsibility boundaries, but no runtime performance gain is claimed without Lively measurements.

## License

ActivePauseWallpaper is licensed under the MIT License; see [LICENSE](./LICENSE). The adapted audio visualizer implementation has its own MIT attribution in [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md). Third-party media and artwork retain their respective rights and permissions.

## How it works with Lively

- Lively loads `index.html` as the wallpaper. Its web-audio wallpaper type supplies audio, now-playing, and system-information callbacks used by the wallpaper.
- Lively's global callbacks and property interface remain the host boundary; internal pause UI and overlay communication are separated into view and client components.
- The project follows Lively's [web wallpaper audio and system-data guide](https://github.com/rocksdanister/lively/wiki/Web-Guide-V-:-System-Data) and [property interaction guide](https://github.com/rocksdanister/lively/wiki/Web-Guide-IV-:-Interaction). The thin `viz.js` adapter keeps the documented `livelyAudioListener`, `livelyCurrentTrack`, `livelySystemInformation`, and `livelyPropertyListener` entry points while delegating rendering to `wallpaper-view.js`.
- The gallery thumbnail and preview are `thumbnail.jpg` and `preview.gif`; the latter is a downsized six-second loop derived from the screen recording.
- The wallpaper stays responsible for the clock, visualizer, resource display, and pause timer. The companion overlay does not run its own timer.
- The overlay is a separate Windows application. It starts only when you press **Activate** in the wallpaper; it does not start with Lively or at Windows sign-in.
- While the overlay is running, the wallpaper sends it the current phase and remaining time over a loopback connection on `127.0.0.1:18472`. The overlay returns **Skip** or **Finish** commands to the wallpaper.

## Requirements

- Windows
- Lively Wallpaper
- The complete `ActivePauseWallpaper` folder, including `LivelyInfo.json`, the HTML/JavaScript files, images, and `ActivePauseOverlay` subfolder

The companion executable is published self-contained for Windows x64, so it does not require a separate .NET runtime installation. To rebuild it, install the .NET 8 SDK.

## Install the wallpaper

1. Copy the complete `ActivePauseWallpaper` folder into Lively's wallpaper library. The default library is:

   ```text
   %LOCALAPPDATA%\Lively Wallpaper\Library\wallpapers\ActivePauseWallpaper
   ```

   If Lively uses a custom library location, use that library's `wallpapers` folder instead.
2. Open or refresh Lively's wallpaper library and add/select **Active Pause Wallpaper**. If it does not appear automatically, use Lively's add-wallpaper/import option and select this folder's `index.html`.
3. Apply the wallpaper. Lively should treat it as a web-audio wallpaper using the type and arguments in `LivelyInfo.json`.

The clock, visualizer, and system/media display work independently of the companion overlay.

If you already added the wallpaper before changing its properties, close and reopen Lively's wallpaper properties. If **Language** is still missing, remove the wallpaper entry from Lively's library (do not delete this folder), then import this folder's `index.html` again so Lively reloads `LivelyProperties.json`.

## Install or rebuild the optional overlay

The Windows x64 overlay executable is included as `ActivePauseOverlay-win-x64.zip` because the self-contained executable exceeds GitHub's regular per-file upload limit. Extract it into `ActivePauseOverlay\publish` before registering the protocol:

```powershell
Expand-Archive ".\ActivePauseOverlay-win-x64.zip" -DestinationPath ".\ActivePauseOverlay\publish" -Force
```

To rebuild the helper from source, install the .NET 8 SDK and publish it from the `ActivePauseWallpaper` folder:

```powershell
dotnet publish ".\ActivePauseOverlay\ActivePauseOverlay.csproj" --configuration Release --output ".\ActivePauseOverlay\publish"
```

Run the following from the `ActivePauseWallpaper` folder to register the `activepauseoverlay://` protocol for the current Windows user:

```powershell
.\register-overlay-protocol.ps1
```

The registration points to this folder's published helper. It does not create a Startup shortcut or launch the helper. When you click **Activate**, the wallpaper invokes the protocol to start the helper and waits for it to respond before beginning its timer.

To remove only this wallpaper's protocol registration:

```powershell
.\unregister-overlay-protocol.ps1
```

The unregister script checks that the protocol points to this folder's helper before removing it. If the registration points somewhere else, it stops without deleting it.

## Use the controls

- In Lively's wallpaper properties, select **Language** to change the wallpaper and overlay text. English is the default; Spanish (Colombia), Simplified Chinese, French, Arabic, Brazilian Portuguese, Russian, German, Japanese, Turkish, Korean, and Italian are also available. Arabic uses right-to-left text direction.
- **Activate** starts the overlay helper on demand and starts the selected active countdown after the helper connects.
- **Restart** starts the selected active countdown again.
- **Pause** freezes the active countdown; **Resume** continues with the remaining time. These controls are only available during the active countdown.
- **Take a Break** triggers the normal warning-and-break flow immediately.
- The compact, borderless warning panel appears above other windows on each monitor. **Skip** dismisses the warning and restarts the active countdown.
- When the warning ends, the full-screen active-pause overlay appears. **Finish** closes the break and restarts the active countdown. The break also ends when its countdown reaches zero.
- **Deactivate** closes the overlay helper and stops the pause timer. The wallpaper itself remains active in Lively.

Other Lively properties configure **Line Color**, **Background Color**, **Square Wave**, **Audio Sensitivity**, **Pause Reminder**, and **Pause Schedule**. The language setting changes rendered wallpaper and overlay text; the labels and help in Lively's properties panel remain in English. **Pause Schedule** selects one of the listed active/break intervals, and the final test preset uses seconds. **Pause Reminder** controls whether the timer controls are enabled; activating the helper still requires pressing **Activate**. Button labels and statuses use the selected language.

The connection status means that the wallpaper is communicating with the helper; it does not mean that an overlay window is currently visible.

## Troubleshooting

- **The wallpaper is not listed:** Check that the entire folder is inside Lively's wallpaper library and that `LivelyInfo.json`, `index.html`, `viz.js`, `wallpaper-view.js`, `pause-view.js`, `overlay-client.js`, and `pause-reminder.js` are present. Refresh or reopen the library.
- **Language is missing from wallpaper properties:** Confirm that this folder's `LivelyProperties.json` contains the **Language** dropdown. Lively may still have the older property list cached; close and reopen the properties panel, or remove the wallpaper entry from the library and import this folder's `index.html` again. Do not delete the wallpaper folder when removing the library entry.
- **The overlay cannot start:** Extract `ActivePauseOverlay-win-x64.zip` into `ActivePauseOverlay\publish`, then run `register-overlay-protocol.ps1` again from this folder. If you rebuilt the helper, re-register the protocol so it uses the current path.
- **The helper starts but does not synchronize:** Ensure the helper is not blocked from local loopback communication. The wallpaper and helper must run on the same PC; their local endpoint uses port `18472`.
- **The overlay starts unexpectedly:** This project does not configure automatic startup. Check Windows Startup Apps and the Startup folder for a manually created entry. The protocol registration alone is not an auto-start mechanism.
- **To remove the wallpaper:** Remove it from Lively, then remove its folder if desired. To also remove the protocol registration, first run `unregister-overlay-protocol.ps1` from the wallpaper folder. Removing the wallpaper from Lively and unregistering the protocol are separate actions.

## Project layout

```text
ActivePauseWallpaper/
  index.html                         Lively wallpaper page and controls
LICENSE                            Project MIT license
THIRD-PARTY-NOTICES.md             Adapted visualizer license attribution
  viz.js                             Lively callback adapter
  wallpaper-view.js                  Audio visualizer, clock, system and media rendering
  pause-reminder.js                  Pause timer state machine and controller
  pause-view.js                      Pause timer DOM view and control bindings
  overlay-client.js                  Companion overlay protocol and loopback client
  ActivePauseOverlay-win-x64.zip     Prebuilt self-contained Windows x64 helper
  LivelyInfo.json                    Lively wallpaper metadata
  LivelyProperties.json              User-configurable visualizer and pause presets
  register-overlay-protocol.ps1      Current-user overlay protocol registration
  unregister-overlay-protocol.ps1    Safe protocol unregistration
  ActivePauseOverlay/                WPF companion overlay source and local build output
```
