const fs = require('fs')
const package_json = require('./package.json')

let version = package_json.version + '.' + (process.env.BUILD_NUMBER || 'SNAPSHOT')
console.log(version)

let environmentPath = 'src/environments/environment.prod.ts'

fs.readFile(environmentPath, 'utf-8', function (err, data) {
  if (err) {
    console.log(err)
    return
  }

  let result = replaceVariable(data, 'version', version)

  fs.writeFile(environmentPath, result, function (err) {
    console.log(err)
  })
})

function indexOf(target, searchString, position = 0) {
  let result = target.indexOf(searchString, position)
  if (result < 0) {
    throw `Unable to find "${target}"`
  }
  return result
}

function replaceVariable(data, variable, target, quote = '\'') {
  let from = indexOf(data, variable)
  from = indexOf(data, quote, from)
  let to = indexOf(data, quote, from + 1)

  let forReplace = data.substring(from + 1, to)
  return data.replace(forReplace, target)
}
