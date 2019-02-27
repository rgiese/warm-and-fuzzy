# Dev setup
- Install Particle CLI
    - Linux/Mac: `npm install -g particle-cli`
    - Windows: [download the installer](https://binaries.particle.io/cli/installer/windows/ParticleCLISetup.exe) since it doesn't readily build on Windows
- `particle login` (note: requires two-factor auth)

# Building
- In each firmware directory, run
    - `particle compile photon --saveTo out/thermostat.bin`

# Testing
- To a flash a USB-connected device, run `particle flash --usb out\thermostat.bin`
- For a USB-connected device, run `particle serial monitor` to monitor it via serial-over-USB. Use `particle serial list` to disambiguate ports and devices if need be.

# Documentation
- [Particle CLI](https://docs.particle.io/tutorials/developer-tools/cli/)

