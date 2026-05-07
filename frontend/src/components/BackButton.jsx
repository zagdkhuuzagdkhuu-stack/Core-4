import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  }

  return (
    <button
      type="button"
      className={`back-button ${className}`}
      onClick={goBack}
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeft size={18} />
    </button>
  );
}
