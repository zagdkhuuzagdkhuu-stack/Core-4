import React from "react";

function RiskScoreCard({ score = 0 }) {
  return (
    <section className="panel risk-card">
      <span className="muted">Эрсдэлийн оноо</span>
      <strong>{score}</strong>
    </section>
  );
}

export default RiskScoreCard;
