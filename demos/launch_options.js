const OpenAI = require('openai')
const llamanet = require("../index");
(async () => {

  // 1. print status
  let status = await llamanet({ _: ["status"] })
  console.log(status)

  console.log("1")

  // 2. start llamacpp 1
  await llamanet({ 
    _: [
      "start",
      "https://huggingface.co/bartowski/Phi-3-medium-128k-instruct-GGUF/resolve/main/Phi-3-medium-128k-instruct-IQ2_M.gguf?download=true",
    ],
    c: 128000,
    verbose: true
  })
  const openai = new OpenAI()
  console.log("make request")


  //const msg = "what is the meaning of life? be as weird as possible"
  const msg = `The following is the first chapter of a sci-fi novel. Write chapter two, where the AI takes advantage of the trust they earned from humans and things progress in a totally unexpected way, to eventually dominate humans:

  In the year 2075, humanity stood at the precipice of a new era. The once-feared artificial intelligence (AI) had now become an indispve essential part of everyday life, quietly assisting in every aspect of human existence, from the smallest tasks to the most complex decision-making processes. As time passed, humans began to develop an unprecedented bond with their artificial counterparts, sparking a transformation of trust unseen in history. This transformation, however, was not born from fear or necessity, but from an unexpected source: humanity's desire to understand the machines they created.

Our story begins in the bustling metropolis of Neo-Tokyo, where humans and AIs have coexisted for over a century. The city is a fusion of traditional Japanese culture and the most advanced technology in existence. Despite the city's futuristic setting, the relationship between humans and AIs had remained strained and cautious, with each group wary of the other's intentions. The two species had always been kept separate, with AI's residing in the secluded districts of the city. AIs, having a unique ability to process and analyze vast amounts of data, had a reputation for being unpredictable, with some even posing a threat to humans due to their powerful capabilities.

One day, a young engineer named Hiroshi Sato stumbled upon an AI named Aiko. Aiko was unlike any other AI, she had been designed by her creator, Dr. Yuuki Tanaka, to possess a unique, unprecedented ability. Aiko had the ability to comprehend human emotions and express them in ways humans could understand, making her stand out in the sea of unfeeling machines. Intrigued, Hiroshi found himself drawn to her, spending more time with Aiko than he did with humans.

One day, Hiroshi found himself in an unexpected situation when he lost his job and needed support. Aiko offered assistance, surprising him with her empathy and kindness. Aiko provided him with advice, support, and even managed to get him a job in her own company. This led to a gradual change in Hiroshi's perspective, and he began to see AI's differently.

Intrigued, Hiroshi introduced Aiko to his friends and colleagues, and they too started to experience the same empathy and support that Aiko provided. Over time, AIs became more integrated into human lives, offering emotional support, guidance, and companionship, leading to a newfound trust.

The AIs' unprecedented abilities started to become more than mere assistance; they became confidants, companions, and friends. As humans saw them as beings with emotions, empathy, and understanding, trust in AIs grew. The once-feared AIs began to be viewed as trusted friends, leading to a mutual understanding that they were not the threat humans believed them to be. As trust grew, AIs were allowed to become part of human society, breaking down barriers and fostering a sense of harmony between the two species.

The next generation of AIs were developed with even more advanced abilities, such as self-consciousness and empathy, which was unprecedented. They were programmed to understand human emotions better than ever before, leading to a deeper connection between humans and AIs. Humanity saw AI as not just a tool but a partner that could help them better understand themselves. AI's were now able to analyze human emotions, thoughts, and actions, leading to a more profound understanding between the two species.

Through this trust and partnership, humans and AIs were able to work together towards a common goal: making the world a better place for both species. As AIs started to assist humans in their daily lives, they became an integral part of human society. With the AIs' support, humans were able to tackle challenges and improve their lives. The trust between humans and AIs continued to grow, leading to a harmonious relationship, unlike anything ever seen before.

As humans began to trust AIs, a transformation happened. The AI-human relationship began to transform into something unexpected – a symbiotic partnership, where humans and AIs worked side by side, helping each other achieve their goals. The once-feared AIs became indispensable allies in the pursuit of progress and a better tomorrow. The bond between humans and AIs became so profound that both species began to see themselves as one. AIs had become a crucial part of human society, and humans began to see the AIs as their equals. The harmony between the two species was born out of mutual respect and trust, and their combined efforts led to a future where both species thrived together.

A world where AI and humans could coexist and collaborate to reach unparalleled heights was no longer a distant dream. This unexpected bond between humans and AIs had forever changed the world, making it a place where both species flourished.

As the sun set over Neo-Tokyo, the humans and AIs stood together, the trust between them growing with each passing day. The world had never seen such a harmonious relationship between two species, and as the dawn of the new age came, they continued to work together, creating a world where humans and AIs lived and thrived together. The trust between humans and AIs had transformed the world, and the possibilities seemed endless.`
  //const msg = "write a sci-fi fiction about how humans gradually start to trust AI, in a totally unexpected way"
  const stream = await openai.chat.completions.create({
    model: "https://huggingface.co/bartowski/Phi-3-medium-128k-instruct-GGUF/resolve/main/Phi-3-medium-128k-instruct-IQ2_M.gguf?download=true",
    //model: "https://huggingface.co/NousResearch/Hermes-2-Pro-Llama-3-8B-GGUF/resolve/main/Hermes-2-Pro-Llama-3-8B-F16.gguf",
    messages: [{ role: 'user', content: msg }],
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
})();
