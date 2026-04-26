import React from "react";

function Login() {
  return (
    <section className="page">
      <h1>Login</h1>
      <form className="form panel">
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button className="button" type="submit">
          Login
        </button>
      </form>
    </section>
  );
}

export default Login;
