import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateContract from "./pages/CreateContract.jsx";
import AnalysisResult from "./pages/AnalysisResult.jsx";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contracts/create" element={<CreateContract />} />
          <Route path="/contracts/:id/analysis" element={<AnalysisResult />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
