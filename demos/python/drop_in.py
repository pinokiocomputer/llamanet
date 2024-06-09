from openai import OpenAI
import llamanet
llamanet.run()
client = OpenAI()
stream = client.chat.completions.create(
  model="gpt-3.5-turbo",
  messages=[{"role": "user", "content": "What is the meaning of life?"}],
  stream=True,
)
for chunk in stream:
  if chunk.choices[0].delta.content is not None:
    print(chunk.choices[0].delta.content, end="")
