const llamanet = require("../index");
(async () => {

  // 1. print status
  let status = await llamanet({ _: ["status"] })
  console.log(status)

  // 2. start llamacpp 1
  await llamanet({ 
    _: [
      "start",
      "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf",
    ] 
  })

  // 3. print status again
  let status2 = await llamanet({ _: ["status"] })
  console.log(status2)


  // 4. start llamacpp 2
  await llamanet({ 
    _: [
      "start",
      "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf",
    ] 
  })

  // 5. print status again
  let status3 = await llamanet({ _: ["status"] })
  console.log("status3", status3)


  // 6. stop all llamacpp servers
  await llamanet({
    _: [
      "stop",
    ]
  })

  // 7. print status again
  let status4 = await llamanet({ _: ["status"] })
  console.log("status4", status4)

})();
