import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateContract from "./pages/CreateContract";
import UploadContract from "./pages/UploadContract";
import ContractDetails from "./pages/ContractDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/contracts/create" element={<CreateContract />} />
      <Route path="/contracts/upload" element={<UploadContract />} />
      <Route path="/contracts/:id" element={<ContractDetails />} />
      <Route path="/contracts/:id/analysis" element={<ContractDetails />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
