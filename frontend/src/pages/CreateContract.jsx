import React from "react";

function CreateContract() {
  return (
    <section className="page">
      <h1>Create Contract</h1>
      <form className="form panel">
        <input type="text" placeholder="Contract title" />
        <textarea rows="10" placeholder="Contract content" />
        <button className="button" type="submit">
          Save contract
        </button>
      </form>
    </section>
  );
}

export default CreateContract;
