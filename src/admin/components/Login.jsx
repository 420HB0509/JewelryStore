import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import Wordmark from "../../components/Wordmark.jsx";
import { api, setToken } from "../api.js";

export default function Login({ onLoggedIn, notice }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(notice || "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Enter your admin password.");
      return;
    }
    setBusy(true);
    setError("");
    setCode("");
    try {
      const { token } = await api.login(password);
      setToken(token);
      onLoggedIn(token);
    } catch (err) {
      setError(err.message);
      setCode(err.code || "");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit} noValidate>
        <Wordmark />
        <p className="login__title">Control Center</p>
        <p className="login__sub">Manage your products, collections and delivery.</p>

        <label className="field__label" htmlFor="admin-password">
          Admin password
        </label>
        <div className="login__pw">
          <Lock size={17} aria-hidden="true" />
          <input
            id="admin-password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {error && (
          <p className="field__error login__error" role="alert">
            {error}
          </p>
        )}
        {code === "NO_PASSWORD" && (
          <ol className="login__steps">
            <li>Open your project on vercel.com → Settings → Environment Variables.</li>
            <li>
              Add <code>ADMIN_PASSWORD</code> with a strong password (at least 8 characters).
            </li>
            <li>Redeploy the project, then come back here.</li>
          </ol>
        )}

        <button type="submit" className="abtn abtn--primary abtn--block" disabled={busy}>
          {busy ? "Checking…" : "Log in"}
        </button>
        <a className="login__back" href="../">
          ← Back to the store
        </a>
      </form>
    </main>
  );
}
