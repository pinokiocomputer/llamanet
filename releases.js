const fetch = require('cross-fetch')
const os = require('os')
const GPU = require('./gpu')
const search = (releases, condition) => {
  // iterate through releases until a release matching the exact condition is found
  for(let release of releases) {
    
    let matched = true
    for(let key in condition) {
      if (release[key] === condition[key]) {
      } else {
        matched = false
        break
      }
    }

    if (matched) {
      return release
    }
  }
}
module.exports = async () => {
  const platform = os.platform()
  const arch = os.arch()
  // returns the release URL to download
  const response = await fetch("https://api.github.com/repos/ggerganov/llama.cpp/releases/latest").then((res) => {
    return res.json()
  })
  const releases = response.assets.map((r) => {
    return r.browser_download_url
  }).map((x) => {
    let info = {
      url: x
    }
    if (/macos/i.test(x)) {
      info.platform = "darwin" 
    } else if (/win/i.test(x)) {
      info.platform = "win32"
    } else if (/ubuntu/i.test(x)){
      info.platform = "linux"
    }
    if (/arm64/i.test(x)) {
      info.arch = "arm64"
    } else if (/x64/i.test(x)) {
      info.arch = "x64"
    }
    if (/-cuda-/i.test(x)) {
      info.gpu = 'nvidia'
    } else {
      if (info.arch === 'arm64' && info.arch === 'arm64') {
        info.gpu = 'apple'
      }
    }
    return info
  })
  const gpu = await GPU()
  const match = search(releases, {
    platform,
    arch,
    gpu
  })
  return match
}
