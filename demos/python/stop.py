from openai import OpenAI
import llamanet
llamanet.run()
client = OpenAI()
status1 = llamanet.run(["status"])
print(f"status1={status1}")

# start server
llamanet.run([
  "start",
  "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf",
])

# print status again
status2 = llamanet.run(["status"])
print(f"status2={status2}")

# stop the llama server
llamanet.run([
  "stop",
  "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf",
])

# print status again
status3 = llamanet.run(["status"])
print(f"status3={status3}")
