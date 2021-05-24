const axios = require('axios');

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
 * Main API request with all data
 *
 * @param {inverterIp} the IP of the inver to be queried
 */
const getInverterData = async(inverterIp) => {
	try {
	    return await axios.get('http://'+inverterIp+'/solar_api/v1/GetPowerFlowRealtimeData.fcgi')
	} catch (error) {
	    console.error(error);
	    return null;
	}
}


const getAccessoryValue = async (inverterIp, inverterDataValue) => {

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
	    this.serial = config["serial"] || "8945";
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
	   setInterval(async () => {	
	   let getValue = await getAccessoryValue(this.ip, this.inverter_data)

		this.log(`calling getCurrentAmbientLightLevelcHandler`, getValue)

	    callback(null, getValue)
            }, 5 * 1000);
   }
}
