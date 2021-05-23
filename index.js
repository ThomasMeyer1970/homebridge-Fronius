const axios = require('axios');
const setupCache = require('axios-cache-adapter').setupCache;

var Service, Characteristic;

const DEF_MIN_LUX = 0,
      DEF_MAX_LUX = 10000;

const PLUGIN_NAME   = 'homebridge-fronius';
const ACCESSORY_NAME = 'FroniusPV';

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory(PLUGIN_NAME, ACCESSORY_NAME, FroniusPV);
}

/**
 * Setup Cache For Axios to prevent additional requests
 */
const cache = setupCache({
  maxAge: 0 //in ms
})

const api = axios.create({
  adapter: cache.adapter,
  timeout: 0
})


const getInverterData = async(inverterIp) => {
	try {
	    return await api.get('http://'+inverterIp+'/solar_api/v1/GetPowerFlowRealtimeData.fcgi')
	} catch (error) {
	    console.error(error);
	    return null;
	}
}


const getAccessoryValue = async (inverterIp, inverterDataValue) => {

	// To Do: Need to handle if no connection
	const inverterData = await getInverterData(inverterIp)

	if(inverterData) {
		if (inverterData.data.Body.Data.Site[inverterDataValue] == null) {
			return 0
		} else {
			// Return positive value
			return Math.abs(Math.round(inverterData.data.Body.Data.Site[inverterDataValue], 1))
		}
	} else {
		// No response inverterData return 0
		return 0
	}
}

class FroniusPV {
    constructor(log, config) {
    	this.log = log
    	this.config = config

    	this.service = new Service.LightSensor(this.config.name)

    	this.name = config["name"];
    	this.manufacturer = config["manufacturer"] || "Fronius";
	    this.model = config["model"] || "Inverter";
	    this.serial = config["serial"] || "4567";
	    this.ip = config["ip"];
	    this.inverter_data = config["inverter_data"];
	    this.minLux = config["min_lux"] || DEF_MIN_LUX;
    	this.maxLux = config["max_lux"] || DEF_MAX_LUX;
    }

    getServices () {
    	const informationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
        .setCharacteristic(Characteristic.Model, this.model)
        .setCharacteristic(Characteristic.SerialNumber, this.serial)

        this.service.getCharacteristic(Characteristic.CurrentAmbientLightLevel)
		  .on('get', this.getCurrentAmbientLightLevelHandler.bind(this))
		  .setProps({
			minValue: this.minLux
		  });

	    return [informationService, this.service]
    }

    async getCurrentAmbientLightLevelHandler (callback) {
		let getValue = await getAccessoryValue(this.ip, this.inverter_data)

		this.log(`calling getCurrentAmbientLightLevelcHandler`, getValue)

	    callback(null, getValue)
	}
}
