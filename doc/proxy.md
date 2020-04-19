## Robot -> Broker protocol

The communication between The MMBot (The Robot) and a crypto-market is provided through a broker. The broker is small program which is executed as single
linux process and comunnicates using pipes.

The Robot starts this broker once it is needed and keeps it running, until the robot is stopped. The connection is made using three pipes connected to **stdin**, **stdout** and **stderr**. So the broker reads its **stdin**, and replies to **stdout**. It can also log its actions to **stderr**, which is routed to the robot's logfile 

The communication is synchronous: request-reply style. The broker must only send one response to each request. The broker can also use stderr only if the response is expected (note: the whole line need to be written to the stderr, including "\n", otherwise, the communication can deadlock and eventually timeout)

Every request is send on single line terminated by a new line character '\n'
The response should be send as a single line too.

There is hardcoded timeout 30 seconds while The Robot is willing to wait for any character from the pipe. If the broker needs a more time, it should send single `space` (ASCII 32) character at least once per 30 seconds. When timeout occures, The Robot terminates the broker (SIGTERM or SIGKILL) and acts as if there would be an error response


Both request and response are valid JSONs (stderr can handle any arbitrary text)

### Request 

```
["function_name"]\n
["function_name", <argument>]\n
```

(the character '\n' represents the new line character)

There can be zero or one argument - multiple arguments are passed as a JSON object  

### Successful response

```
[ true ]\n
[ true, <return_value> ]\n
```

The function can return zero or one result. Multiple results are returned as a JSON object

### Error response

```
[ false, "<error message>" ]\n
```

Errors are carried as exception through the robot's code. It depends on the situation how it is handled. In most of the cases, the robot skips the cycle and tries the to repeat the operation after a while.

If "placeOrder" fails, the order is considered as "not placed".

## Functions

### reset

```
["reset"]
```
Request to reset internal state of the broker. It is ideal place to clear any cache 
or perform garbage collecting. The function is called at the begining of every cycle.

** Response **
```
[ true ]
```

### enableDebug
```
["enableDebug",true/false]
```
Enables or disables debug mode. This is optional feature. When debug mode is on, the broker
should send debug informations to the standard error. When debug mode is off, the broker
should stay quiet.   

** Response when supported **

```
[true]
```
** Response when not supported **

```
[false]
```



### getBalance

```
["getBalance", {"symbol":<symbol>,"pair":<pair>}]
```
Return wallet's balance for given `symbol`. Note that complete balance is required 
(blocked money for orders must not be substracted). Result is sent as single number.
The field `pair` contains identifier of pair in which context the request was made. This helps to choose correct wallet in case of multiwallet account.

```
[ true, <number> ]
```

#### TIP: 
The broker can read balance for all symbols and cache the result for fast access. It
should clear the cache on **reset**


### getTicker

```
["getTicker", <pair>]
```

Returns ticker for given pair 

```
[ true, {"bid": <number>, "ask": <number>, "last": <number>, "timestamp": <number>} ]
```

#### TIP: 
To reduce count of requests, the broker can read multiple symbols and serve them from cache until the "reset"

### syncTrades

```
["syncTrades", {"lastId": <value>,  "pair": <pair>} ]
```

Reads last trades.  
* **lastId** - contains **lastId** returned by previous read. For the very first read this field is missing or it is set to **null** 
* **pair** - specifies pair

```
[ true, {"lastId":<value>,
         "trades:[{ 
             "id": <value> , 
             "time": <number>, 
             "size":<number>, 
             "price":<number>, 
             "eff_size":<number>, 
             "eff_price":<number>,
            } ]
         }
]         
```
* **lastId** - this value is remembered and used on next call. It can by any arbitrary JSON value.
* **id** - id of trade (can be string or number)
* **time** - timestamp
* **size** - amount of assets. The number is positive for buy, or negative for sell,
* **price** - trade price (rate)
* **eff_size** - effective amount after fees are removed (if applied on assets)
* **eff_price** - effective price after fees are removed (if applied on currency)

**example**

When fees are applied on currency, and we have following trade

```
BUY 2.1 BTC at 7520, fees 0.12%

size = 2.1
price = 7520
eff_size = 2.1
eff_price = 7529.024
```

