/**
 * Copyright 2018 Tierion
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
const { InfluxDB } = require('influx')

const INFLUXDB_DEFAULT_BATCH_SIZE = 1000
const INFLUXDB_DEFAULT_FLUSHING_INTERVAL = (60 * 1000) // 1min

/**
 * ShadowedInflux - A wrapper around the officially supported 'influx' package. This has been developed and re-packaged to address
 *                  two specific use cases not currently supported in the official package:
 *                      1) Batching
 *                      2) Supressing captured events when desired - disabling writing to InfluxDB (ex. in development environments you may not want to capture events)
 *
 *                  IMPORTANT NOTE: This wrapper only overrides one method - writePoints()
 *
 * @param {IClusterConfig|ISingleHostConfig|string} initOptions
 * @param {{ enabled?: boolean, batching?: boolean, batchSize?: Number }} config - Object that accepts enabled, batching properties which are both Booleans. 'enabled' defaults to true & 'batching' defaults to false, batchSize defaults to 1000
 *
 * @returns void
 */
function ShadowedInflux (initOptions, config = {}) {
  InfluxDB.call(this, initOptions)

  this.influxEnabled = config.enabled || true
  this.batching = config.batching || false
  this.flushingInterval = config.flushingInterval || INFLUXDB_DEFAULT_FLUSHING_INTERVAL
  this.eventQueue = []
  this.eventQueueBatchSize = config.batchSize || INFLUXDB_DEFAULT_BATCH_SIZE

  if (this.influxEnabled && this.batching) setInterval(this.flushEventQueue, this.flushingInterval)
}

ShadowedInflux.prototype = Object.create(InfluxDB.prototype)
ShadowedInflux.prototype.constructor = ShadowedInflux

ShadowedInflux.prototype.writePoints = function (points = [], opts = {}) {
  // Short-circuit and do not submit captured events if influxEnabled is set to false
  if (!this.influxEnabled) return

  this.eventQueue = this.eventQueue.concat(
    (!this.batching) ? points : points.map(currVal => {
      return Object.assign({}, currVal, {
        timestamp: new Date()
      })
    })
  )

  let events = (this.batching && (this.eventQueue.length >= this.eventQueueBatchSize)) ? this.eventQueue.splice(0, this.eventQueueBatchSize) : points

  console.log('InfluxDB : PROCESSING : Writing points...')

  InfluxDB.prototype.writePoints.call(this, events, opts).then(
    (res) => { return res },
    (err) => {
      this.eventQueue = this.eventQueue.concat(events)
      console.error(`InfluxDB : ERROR : Issues persiting captured application events : ${err.message}`)
    })
}

ShadowedInflux.prototype.flushEventQueue = function () {
  this.writePoints()
}

module.exports = ShadowedInflux
module.exports.InfluxDB = ShadowedInflux
