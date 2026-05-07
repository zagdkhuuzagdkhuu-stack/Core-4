import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <Link className="brand" to="/">
        AI Contract Automation
      </Link>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/contracts/create">Create</Link>
        <Link to="/login">Login</Link>
      </nav>
    </header>
  );
}

export default Navbar;
