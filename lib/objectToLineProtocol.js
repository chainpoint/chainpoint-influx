const os = require('os')
const { toNanoDate } = require('influx')
const moment = require('moment')
const { isDate, isNaN, isEmpty } = require('lodash')

function objectToLineProtocol (points = []) {
  return points
    .map((currVal) => {
      // Transform timestamp to nano timestamp
      if (!currVal.timestamp) currVal.timestamp = toNanoDate(Date.now()).getNanoTime()
      else if (isDate(currVal.timestamp)) currVal.timestamp = moment(currVal.timestamp).unix()

      // Transform tags to comma-delimited key=value
      if (currVal.tags) {
        currVal.tags = Object.keys(currVal.tags).reduce((acc, currTag) => {
          acc += `,${currTag}=${currVal.tags[currTag]}`
          return acc
        }, '')
      } else currVal.tags = ''

      // Transform fields
      let fields = Object.keys(currVal.fields).reduce((acc, currField, idx, arr) => {
        acc += `${currField}=${currVal.fields[currField]}${(idx === (arr.length - 1)) ? '' : ','}`

        return acc
      }, '')
      currVal.fields = fields

      return `${currVal.measurement}${currVal.tags} ${currVal.fields} ${currVal.timestamp}${os.EOL}`
    })
}

module.exports = objectToLineProtocol
