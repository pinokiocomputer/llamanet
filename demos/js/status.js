const llamanet = require("../../index");
(async () => {
  let status = await llamanet.run(["status"])
  console.log(status)
})();
