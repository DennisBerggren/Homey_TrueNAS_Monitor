'use strict';

const Homey = require('homey');
const TrueNASApi = require('../../lib/TrueNASApi');

class TrueNASDriver extends Homey.Driver {
  async onInit() {
    this.log('TrueNAS Driver initialized');

    this._poolStatusChangedTrigger = this.homey.flow.getDeviceTriggerCard('pool_status_changed');
    this._trueNASOfflineTrigger = this.homey.flow.getDeviceTriggerCard('truenas_offline');
  }

  async onPair(session) {
    let host = '';
    let apiKey = '';

    session.setHandler('connect', async (data) => {
      host = (data.host || '').trim();
      apiKey = (data.apiKey || '').trim();

      if (!host || !apiKey) {
        throw new Error('Host and API key are required.');
      }

      const api = new TrueNASApi(host, apiKey);
      const ok = await api.testConnection();
      if (!ok) {
        throw new Error(`Could not connect to TrueNAS at "${host}". Check host and API key.`);
      }

      this._pairHost = host;
      this._pairApiKey = apiKey;
    });

    session.setHandler('list_devices', async () => {
      // Guard: om användaren tryckte Continue utan att fylla i Connect-formuläret
      if (!this._pairHost || !this._pairApiKey) {
        throw new Error('Please press Connect on the previous screen after entering your IP address and API key.');
      }

      const api = new TrueNASApi(this._pairHost, this._pairApiKey);
      const info = await api.getSystemInfo();

      return [
        {
          name: info.hostname || this._pairHost,
          data: {
            id: info.hostname || this._pairHost,
          },
          store: {
            host: this._pairHost,
            apiKey: this._pairApiKey,
            useHttps: false,
          },
        },
      ];
    });
  }

  async triggerPoolStatusChanged(device, status) {
    await this._poolStatusChangedTrigger
      .trigger(device, { status })
      .catch(this.error);
  }

  async triggerTrueNASOffline(device) {
    await this._trueNASOfflineTrigger
      .trigger(device, {})
      .catch(this.error);
  }
}

module.exports = TrueNASDriver;
