const OpenAI = require('openai')
const llamanet = require("../index")
const msg = `what comes after 1 2 3 5 8? give me as many variations as possible with reasons`;
async function main() {
  await llamanet()
  const openai = new OpenAI()
  const stream = await openai.chat.completions.create({
    //model: "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf",
    model: "https://huggingface.co/NousResearch/Hermes-2-Pro-Llama-3-8B-GGUF/resolve/main/Hermes-2-Pro-Llama-3-8B-F16.gguf",
    messages: [{ role: 'user', content: msg }],
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}
main();
