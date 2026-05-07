import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="panel sidebar">
      <Link to="/">Contracts</Link>
      <Link to="/contracts/create">New contract</Link>
      <Link to="/contracts/1/analysis">Analysis</Link>
    </aside>
  );
}

export default Sidebar;
