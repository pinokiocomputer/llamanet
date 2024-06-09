import llamanet
import requests
llamanet.run()
url = 'http://localhost:42424/v1/chat/completions';
response = requests.post(url, json= {
  "model": "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-fp16.gguf",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ]
})
data = response.json()
print(data)
