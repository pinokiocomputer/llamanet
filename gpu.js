const system = require('systeminformation')
module.exports = async () => {
  let g = await system.graphics()
  let gpus
  if (g && g.controllers && g.controllers.length > 0) {
    gpus = g.controllers.map((x) => { return x.vendor.toLowerCase() })
  } else {
    gpus = []
  }

  let is_nvidia = gpus.find(gpu => /nvidia/i.test(gpu))
  let is_amd = gpus.find(gpu => /(amd|advanced micro devices)/i.test(gpu))
  let is_apple = gpus.find(gpu => /apple/i.test(gpu))

  let gpu = null
  if (is_nvidia) {
    gpu = "nvidia"
  } else if (is_amd) {
    gpu = "amd"
  } else if (is_apple) {
    gpu = "apple"
  } else if (gpus.length > 0) {
    gpu = gpus[0]
  }
  return gpu
}
