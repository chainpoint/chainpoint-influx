# Chainpoint Influx

## Installation

For Node, simply:

    $ npm install --save https://github.com/chainpoint/chainpoint-influx.git

## Features

 * Wraps the officially supported `influx` package
 * Provides the ability to batch writes
 * Allows you to enable/disable capturing events and writing to Influx (useful in non-production environments)

## Usage

```
const { InfluxDB } = require('chainpoint-influx')
```

To instantiate an Influx object, make the same constructor as you would with the officially supported `influx` package and pass an additional `config` object which is optional and whose object signature can be seen in the code snippet below.

```
const influx = new InfluxDB(<IClusterConfig|ISingleHostConfig|string>, {
    enabled: true,
    batching: true,
    batchSize: 10,
    flushingInterval: 15 * 1000 // 15secs
})
```

|   Properties   |                                                                                                           Description                                                                                                          | Required | Type   |
|:--------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:--------:|--------|
|      Connection Options     |                                                   Connect to a single InfluxDB instance by specifying a set of connection options..                                                  |    yes   | `IClusterConfig|ISingleHostConfig|string` |
| Config     | `{ enabled?: boolean, batching?: boolean, batchSize?: Number, flushingInterval?: Number }`                                                                                         | no       | object    |



## How this package differs from `influx`

NOTE: This package only introduces two mutation points towards the original `influx` package which are as follows:
> 1. This package overrides the method: `writePoints()`
> 2. This package introduces a new method `flushEventQueue()` which is only invoked when `batching` has been enabled

Also, flushing the event queue is something that cannot be overwritten, if `batching` has been enabled, the event queue will always be flushed at the specified (or default of 10 seconds) interval.


## License

[Apache License, Version 2.0](https://opensource.org/licenses/Apache-2.0)

```text
Copyright (C) 2018 Tierion

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
