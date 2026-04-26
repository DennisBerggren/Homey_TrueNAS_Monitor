TrueNAS Monitor for Homey
=========================

Monitor your TrueNAS system directly from Homey. Get real-time status on pool health, disk temperatures, storage usage, and instant flow triggers when something goes wrong.


FEATURES
--------

- Pool health – Know immediately if your pool becomes degraded or faulted
- Pool status – ONLINE / DEGRADED / FAULTED / OFFLINE
- Storage usage – Used percentage and free space in TiB
- Disk temperatures – Max temperature across all disks (via SMART)
- Online/offline detection – Homey marks the device unavailable if TrueNAS can't be reached
- Flow triggers – Build automations when pool status changes or TrueNAS goes offline


REQUIREMENTS
------------

- Homey Pro (local network access required)
- TrueNAS CORE 13.x
- SMART service enabled in TrueNAS (for disk temperatures)
- A TrueNAS API key


INSTALLATION
------------

1. Create an API key in TrueNAS
   Go to Accounts > API Keys > Add in the TrueNAS web UI.
   Give the key a name (e.g. "Homey") and copy it – it is only shown once.

2. Add the device in Homey
   Open the Homey app > Add device > TrueNAS Monitor > TrueNAS System
   Enter your TrueNAS host (IP address or hostname) and the API key.

3. Done
   Homey will poll your TrueNAS every 60 seconds and update all capabilities automatically.


CAPABILITIES
------------

- Pool Healthy       Boolean – true when pool is healthy
- Pool Status        ONLINE, DEGRADED, FAULTED, OFFLINE, etc.
- Pool Used          Percentage of pool storage used
- Pool Free Space    Free storage in TiB
- Disk Temp (Max)    Highest temperature among all disks


FLOW CARDS
----------

Triggers:
- Pool status changed – fires when pool status changes, includes new status as token
- TrueNAS went offline – fires when Homey can no longer reach TrueNAS

Example flows:
- Send a push notification when pool status changes to DEGRADED
- Turn on a warning light when TrueNAS goes offline
- Log disk temperature to a Google Sheet every hour


NOTES
-----

- Disk temperatures require SMART to be enabled in TrueNAS under Services > S.M.A.R.T.
- Boot pool is automatically excluded from monitoring
- If you have multiple data pools, only the first one is currently monitored
- The app uses HTTP by default since most home TrueNAS setups use self-signed certificates


SOURCE CODE
-----------

https://github.com/DennisBerggren/Homey_TrueNAS_Monitor


LICENSE
-------

MIT License – Copyright (c) 2026 Dennis Berggren
