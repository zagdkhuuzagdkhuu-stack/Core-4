import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="panel sidebar">
      <Link to="/">Гэрээнүүд</Link>
      <Link to="/contracts/create">Шинэ гэрээ</Link>
      <Link to="/contracts/1/analysis">Шинжилгээ</Link>
    </aside>
  );
}

export default Sidebar;
