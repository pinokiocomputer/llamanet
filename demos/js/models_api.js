const llamanet = require("../../index");
const url = 'http://127.0.0.1:42424/v1/models';
(async () => {
  await llamanet.run()
  const result = await fetch(url).then((res) => {
    return res.json()
  })
  console.log(JSON.stringify(result, null, 2))
})();
