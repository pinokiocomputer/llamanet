const llamacpp = require('./llamacpp')
const Server = require('./server')

// START
// $ npx llamanet start local Phi-3-mini-4k-instruct-fp16.gguf
// $ npx llamanet start huggingface microsoft/Phi-3-mini-4k-instruct-gguf Phi-3-mini-4k-instruct-fp16.gguf
//
// STOP
// $ npx llamanet stop local Phi-3-mini-4k-instruct-fp16.gguf
//
// STATUS
// $ npx llamanet status
//
// VIEW MODELS
// $ npx llamanet models

module.exports = async (argv) => {

  process.env.OPENAI_BASE_URL = "http://localhost:42424/v1"
  process.env.OPENAI_API_KEY = "llamanet"

  // 1. download llamacpp if it doesn't exist
  await llamacpp.download()

  // 2. start the llamanet web server if it's not started yet
  const server = new Server()
  await server.start()

  // 3. Call the command

  if (argv && argv._ && argv._.length > 0) {
    const response = await server.call(argv)
    return response
  }
}
