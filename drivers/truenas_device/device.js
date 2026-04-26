'use strict';

const Homey = require('homey');
const TrueNASApi = require('../../lib/TrueNASApi');

const POLL_INTERVAL_MS = 60 * 1000;

class TrueNASDevice extends Homey.Device {
  async onInit() {
    this.log('TrueNAS Device initialized:', this.getName());

    const { host, apiKey, useHttps } = this.getStore();
    this._api = new TrueNASApi(host, apiKey, useHttps || false);
    this._lastPoolStatus = null;
    this._isAvailable = true;

    await this._poll();
    this._pollInterval = this.homey.setInterval(
      () => this._poll(),
      POLL_INTERVAL_MS
    );
  }

  onDeleted() {
    this.log('TrueNAS Device deleted');
    if (this._pollInterval) {
      this.homey.clearInterval(this._pollInterval);
    }
  }

  async _poll() {
    try {
      await this._updateSystemInfo();
      await this._updatePools();
      await this._updateDiskTemperatures();

      if (!this._isAvailable) {
        await this.setAvailable();
        this._isAvailable = true;
      }
    } catch (err) {
      this.log('Poll failed:', err.message);

      if (this._isAvailable !== false) {
        this._isAvailable = false;
        await this.setUnavailable(this.homey.__('device.unavailable'));
        await this.getDriver().triggerTrueNASOffline(this);
      }
    }
  }

  async _updateSystemInfo() {
    await this._api.getSystemInfo();
  }

  async _updatePools() {
    const pools = await this._api.getPools();
    const dataPools = pools.filter((p) => p.name !== 'boot-pool');

    if (dataPools.length === 0) {
      this.log('No data pools found');
      return;
    }

    const pool = dataPools[0];
    const stats = pool?.topology?.data?.[0]?.stats;
    const status = pool.status || 'UNKNOWN';

    this.log(`Pool "${pool.name}" – status: ${status}, healthy: ${pool.healthy}`);

    await this.setCapabilityValue('pool_healthy', pool.healthy === true);
    await this.setCapabilityValue('pool_status', status);

    if (this._lastPoolStatus !== null && this._lastPoolStatus !== status) {
      await this.getDriver().triggerPoolStatusChanged(this, status);
    }
    this._lastPoolStatus = status;

    if (stats?.size != null && stats.size > 0 && stats.allocated != null) {
      const freeBytes = stats.size - stats.allocated;
      const freeTiB = freeBytes / (1024 ** 4);
      const usedPct = (stats.allocated / stats.size) * 100;

      await this.setCapabilityValue('pool_free_tb', parseFloat(freeTiB.toFixed(2)));
      await this.setCapabilityValue('pool_used_percentage', parseFloat(usedPct.toFixed(1)));
    }
  }

  async _updateDiskTemperatures() {
    try {
      const temps = await this._api.getAllDiskTemperatures();
      const values = Object.values(temps).filter((v) => v != null && v > 0);
      if (values.length === 0) return;

      const maxTemp = Math.max(...values);
      await this.setCapabilityValue('measure_temperature', maxTemp);
      await this.setCapabilityValue('disk_temp_max', maxTemp);
    } catch (err) {
      this.log('Could not fetch disk temperatures:', err.message);
    }
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('Settings changed:', changedKeys);
  }
}

module.exports = TrueNASDevice;
