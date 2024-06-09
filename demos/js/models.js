const llamanet = require("../../index");
(async () => {
  const models = await llamanet.run(["models"])
  console.log("models", JSON.stringify(models, null, 2))
})();
