import React from "react";
import { Link } from "react-router-dom";

function ContractCard({ contract }) {
  return (
    <article className="panel">
      <h3>{contract.title}</h3>
      <p className="muted">{contract.status || "draft"}</p>
      <Link to={`/contracts/${contract.id}/analysis`}>View analysis</Link>
    </article>
  );
}

export default ContractCard;
