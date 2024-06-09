const OpenAI = require('openai')
const llamanet = require("../../index");
(async () => {

  // 1. print status
  let status = await llamanet.run(["status"])
  console.log("status", status)

  // 2. start llamacpp 1
  await llamanet.run([
    "start",
//    "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf",
//    "--verbose"
  ])

  const openai = new OpenAI()
  console.log("make request")
  const stream = await openai.chat.completions.create({
    model: "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf",
    messages: [{ role: 'user', content: "What is the meaning of life?" }],
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }


})();
