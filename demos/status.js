const llamanet = require("../index");
(async () => {
  let status = await llamanet({ _: ["status"] })
  console.log(status)
})();
