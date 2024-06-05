const colors = require('colors')
const os = require('os')
const fs = require('fs')
const path = require('path')
const llamacpp = require('./llamacpp')
const util = require("./util")
const homedir = process.env.LLAMANET_PATH || path.resolve(os.homedir(), "llamanet")
class Handler {
  constructor() {
    this.procs = []
    this.default_model = process.env.LLAMANET_DEFAULT_MODEL || "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf"
  }
  async call(body, callback) {
    if (body && body._) {
      const { _, ...kwargs } = body;
      if (_.length > 0) {
        const [cmd, ...info] = _;
        // 2. process commands
        if (cmd === 'off') {
          let response = await this.off()
          return response
        } else if (cmd === 'start') {
          let response = await this.start(body, callback)
          return response
        } else if (cmd === 'stop') {
          let response = await this.stop(info, callback)
          return response
        } else if (cmd === 'status') {
          let response = await this.status()
          return response
        } else if (cmd === 'models') {
          let response = await llamacpp.models()
          return response
        }
      } else {
        // nothing 
      }
    }
  }
  async off() {
    await this.kill()
    process.exit()
  }
  resolveUrl(url) {
    if (url.startsWith("https://huggingface.co/")) {
      let re = /https:\/\/huggingface.co\/([^\/]+)\/([^\/]+)\/.+\/(.+\.gguf)/i
      let match = re.exec(url)
      if (match && match.length > 0) {
        let repo = match[1] + "/" + match[2]
        let file = match[3]
        return { repo, file }
      }
    } else {
      return { file: url }
    }
  }
  find(q) {
    for(let i=0; i<this.procs.length; i++) {
      let proc = this.procs[i]
      // url: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf?download=true
      if (q.url) {
        if (q.url.startsWith("https://huggingface.co/")) {
          let r = this.resolveUrl(q.url)
          if (r) {
            let { repo, file } = r
            if (file === proc.file && repo === proc.repo) {
              return { proc, i }
            }
          }
        }
      } else if (q.repo && q.file) {
        if (file === proc.file && repo === proc.repo) {
          return { proc, i }
        }
      }
    }
    return null
  }
  async status() {
    return this.procs.map((proc) => {
      let { session, ...attrs } = proc
      return attrs
    })
  }
  async kill() {
    for(let proc of this.procs) {
      await this.stop([proc.url])
    }
  }
  async stop(info, callback) {
    if (info && Array.isArray(info) && info.length > 0) {
      const [url] = info
      // kill url
      const found = this.find({url})
      if (found) {
        const { proc, i } = found;

        // kill process
        proc.session.stdin.end();
        proc.session.stdout.destroy();
        proc.session.stderr.destroy();
        proc.session.kill();

        // remove from this.procs
        this.procs.splice(i, 1);
      }
    } else {
      // kill all
      for (let proc of this.procs) {
        // kill process
        proc.session.stdin.end();
        proc.session.stdout.destroy();
        proc.session.stderr.destroy();
        proc.session.kill();
        // remove from this.procs
      }
      this.procs = []
    }
    if (callback) callback({ type: "stopped" })
  }
  async start(argv, callback) {
    // $ npx llamanet start https://huggingface.co/Orenguteng/Llama-3-8B-Lexi-Uncensored-GGUF/resolve/main/Lexi-Llama-3-8B-Uncensored_F16.gguf
    const { _, ...kwargs } = argv
    const [cmd, ...info] = _;

    let u = (info.length > 0 ? info[0] : this.default_model)
    const r = this.resolveUrl(u)

    let repo
    let file
    if (r && r.repo && r.file) {
      // if huggingface url
      repo = r.repo
      file = r.file 
    } else {
      // if not huggingface url, just use the default huggingface model (Phi3)
      const rd = this.resolveUrl(this.default_model)
      repo = rd.repo
      file = rd.file 
      u = this.default_model
    }
    let terminal = ""
    try {
      // try downloading the model from the url
      await llamacpp.checkpoint(repo, file, callback)
    } catch (e) {
      // if the model download fails, use the default model
      await util.logLine("requested model doesn't exist: " + u)
      const rd = this.resolveUrl(this.default_model)
      repo = rd.repo
      file = rd.file 

      // download the default model
      await llamacpp.checkpoint(repo, file, callback)
      u = this.default_model
      await util.logLine("use the default model: " + u)
    }
    const { port, session } = await new Promise(async (resolve, reject) => {
      const { port, session } = await llamacpp.server({ repo, file, kwargs }, async (data) => {
        terminal += data
        await util.log(data)
        if (/HTTP server listening/i.test(terminal)) {
          terminal = ""
          // started
          callback({ data: data, type: "started" })
          await util.logLine(colors.green(`\n█ llama.cpp server for ${repo} ${file} running at `) + colors.blue(`http://localhost:${port}\n`))

          resolve({ port, session })
        } else {
          callback({ data: data, type: null })
        }
      })
    })
    this.procs.push({
      port,
      session,
      repo,
      file,
      url: u
    })
    return { port, repo, file, url: u }
  }
}
module.exports = Handler
