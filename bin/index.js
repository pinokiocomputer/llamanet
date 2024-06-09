#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const llamanet = require("../index")
const argv = yargs(hideBin(process.argv)).parse();
(async () => {
  const response = await llamanet.run(argv)
  if (response && Object.keys(response).length > 0) {
    console.log(JSON.stringify(response, null, 2))
  }

  // when running in command mode, need to exit the process
  if (argv._.length > 0) {
    // if 'on' => keep running
    // if 'start' => keep running
    // otherwise => stop
    let command = argv._[0]
    if (command === 'on') {
      // don't exit
    } else if (command === 'start') {
      // don't exit
    } else {
      // all other commands should exit after running in terminal since they are one off actions
      process.exit()
    }
  } else {
    // don't exit
  }
})();
