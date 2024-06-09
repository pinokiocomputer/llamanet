from openai import OpenAI
import llamanet
llamanet.run()
client = OpenAI()
stream = client.chat.completions.create(
  model="https://huggingface.co/NousResearch/Hermes-2-Pro-Llama-3-8B-GGUF/resolve/main/Hermes-2-Pro-Llama-3-8B-F16.gguf",
  messages=[{"role": "user", "content": "What is the meaning of life?"}],
  stream=True,
)
for chunk in stream:
  if chunk.choices[0].delta.content is not None:
    print(chunk.choices[0].delta.content, end="")
