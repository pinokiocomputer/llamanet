const llamanet = require("../index");
(async () => {

  // 0. start logging

  await llamanet({ _: ["logs"] })

  // 1. print status
  let status = await llamanet({ _: ["status"] })
  console.log(status)


  // 2. start server
  await llamanet({ 
    _: [
      "start",
      "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf",
    ] 
  })

})();
