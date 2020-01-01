# Dev setup

- Install Particle CLI
  - Linux/Mac: `npm install -g particle-cli`
  - Windows: [download the installer](https://binaries.particle.io/cli/installer/windows/ParticleCLISetup.exe) since it doesn't readily build on Windows
- `particle login` (note: requires two-factor auth)

# Building

- `npm run build`

# Testing

- To a flash a USB-connected device, run `npm run firmware:flash`
- For a USB-connected device, run `npm run firmware:monitor` to monitor it via serial-over-USB. Use `particle serial list` to disambiguate ports and devices if need be.

# Documentation

- [Particle CLI](https://docs.particle.io/tutorials/developer-tools/cli/)

# Useful links

- [Guidelines for 1-Wire buses](https://www.maximintegrated.com/en/app-notes/index.mvp/id/148)
