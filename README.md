This plugin is no longer developed - please use https://github.com/longzheng/homebridge-fronius-inverter-lights#readme



# homebridge-Fronius

Fronius API ReadOut

Based on homebridge-fronius-inverter by Stog

# Installation

1. Install homebridge using: sudo npm install -g homebridge
2. Install this plugin using: sudo npm install -g homebridge-fronius
3. Update your configuration file using the example below.

# Configuration

Add a new accessory for "FroniusPV" with a name for the accessory and the inverts IP Address as per the example below.

The following inverter data can be returned :

* **P_PV** - Live energy generation from the solar array
* **P_Load** - Live energy consumption through the inverter
* **P_Grid** - Live energy consumption from the grid


```
"accessories": [
    {
        "accessory": "FroniusPV",
        "name": "Generation",
        "ip": "xxx.xxx.xxx.xxx",
        "inverter_data": "P_PV"
    },
    {
        "accessory": "FroniusPV",
        "name": "Consumption",
        "ip": "xxx.xxx.xxx.xxx",
        "inverter_data": "P_Load"
    }
]
```