```
SELL 1.5 BTC at 7654, fees 0.12%

size = -1.5
price = 7654
eff_size = -1.5
eff_price = 7644.8262
```


### getOpenOrders

```
["getOpenOrders", <pair>]
```
Returns open orders for given **pair**

```
[ true, [{"id":<value>, "clientOrderId": <value>, "size": <number>, "price":<number> },...] ]
```

* **id** - id of order (string or number)
* **clientOrderId** - value passed with placeOrder as client's id. The robot uses a number
* **size** - size of order, amount of assets to trade. positive - buy, negaive - sell
* **price** - price of the order (LIMIT price)  
 
### placeOrder

```
["placeOrder", {"pair": <string>, 
                "size": <number>, 
               "price": <number>, 
       "clientOrderId": <value>, 
      "replaceOrderId": <value> }]
```

Places new order. The Robot always places LIMIT order. 

* **pair** - pair
* **size** - size of the order. Specify **negative** value for **SELL** and **positive** value to **BUY**
* **price** - LIMIT price
* **clientOrderId** - custom ID stored along with the order. The robot uses the custom ID to find its orders
* **replaceOrderId** - (optional), contains ID of order to replace. This order should be canceled before the new order is placed. If the argument is not given, the function places a new order

### getInfo 
```
["getInfo", <pair>]
```

Returns information about a trading pair

```
[ true, { "asset_step": <number>,
		   "currency_step": <number>,
		   "asset_symbol": <string>,
		   "currency_symbol": <string>,
		   "min_size": <number>,
		   "fees": <number>,
		   "feeScheme", "currency|assets|income|outcome"
		   	"leverage": <number>,
		   	"invert_price": <bool>
		   	"inverted_symbol": <string>
		   	"simulator": <bool>
		    }]
```

