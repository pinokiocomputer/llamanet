// Demonstrate the instant drop-in replacement in action
const OpenAI = require('openai')
const llamanet = require("../../index");
const msg = `what comes after 1 2 3 5 8? give me as many variations as possible with reasons`;
async function main() {
  await llamanet.run()
  const openai = new OpenAI()

  // even thought the model says 'gpt-4o', since running in llamanet, the request starts the default model first
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: 'user', content: msg }],
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}
main();
