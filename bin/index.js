#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const run = require("../index")
const argv = yargs(hideBin(process.argv)).parse();
(async () => {
  const response = await run(argv)
  if (response && Object.keys(response).length > 0) {
    console.log(JSON.stringify(response, null, 2))
  }

  if (argv._.length > 0) {
    const persistent = [ 'on', 'start' ]
    if (!persistent.includes(argv._[0])) {
      process.exit()
    }
  } else {
    // npx llamanet (without arguments) => just start the server => so keep it running
  }
})();