- **asset_step** - step on which the amount of the order can be specified (count
   of decimal places, but is represented as minimal fraction. For example 0.0001 represents 4 decimal numbers. 
- **currency_step** - step on which the price of the order can be specified (count
   of decimal places, but is represented as minimal fraction. For example 0.0001 represents 4 decimal numbers. 
- **asset_symbol** - string contains symbol for the assets. This symbol is used to
search the balance. Example: "XBT" 
- **currency_symbol** - string contains symbol for the currency. This symbol is used to search the balance. Example: "USD"
- **min_size** - minimal size of the order
- **fees** - maker fees as fraction of 1. If the fees are 0.1%, the correct value for this field is 0.001
- **feeScheme** - specifies how fees are substracted 
    - **currency** - fees are substracted from currency  
    - **assets** - fees are substracted from assets
    - **income** - fees are substracted from currency when sell, or assets when buy  
    - **outcome** - fees are substracted from currency when buy, or assets when sell
- **leverage** -  when pair can use leverage. This value should be greater or
  equal to zero. If zero is specified (default), there is no leverage. Otherwise 
  leverage is available (for example 100 means leverage 100x) and it also enables
  `shorts`.
- **invert_price** - the value `true` specifies, that price is inverted. It is used when
  the trading pair is inverted futures. The quoted price must be send as 1/price, the position
  and the size of the order must be multiplied by -1 and this flag  must be set to `true`.
- **inverted_symbol** - for inverted futures specifies symbol for price in which the futures are
  quoted. For example Deribit BTC/USD is inverted futures. Assets is 'contracts', currency is BTC, 
  and inverted symbol is USD.
- **simulator** - set this to `true`, if the pair is not actual trading for the real money, but just
  kind of simulator, paper trading, etc. 
    
    
    

### getFees
```
["getFees", <pair> ]
```

Returns current fees for the pair. The method is called more often than getInfo, so this is the reason, why it exists separatedly. It is possible to cache this value. On some stockmarkets, there is possible fee discount on large volume, so robot can get always updated fees before it starts to trade on next cycle.


```
[ true, <number> ]
```

The returned value is franction of 1. Example 0.1% fees is sent as 0.001

### getAllPairs
```
["getAllPairs"]
```

Returns all available tradable pairs on stockmarket


```
[ true, [<string>,<string>,<string>,...] ]
```

### getBrokerInfo 
```
["getBrokerInfo"]
```

Returns general informations about the broker

```
{
	"name":<string>,
	"url":<string>,
	"version":<string>,
	"licence":<string>,
	"trading_enabled":<boolean>,
	"settings":<boolean>,
	"subaccounts":<boolean>,
	"favicon":<string>
}
```
* **name** - name of the exchange (Binane, Deribit, BitMEX, Coinmate, etc]
* **url** - full url to exchange's home page
* **version** - version of the broker 
* **licence** - licence text
* **trading_enabled** - set `true`, if the trading is enabled. Trading is disabled because
the API key is not set.
* **settings** - set `true`, if the broker has extra settings (getSettings, setSettings, restoreSettings)
* **subaccounts** - set `true`, if the broker has supports subaccounts (subaccount command)
* **favicon** - icon in base64, content-type: image/png
	 
### getApiKeyFields
```
["getApiKeyFields"]
```
Returns list of fields need to be filled by a user to import API key. Different exchanges has
different format of the key, and the different count of requied fields. 

Description of return value can be found at function `getSettings` The function must not return
stored keys. These values must be never returned to the user.

### setApiKey
```
["setApiKey", <object>]
```
Stores all values need to initialize API key. Parameter is object which contains key-value set
of fields. Names and types of this fields can be obtained by function `getApiKeyFields`


###getSettings
```
["getSettings","hint"]
```

Allows to user to change some internal settings of the broker. This function must be enabled
in the result of the function `getBrokerInfo`. This function returns list of fields with their values to be changed by user. The returned data are used to build a form, which user can fill or edit.

* **hint** - contains currenctly selected pair. The broker can use this value as hint which
fields to serve.  

** Return value **

Returned value is an array of fields

```
[{
	"name",<string>,
	"label",<string>,
	"type","string|number|textarea|enum|hidden",
	"default":<value>,
	"options": {
	     "value1":"label1",
	     "value2":"label2",
	     ...
	     }
},....]
```
* **name** - name of the field
* **label** - label of the field
* **type** - one of specified type
* **default** - (optional) if set, the input control is pre-filled by this value
* **options** - just for `enum` - contains list of values with label. The result control is 
  a combobox where user can choose one of the values

###setSettings
```
["setSettings", <value>]
```

Stores settings edited by the user. The settings must be stored permanently in the secured area,
similar to location where the API key is stored. The settings must be also immediatelly applied.


**Return value**

Function can optionally return an object. If object is returned, then the object is stored in the bot's configuration file. Then anytime, the broker is restarted, the stored object is passed using **restoreSettings** during initialization. This allows to broker keep its configuration together with configuration of the bot. The broker should avoid to store security data in this configuration.

###restoreSettings
```
["restoreSettings", <value>]
```

Restores complete settings from the JSON value. This function is called right after the
broker is started. The JSON value is remembered after setSettings returns it as return value. This allows to store settings inside of broker's configuration

###subaccount
```
["subaccount"]
["subaccount", [<id>, <cmd>]]
["subaccount", [<id>, <cmd>, <args>]]
```

Allows to handle multiple accounts by a single broker. There is always the main account, which is accessed directly, but there can be also unlimited number of 
subaccounts that can be accessed through the command **subaccount**. Each subaccount has an **id**, which is string consists from alphanumberic characters (no other
characters are allowed). 

The subaccount is created everytime when a new **id** is used for the first time. The broker keeps state of each subaccount in the memory and don't need to store subaccounts to a file (except the api key, which must be stored separatedly for given **id**). If the broker is restarted, the Robot recreates all subaccounts that are being used by sending **reset** or **restoreSettings** for each of them

* **id** - unique identifier of the subaccount
* **cmd** - command to execute, any command from list above except the command **subaccount** itself.
* **args** - arguments of the command

If the command is called without arguments, it has to return list of created subaccounts 

**examples** 

```
["subaccount",["test1","reset"]]
["subaccount",["test1","getBalance",{"symbol":"btc", "pair":"btcusd"}]]  
["subaccount",["test1","getOpenOrders",["btcusd"]]]
```




### When function is not implemented

This protocol can be extended anytime in future. All new functions that arn't implemented
by the broker should reply by the response:

```
[ false ]
```



## Debugging

To debug communaction, start the robot with the switch **-d**. The communaction is copied to the log file on **debug level**

 
 

 