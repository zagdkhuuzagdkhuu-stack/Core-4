import React from "react";

function Register() {
  return (
    <section className="page">
      <h1>Register</h1>
      <form className="form panel">
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button className="button" type="submit">
          Create account
        </button>
      </form>
    </section>
  );
}

export default Register;
