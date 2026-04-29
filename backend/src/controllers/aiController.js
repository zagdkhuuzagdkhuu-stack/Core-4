const db = require("../db");

async function analyzeContract(req, res, next) {
  try {
    const { riskScore = 0, summary = "", clauses = [] } = req.body;
    const result = await db.query(
      `INSERT INTO ai_analysis (contract_id, risk_score, summary, clauses)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.contractId, riskScore, summary, JSON.stringify(clauses)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function getAnalysis(req, res, next) {
  try {
    const result = await db.query(
      "SELECT * FROM ai_analysis WHERE contract_id = $1 ORDER BY created_at DESC",
      [req.params.contractId]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeContract,
  getAnalysis
};
