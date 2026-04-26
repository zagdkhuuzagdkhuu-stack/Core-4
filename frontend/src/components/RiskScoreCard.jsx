import React from "react";

function RiskScoreCard({ score = 0 }) {
  return (
    <section className="panel risk-card">
      <span className="muted">Risk score</span>
      <strong>{score}</strong>
    </section>
  );
}

export default RiskScoreCard;
