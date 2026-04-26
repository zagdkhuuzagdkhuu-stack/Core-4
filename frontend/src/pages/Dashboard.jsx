import React from "react";
import ContractCard from "../components/ContractCard.jsx";
import Sidebar from "../components/Sidebar.jsx";

const contracts = [
  { id: 1, title: "Service Agreement", status: "review" },
  { id: 2, title: "NDA", status: "draft" }
];

function Dashboard() {
  return (
    <section className="page">
      <h1>Dashboard</h1>
      <div className="grid">
        <Sidebar />
        {contracts.map((contract) => (
          <ContractCard key={contract.id} contract={contract} />
        ))}
      </div>
    </section>
  );
}

export default Dashboard;
