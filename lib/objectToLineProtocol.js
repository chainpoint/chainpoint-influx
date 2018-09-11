const os = require('os')
const { toNanoDate } = require('influx')
const moment = require('moment')
const { isDate, isNaN } = require('lodash')

function objectToLineProtocol (points = []) {
  return points
    .map((currVal) => {
      // Transform timestamp to nano timestamp
      if (isDate(currVal.timestamp)) currVal.timestamp = moment(currVal.timestamp).unix()
      else if (!isNaN(parseInt(currVal.timestamp))) currVal.timestamp = toNanoDate(currVal.timestamp).getNanoTime()
      else currVal.timestamp = toNanoDate(Date.now()).getNanoTime()

      // Transform tags to comma-delimited key=value
      if (currVal.tags) {
        currVal.tags = Object.keys(currVal.tags).reduce((acc, currTag) => {
          acc += `,${currTag}=${currVal.tags[currTag]}`
          return acc
        }, '')
      } else currVal.tags = ''

      // Transform fields
      let field = Object.keys(currVal.fields)[0]
      currVal.fields = `${field}=${currVal.fields[field]}`

      return `${currVal.measurement}${currVal.tags} ${currVal.fields} ${currVal.timestamp}${os.EOL}`
    })
}

module.exports = objectToLineProtocol
