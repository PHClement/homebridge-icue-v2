var Service, Characteristic;
const io = require('socket.io-client');
const socket = io('http://52.47.177.139:7574');

/**
 * @module homebridge
 * @param {object} homebridge Export functions required to create a
 *                            new instance of this plugin.
 */
module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-icue', 'ICUE', ESP_LED);
};

/**
 * Parse the config and instantiate the object.
 *
 * @summary Constructor
 * @constructor
 * @param {function} log Logging function
 * @param {object} config Your configuration object
 */
function ESP_LED(log, config) {
    this.log = log;
    this.service = 'ICUE';
    this.name = config.name;
}

/**
 *
 * @augments ESP_RGB
 */
ESP_LED.prototype = {

    /** Required Functions **/
    identify: function (callback) {
        this.log('Identify requested!');
        callback();
    },

    getServices: function () {
        // You may OPTIONALLY define an information service if you wish to override
        // default values for devices like serial number, model, etc.
        var informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, 'CORSAIR')
            .setCharacteristic(Characteristic.Model, 'ICUE')
            .setCharacteristic(Characteristic.SerialNumber, 'ICUE564498');

        this.log('Creating ICUE accessory');
        var lightbulbService = new Service.Lightbulb(this.name);

        lightbulbService
            .getCharacteristic(Characteristic.On)
            .on('get', this.getPowerState.bind(this))
            .on('set', this.setPowerState.bind(this));

        // Handle HSV color components
        lightbulbService
            .addCharacteristic(new Characteristic.Hue())
            .on('get', this.getHue.bind(this))
            .on('set', this.setHue.bind(this));

        lightbulbService
            .addCharacteristic(new Characteristic.Saturation())
            .on('get', this.getSaturation.bind(this))
            .on('set', this.setSaturation.bind(this));

        lightbulbService
            .addCharacteristic(new Characteristic.Brightness())
            .on('get', this.getBrightness.bind(this))
            .on('set', this.setBrightness.bind(this));

        this.log('Finished getting services')
        return [lightbulbService];
    },

    //** Custom Functions **//

    /**
     * Gets power state of lightbulb.
     *
     * @param {function} callback The callback that handles the response.
     */
    getPowerState: function (callback) {
        callback(null, true);
    },

    /**
     * Sets the power state of the lightbulb.
     *
     * @param {function} callback The callback that handles the response.
     */
    setPowerState: function (state, callback) {
        callback(null);
    },

    /**
     * Gets brightness of lightbulb.
     *
     * @param {function} callback The callback that handles the response.
     */
    getBrightness: function (callback) {
        socket.emit('icue:color:get:brightness');
        socket.on('icue:color:get:brightness', (v) => {
            callback(null, v);
        });
    },

    /**
     * Sets the brightness of the lightbulb.
     *
     * @param {Number}   level    The brightness (0-360)
     * @param {function} callback The callback that handles the response.
     */
    setBrightness: function (level, callback) {
        let scaled = Math.round(level * 255);
        socket.emit('icue:color:set:brightness', scaled);
        callback(null);
    },

    /**
     * Gets the hue of the lightbulb.
     *
     * @param {function} callback The callback that handles the response.
     */
    getHue: function (callback) {
        socket.emit('icue:color:get:hue');
        socket.on('icue:color:get:hue', (v) => {
            callback(null, v);
        });
    },

    /**
     * Sets the hue of the lightbulb.
     *
     * @param {Number}   level    The hue (0-360)
     * @param {function} callback The callback that handles the response.
     */
    setHue: function (level, callback) {
        let scaled = Math.round(level * 255);
        socket.emit('icue:color:set:hue', scaled);
        callback(null);
    },

    /**
     * Sets the saturation of the lightbulb.
     *
     * @param {number} level The saturation of the new call (0-100)
     * @param {function} callback The callback that handles the response.
     */
    getSaturation: function (level, callback) {
        socket.emit('icue:color:get:saturation');
        socket.on('icue:color:get:saturation', (v) => {
            callback(null, v);
        });
    },

    /**
     * Sets the saturation of the lightbulb.
     *
     * @param {number} level The saturation of the new call (0-100)
     * @param {function} callback The callback that handles the response.
     */
    setSaturation: function (level, callback) {
        let scaled = Math.round(level * 255);
        socket.emit('icue:color:set:saturation', scaled);
        callback(null);
    },
};
