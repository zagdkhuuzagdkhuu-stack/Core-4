import React from "react";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton.jsx";

function Landing() {
  return (
    <section className="page">
      <BackButton />
      <div className="panel">
        <h1>AI гэрээний автоматжуулалт</h1>
        <p className="muted">Гэрээ үүсгэх, хянах, шинжлэх, удирдах ажлаа нэг орчноос.</p>
        <Link className="button" to="/">
          Нүүр хуудас руу очих
        </Link>
      </div>
    </section>
  );
}

export default Landing;
