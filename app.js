'use strict';

const Homey = require('homey');

class TrueNASApp extends Homey.App {
  async onInit() {
    this.log('TrueNAS Monitor app started');
  }
}

module.exports = TrueNASApp;
