'use strict';

const http = require('http');
const https = require('https');

class TrueNASApi {
  constructor(host, apiKey, useHttps = false) {
    this.host = host;
    this.apiKey = apiKey;
    this.useHttps = useHttps;
    this.baseUrl = `${useHttps ? 'https' : 'http'}://${host}/api/v2.0`;
    this.timeout = 10000;
  }

  async get(path) {
    return this._request('GET', path, null);
  }

  async post(path, body) {
    return this._request('POST', path, body);
  }

  _request(method, path, body) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const parsedUrl = new URL(url);
      const bodyStr = body != null ? JSON.stringify(body) : null;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (this.useHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
        },
        rejectUnauthorized: false,
        timeout: this.timeout,
      };

      const lib = this.useHttps ? https : http;

      const req = lib.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            // Vissa endpoints returnerar bara ett tal, t.ex. "32"
            const num = Number(data.trim());
            if (!isNaN(num)) {
              resolve(num);
            } else {
              reject(new Error(`JSON parse failed: ${e.message}`));
            }
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  }

  // ─── API-endpoints ─────────────────────────────────────────────────────────

  async getSystemInfo() {
    return this.get('/system/info');
  }

  async getPools() {
    return this.get('/pool');
  }

  async getDisks() {
    return this.get('/disk');
  }

  /**
   * Hämtar temperatur för en enskild disk.
   * POST /api/v2.0/disk/temperature med body: { "name": "ada0" }
   * Returnerar ett tal (grader Celsius) eller kastar fel.
   */
  async getDiskTemperature(diskName) {
    return this.post('/disk/temperature', { name: diskName });
  }

  /**
   * Hämtar alla disknamn och hämtar temperatur för var och en.
   * Returnerar objekt: { "ada0": 32, "ada1": 35, ... }
   * Ignorerar diskar som inte rapporterar temperatur.
   */
  async getAllDiskTemperatures() {
    const disks = await this.getDisks();
    const names = disks.map((d) => d.name).filter(Boolean);

    const results = {};
    await Promise.all(
      names.map(async (name) => {
        try {
          const temp = await this.getDiskTemperature(name);
          if (typeof temp === 'number' && temp > 0) {
            results[name] = temp;
          }
        } catch (e) {
          // Ignorera diskar som inte stöder temperatur (t.ex. nvd0/boot-SSD)
        }
      })
    );
    return results;
  }

  async testConnection() {
    try {
      await this.getSystemInfo();
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = TrueNASApi;
