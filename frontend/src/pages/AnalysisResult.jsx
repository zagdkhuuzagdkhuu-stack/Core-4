import React from "react";
import { useParams } from "react-router-dom";
import RiskScoreCard from "../components/RiskScoreCard.jsx";

function AnalysisResult() {
  const { id } = useParams();

  return (
    <section className="page">
      <h1>Analysis Result</h1>
      <div className="grid">
        <RiskScoreCard score={72} />
        <section className="panel">
          <h3>Contract #{id}</h3>
          <p className="muted">Review termination, liability, and renewal clauses before approval.</p>
        </section>
      </div>
    </section>
  );
}

export default AnalysisResult;
