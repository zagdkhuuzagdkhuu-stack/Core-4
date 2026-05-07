import React from "react";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton.jsx";

function Landing() {
  return (
    <section className="page">
      <BackButton />
      <div className="panel">
        <h1>AI Contract Automation</h1>
        <p className="muted">Create, review, analyze, and manage contracts from one workspace.</p>
        <Link className="button" to="/">
          Go to homepage
        </Link>
      </div>
    </section>
  );
}

export default Landing;
