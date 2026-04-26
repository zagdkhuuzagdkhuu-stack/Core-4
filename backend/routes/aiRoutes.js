const router = require("express").Router();
const aiController = require("../controllers/aiController");

router.post("/analyze/:contractId", aiController.analyzeContract);
router.get("/analysis/:contractId", aiController.getAnalysis);

module.exports = router;
