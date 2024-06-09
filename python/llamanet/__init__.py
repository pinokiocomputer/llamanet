# import llamanet
# llamanet.run()
# llamanet.run(["start", HUGGINGFACE_URL, "-c", 128000, "--verbose"])
# ...
import atexit
import subprocess
import time
import requests
import sys
import os
import signal
def run(*args):
  cmd = None
  if len(args) > 0:
    args_array = args[0]
    if len(args_array) > 0:
      cmd = args_array[0]
    else:
      cmd = None
  else:
    args_array = []

  if cmd == "on" or cmd == None:
    a = ['npx', '-y', 'llamanet@latest'] + args_array
    process = subprocess.Popen(a, stdout=sys.stdout, stderr=sys.stderr)
    while True:
      try:
        response = requests.get('http://localhost:42424')
        if response.status_code == 200:
          break
      except requests.ConnectionError:
        pass
      time.sleep(1)
    # set environment variables
    os.environ['OPENAI_BASE_URL'] = "http://localhost:42424/v1"
    os.environ['OPENAI_API_KEY'] = "llamanet"
    # Register cleanup function to be called when the script exits
    def cleanup():
      os.killpg(os.getpgid(process.pid), signal.SIGTERM)
    atexit.register(cleanup)
  elif cmd == "start":
    resp = requests.post('http://localhost:42424/call', json=args_array)
    data = resp.json() # Check the JSON Response Content documentation below
    return data['response']
  elif cmd == "off":
    resp = requests.post('http://localhost:42424/call', json=args_array)
  elif cmd == "stop":
    resp = requests.post('http://localhost:42424/call', json=args_array)
  elif cmd == "status":
    resp = requests.get(url="http://localhost:42424/query/status")
    data = resp.json() # Check the JSON Response Content documentation below
    return data['response']
  elif cmd == "models":
    resp = requests.get(url="http://localhost:42424/query/models")
    data = resp.json() # Check the JSON Response Content documentation below
    return data['response']
