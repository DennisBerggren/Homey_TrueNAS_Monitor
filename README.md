# TrueNAS Monitor for Homey

Monitor your TrueNAS system directly from Homey. Get real-time status on pool health, disk temperatures, storage usage, and instant flow triggers when something goes wrong.

![Homey App](https://img.shields.io/badge/Homey-SDK%20v3-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Features

- **Pool health** – Know immediately if your pool becomes degraded or faulted
- **Pool status** – ONLINE / DEGRADED / FAULTED / OFFLINE
- **Storage usage** – Used percentage and free space in TiB
- **Disk temperatures** – Max temperature across all disks (via SMART)
- **Online/offline detection** – Homey marks the device unavailable if TrueNAS can't be reached
- **Flow triggers** – Build automations when pool status changes or TrueNAS goes offline

## Requirements

- Homey Pro (local network access required)
- TrueNAS CORE 13.x
- SMART service enabled in TrueNAS (for disk temperatures)
- A TrueNAS API key

## Installation

### 1. Create an API key in TrueNAS

Go to **Accounts → API Keys → Add** in the TrueNAS web UI.
Give the key a name (e.g. "Homey") and copy it – it is only shown once.

### 2. Add the device in Homey

Open the Homey app → **Add device → TrueNAS Monitor → TrueNAS System**

Enter:
- **Host** – IP address or hostname of your TrueNAS (e.g. `192.168.1.100`)
- **API Key** – the key you created above

### 3. Done

Homey will poll your TrueNAS every 60 seconds and update all capabilities automatically.

## Capabilities

| Capability | Description |
|---|---|
| Pool Healthy | Boolean – true when pool is healthy |
| Pool Status | Enum – ONLINE, DEGRADED, FAULTED, etc. |
| Pool Used | Percentage of pool storage used |
| Pool Free Space | Free storage in TiB |
| Disk Temperature (Max) | Highest temperature among all disks |

## Flow Cards

### Triggers
- **Pool status changed** – fires when pool status changes, with the new status as a token
- **TrueNAS went offline** – fires when Homey can no longer reach TrueNAS

### Example flows
- Send a push notification when pool status changes to DEGRADED
- Turn on a warning light when TrueNAS goes offline
- Log disk temperature to a Google Sheet every hour

## Notes

- Disk temperatures require SMART to be enabled in TrueNAS under **Services → S.M.A.R.T.**
- Boot pool (boot-pool) is automatically excluded from monitoring
- If you have multiple data pools, only the first one is currently monitored
- The app uses HTTP by default since most home TrueNAS setups use self-signed certificates

## Development

```bash
git clone https://github.com/DennisBerggren/Homey_TrueNAS_Monitor.git
cd Homey_TrueNAS_Monitor
homey app run
```

### Project structure

```
com.truenas.monitor/
├── .homeycompose/
│   ├── capabilities/       Custom capabilities
│   └── flow/triggers/      Flow trigger definitions
├── drivers/
│   └── truenas_device/
│       ├── assets/         Icons and images
│       ├── pair/           Custom pairing UI
│       ├── device.js       Polling and capability updates
│       └── driver.js       Pairing and flow card registration
├── lib/
│   └── TrueNASApi.js       REST API client for TrueNAS v2.0
└── app.js
```

## Contributing

Pull requests are welcome. If you find a bug or want to add support for multiple pools, per-disk temperatures, or other TrueNAS features, feel free to open an issue or PR.

## License

MIT – see [LICENSE](LICENSE) for details.

---

*Not affiliated with iXsystems or TrueNAS. Use at your own risk.*
