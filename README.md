# Chihuahua UEVR Shortcut Creator

A simple utility that creates desktop shortcuts for launching games through [UEVR](https://uevr.io/) (Universal Unreal Engine VR Mod) using Chihuahua.

## About

This application creates customized desktop shortcuts that launch games from various platforms (Steam, Epic Games Store, GOG, and standalone games) directly through UEVR. It simplifies the process of setting up UEVR to automatically inject in your games by creating properly configured shortcuts with all the necessary parameters.

## Prerequisites

- Windows operating system
- [Nodejs](https://nodejs.org/en/download) - You need to download and install nodejs to build the app
- [Chihuahua](https://github.com/keton/chihuahua) - Simple injector for UEVR
- Games from supported platforms (Steam, Epic Games Store, GOG, or standalone games)

## Usage

- Build the .js file
- Change paths in .bat file
- Copy .bat file to your desktop or other path you want to create shortcuts
- Drag your flat game shortcut to .bat file

### Build the necessary index.js file

- Install Nodejs
- Download zip archive or clone the repo
- Open terminal in unzipped folder

```bash
npm i
nmp run build
```

### Bat File Parameters
- `nightly`: Optional flag to use the UEVR nightly build (include any value to enable, remove to disable)

## Supported Game Platforms

- Steam: Uses Steam URL shortcuts to launch games through UEVR
- Epic Games Store: Uses EGS URL shortcuts to launch games through UEVR
- GOG: Uses GOG shortcuts to launch games through UEVR
- Standalone games: Uses regular shortcuts to launch games through UEVR

## How It Works

1. The utility analyzes the provided game shortcut to determine its type and source platform
2. It extracts the necessary information (game path, launch parameters, icon, etc.)
3. It creates a new desktop shortcut with a "[ue]" suffix that launches the game through Chihuahua and UEVR

## Dependencies

- [steam-game-path](https://www.npmjs.com/package/steam-game-path) - For resolving Steam game paths
- [create-desktop-shortcuts](https://www.npmjs.com/package/create-desktop-shortcuts) - For creating Windows shortcuts
- [get-windows-shortcut-properties](https://www.npmjs.com/package/get-windows-shortcut-properties) - For reading Windows shortcut properties

## License

[MIT](LICENSE)

## Acknowledgments

- [Praydog](https://github.com/praydog) - Creator of UEVR, the Universal Unreal Engine VR Mod
- [keton](https://github.com/keton) - Creator of Chihuahua, the UEVR injector this tool works with
