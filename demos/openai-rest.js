const OpenAI = require('openai')
const llamanet = require("../index")
const msg = `what is the meaning of life? be brief`
async function main() {
  await llamanet()
  console.log("process.env", process.env)
  const openai = new OpenAI({ apiKey: 'sk', });
  const response = await openai.chat.completions.create({
    //model: "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf",
    model: "https://huggingface.co/NousResearch/Hermes-2-Pro-Llama-3-8B-GGUF/resolve/main/Hermes-2-Pro-Llama-3-8B-F16.gguf",
    messages: [{ role: 'user', content: msg }],
  });
  console.log(JSON.stringify(response, null, 2))
}
main();
