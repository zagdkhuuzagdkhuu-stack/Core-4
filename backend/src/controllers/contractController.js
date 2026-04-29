const db = require("../db");

async function listContracts(req, res, next) {
  try {
    const result = await db.query("SELECT * FROM contracts ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function createContract(req, res, next) {
  try {
    const { userId, title, content, status } = req.body;
    const result = await db.query(
      `INSERT INTO contracts (user_id, title, content, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title, content, status || "draft"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function uploadContract(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(201).json({
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
  } catch (error) {
    next(error);
  }
}

async function getContract(req, res, next) {
  try {
    const result = await db.query("SELECT * FROM contracts WHERE id = $1", [req.params.id]);

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Contract not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function updateContract(req, res, next) {
  try {
    const { title, content, status } = req.body;
    const result = await db.query(
      `UPDATE contracts
       SET title = COALESCE($2, title),
           content = COALESCE($3, content),
           status = COALESCE($4, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [req.params.id, title, content, status]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Contract not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteContract(req, res, next) {
  try {
    await db.query("DELETE FROM contracts WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listContracts,
  createContract,
  uploadContract,
  getContract,
  updateContract,
  deleteContract
};
