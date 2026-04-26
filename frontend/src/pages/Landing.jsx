import React from "react";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <section className="page">
      <div className="panel">
        <h1>AI Contract Automation</h1>
        <p className="muted">Create, review, analyze, and manage contracts from one workspace.</p>
        <Link className="button" to="/dashboard">
          Go to dashboard
        </Link>
      </div>
    </section>
  );
}

export default Landing;
