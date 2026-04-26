const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const contractController = require("../controllers/contractController");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.get("/", contractController.listContracts);
router.post("/", contractController.createContract);
router.post("/upload", upload.single("file"), contractController.uploadContract);
router.get("/:id", contractController.getContract);
router.put("/:id", contractController.updateContract);
router.delete("/:id", contractController.deleteContract);

module.exports = router;
