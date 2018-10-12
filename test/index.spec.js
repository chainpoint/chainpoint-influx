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

/* eslint-disable */

const expect = require('chai').expect
const assert = require('assert')
const sinon = require('sinon')
const nock = require('nock')
const { InfluxDB } = require('../index')

let eventTracker
let clock

describe('Chainpoint InfluxDB', function () {
  before(() => {
    clock = sinon.useFakeTimers()

    eventTracker = new InfluxDB('http://127.0.0.1:8186/chainpoint', {
      enabled: true,
      batching: true,
      batchSize: 10,
      flushingInterval: 15 * 1000 // 15secs
    })
  })

  after(() => {
    clock.restore()
  })

  // Testing Batching
  it('Flushing Event Queue should occur at the specified interval (15 seconds for this test) ', function (done) {
    let eventTracker = sinon.stub(new InfluxDB('http://127.0.0.1:8186/chainpoint', {
      enabled: true,
      batching: true,
      batchSize: 10,
      flushingInterval: 15 * 1000 // 15secs
    }))

    clock.tick(14 * 1000);
    assert(eventTracker.writePoints.notCalled)

    clock.tick(1 * 1000);
    assert(eventTracker.writePoints.calledOnce)
    done()
  })

  it('Write 5 Points and make sure eventQueue has correct length and that writePoints resolves with a promise', function (done) {
    eventTracker.writePoints([{}, {}, {}, {}, {}]).then(() => {
      expect(eventTracker.eventQueue).to.have.lengthOf(5)
      done()
    })
  })

  it('Write another 5 Points and make sure that a XHR call is made to write aggregated 10 points to InfluxDB', function (done) {
    nock('http://127.0.0.1:8186').post(() => true) .reply(200, {});

    eventTracker.writePoints([{}, {}, {}, {}, {}]).then(() => {
      expect(eventTracker.eventQueue).to.have.lengthOf(0)
      done()
    })
  })
})
