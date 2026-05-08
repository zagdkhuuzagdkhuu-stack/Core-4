import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <Link className="brand" to="/">
        AI гэрээний автоматжуулалт
      </Link>
      <nav className="nav-links">
        <Link to="/">Нүүр</Link>
        <Link to="/contracts/create">Үүсгэх</Link>
        <Link to="/login">Нэвтрэх</Link>
      </nav>
    </header>
  );
}

export default Navbar;
