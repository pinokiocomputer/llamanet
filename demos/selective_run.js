require('dotenv').config();
const OpenAI = require('openai')
const llamanet = require("../index");
(async () => {
  // triggered if: 
  // LLAMANET=true node selective_run
  let model = "gpt-4o"
  if (process.env.LLAMANET) {
    await llamanet()
    model = "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf"
  }
  const msg = `what is the meaning of life? be brief`
  const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY
  })
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: msg }],
  });
  console.log(JSON.stringify(response, null, 2))


/*
EXAMPLE RESPONSES

- gpt-4o (using OpenAI API)

{
  "id": "chatcmpl-9V2c6k19SKtKNCk0TYuFNaGjVsux9",
  "object": "chat.completion",
  "created": 1717179086,
  "model": "gpt-4o-2024-05-13",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The meaning of life is a philosophical question that varies among individuals and cultures. It often involves the pursuit of happiness, fulfillment, and purpose, with answers ranging from religious beliefs to personal achievements and contributions to society. Ultimately, it is a subjective concept that each person must define for themselves."
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 16,
    "completion_tokens": 57,
    "total_tokens": 73
  },
  "system_fingerprint": "fp_329be3768e"
}

- Phi-3-mini-4k-instruct-fp16.gguf (Using local llamanet)

{
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": " The meaning of life is a deeply philosophical question and can vary greatly depending on cultural, religious, and individual beliefs. Some may find it through personal fulfillment, relationships, or the pursuit of knowledge and happiness. Others see it through spiritual or existential lenses, believing it to be about realizing a higher purpose or making a lasting impact. Ultimately, the meaning of life is subjective and can be unique to each person.<|end|>",
        "role": "assistant"
      }
    }
  ],
  "created": 1717188912,
  "model": "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf",
  "object": "chat.completion",
  "usage": {
    "completion_tokens": 95,
    "prompt_tokens": 13,
    "total_tokens": 108
  },
  "id": "chatcmpl-TRSdp2WE3oWkqiTFbbLwmGD2Enh9OBTt"
}
*/


})();
