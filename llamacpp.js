const fs = require('fs')
const colors = require('colors')
const { glob } = require('glob');
const path = require('path')
const { spawn } = require('child_process');
const os = require('os')
const decompress = require('decompress')
const { DownloaderHelper } = require('node-downloader-helper');
const randomUseragent = require('random-useragent');
const unparse = require('yargs-unparser-custom-flag');
const Releases = require('./releases')
const util = require('./util')
const homedir = process.env.LLAMANET_PATH || path.resolve(os.homedir(), "llamanet")
const bindir = (os.platform() === 'win32' ? homedir : path.resolve(homedir, "build/bin"))
if (!fs.existsSync(homedir)) {
  fs.mkdirSync(homedir, { recursive: true })
}

const server = async (req, cb) => {

  const port = await util.port()
  const command = "./llama-server"
  
  //let file = path.resolve(homedir, req.file)
  let file = path.resolve(homedir, "models/huggingface", req.repo, req.file)
  //let file = path.resolve(homedir, req.file)


  const k = Object.assign({}, { c: "2048", embeddings: true }, req.kwargs, { m: file, port })

  const args = unparse({
    _: [],
    ...k
  })


  //let args = ["-m", file, "-c", "2048", "--port", port]
//  if (req.repo) {
//    args = args.concat(["--hf-repo", req.repo])
//  }
  await util.logLine(`${command} ${args.join(" ")}`)

  let terminal = ""
  const child = spawn(command, args, {
    cwd: bindir,
  });

  // Handle output from the child process
  child.stdout.on('data', (data) => {
    cb(data)
  });

  child.stderr.on('data', (data) => {
    cb(data)
  });

  child.on('close', async (code) => {
    await util.logLine(`child process exited with code ${code}`);
  });
  return { port, session: child }
}
const models = async () => {
  try {

    let _models = await glob(homedir + "/**/*.gguf", { nodir: true })


//    let files = await fs.promises.readdir(bindir)
//    let _models = files.filter((file) => {
//      return file.endsWith(".gguf")
//    })

    let items = []
    for(let model of _models) {
      let id = path.relative(homedir, model)
      let chunks = id.split(path.sep).slice(2)
      let repo = chunks[0] + "/" + chunks[1]
      let file = chunks[2]

      id = `https://huggingface.co/${repo}/resolve/main/${file}`
      items.push({
        id,
        object: "model",
        created: null,
        owned_by: "llamanet"
      })
    }
    return {
      object: "list",
      data: items
    }
  } catch (e) {
    return {
      object: "list",
      data: []
    }
  }
}
const exists = async path => !!(await fs.promises.stat(path).catch(e => false));
const checkpoint = async (repo, file, cb) => {

  const modeldir = path.resolve(homedir, "models", "huggingface", repo)


  // Don't proceed if LLAMANET_OFFLINE is set to true
  if (process.env.LLAMANET_OFFLINE) {
    return
  }

  // check if the file exists
  const checkpoint_path = path.resolve(modeldir, file)
  let checkpoint_exists = await exists(checkpoint_path)

  if (checkpoint_exists) {
    // the file exists => don't try to download
    return
  }

  const url = `https://huggingface.co/${repo}/resolve/main/${file}?download=true`
  const userAgent = randomUseragent.getRandom((ua) => {
    return ua.browserName === 'Chrome';
  });


  // create model folder if it doesn't exist
  await fs.promises.mkdir(modeldir, { recursive: true }).catch((e) => { })


  const dl = new DownloaderHelper(url, modeldir, {
    headers: { "user-agent": userAgent, },
    override: {
      skip: true,
      skipSmaller: false,
    },
    fileName: file,
    resumeIfFileExists: true,
    removeOnStop: false,
    removeOnFail: false,
    retry: { maxRetries: 10, delay: 5000 },
  })
  await util.logLine(`Synchronizing ${file}`)
  let res = await new Promise((resolve, reject) => {
    dl.on('end', async () => {
      await util.logLine('Download Completed');
      resolve()
    })
    dl.on('error', async (err) => {
      await util.logLine('Download Error: ' + err.stack)
      reject(err)
    })
    dl.on('progress', async (stats) => {
      let p = Math.floor(stats.progress)
      let str = ""
//      let str = `Downloading ${file} `
      for(let i=0; i<p; i++) {
        str += "█"
      }
      for(let i=p; i<100; i++) {
        str += "░"
      }
      await util.log(`\r${str}`)
    })
    dl.on('download', (downloadInfo) => {
      cb({ data: Buffer.from(`downloading ${file}...\n`), type: null })
      const msg = `\r\n[Download Started] ${JSON.stringify({ name: downloadInfo.fileName, total: downloadInfo.totalSize })}\r\n`
    })
    dl.on('skip', (skipInfo) => {
      const msg = `\r\n[Download Skipped] File already exists: ${JSON.stringify(skipInfo)}\r\n`
      resolve()
    })
    dl.on('retry', (attempt, opts, err) => {
      const msg = "\r\n[Retrying] " + JSON.stringify({
        RetryAttempt: `${attempt}/${opts.maxRetries}`,
        StartsOn: `${opts.delay / 1000} secs`,
        Reason: err ? err.message : 'unknown'
      }) + "\r\n";
    })
    dl.on('stateChanged', (state) => {
      const msg = "\r\n[State changed] " + state + "\r\n"
    })
    dl.on('redirected', (newUrl, oldUrl) => {
      const msg = `\r\n[Redirected] '${oldUrl}' => '${newUrl}'\r\n`
    })

    dl.start().catch((err) => {
      reject(err)
    })
  })
}
const download = async () => {

  // check if llamacpp already downloaded. if downloaded, return immediately
  const zippath = path.resolve(homedir, "llamacpp.zip")

  // don't proceed if LLAMANET_OFFLINE is set to true
  if (process.env.LLAMANET_OFFLINE) {
    return
  }

  // don't proceed if the zip file exists already
  let downloaded = await exists(zippath)
  if (downloaded) {
    return
  }

  // download and unzip llamacpp if not yet 
  const release = await Releases()
  if (!release) {
    await util.logLine("no valid release")
    return
  }
  const url = release.url
  const userAgent = randomUseragent.getRandom((ua) => {
    return ua.browserName === 'Chrome';
  });
  const dl = new DownloaderHelper(url, homedir, {
    headers: { "user-agent": userAgent, },
    override: {
      skip: true,
      skipSmaller: false,
    },
    fileName: "llamacpp.zip",
    resumeIfFileExists: true,
    removeOnStop: false,
    removeOnFail: false,
    retry: { maxRetries: 10, delay: 5000 },
  })
  await util.logLine("Downloading llama.cpp")
  let res = await new Promise((resolve, reject) => {
    dl.on('end', async () => {
      await util.logLine(' Download Completed');
      resolve()
    })
    dl.on('error', async (err) => {
      await util.logLine('Download Error: ' + err.stack)
      reject(err)
    })
    dl.on('progress', async (stats) => {
      let p = Math.floor(stats.progress)
      let str = ""
      for(let i=0; i<p; i++) {
        str += "█"
      }
      for(let i=p; i<100; i++) {
        str += "░"
      }
      await util.log(`\r${str}`)
    })
    dl.on('download', (downloadInfo) => {
      const msg = `\r\n[Download Started] ${JSON.stringify({ name: downloadInfo.fileName, total: downloadInfo.totalSize })}\r\n`
    })
    dl.on('skip', (skipInfo) => {
      const msg = `\r\n[Download Skipped] File already exists: ${JSON.stringify(skipInfo)}\r\n`
      resolve()
    })
    dl.on('retry', (attempt, opts, err) => {
      const msg = "\r\n[Retrying] " + JSON.stringify({
        RetryAttempt: `${attempt}/${opts.maxRetries}`,
        StartsOn: `${opts.delay / 1000} secs`,
        Reason: err ? err.message : 'unknown'
      }) + "\r\n";
    })
    dl.on('stateChanged', (state) => {
      const msg = "\r\n[State changed] " + state + "\r\n"
    })
    dl.on('redirected', (newUrl, oldUrl) => {
      const msg = `\r\n[Redirected] '${oldUrl}' => '${newUrl}'\r\n`
    })

    dl.start().catch((err) => {
      reject(err)
    })
  })
  await decompress(path.resolve(homedir, "llamacpp.zip"), homedir)
//  await fs.promises.rm(path.resolve(homedir, "llamacpp.zip"))
}
module.exports = { server, models, download, checkpoint }
