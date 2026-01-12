import React, { useState } from "react";
import "../css/FAQ.css";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectAccessToken } from "../store/slices/authSlice";

const FAQ = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!text.trim() || text.trim().length < 5) {
      setError("Suggestion must be at least 5 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.errors?.text || data?.message || "Failed to send suggestion.");
        setLoading(false);
        return;
      }
      setSuccess("Thank you for your suggestion!");
      setText("");
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="faq">
      <section className="card">
        <h1>FAQ & Suggestions</h1>
        <p>Here you can find answers to common questions and send suggestions to improve the platform.</p>
      </section>

      <section className="card">
        <h2>Send a suggestion</h2>
        {!isAuthenticated ? (
          <p style={{ color: "var(--color-error)", fontWeight: 500 }}>
            You must be logged in to send a suggestion.
          </p>
        ) : (
          <form className="faq-form" onSubmit={handleSubmit} autoComplete="off">
            <label htmlFor="suggestion">Your suggestion:</label>
            <textarea
              id="suggestion"
              value={text}
              onChange={e => setText(e.target.value)}
              minLength={5}
              maxLength={1000}
              required
              placeholder="Write your suggestion here..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !text.trim() || text.trim().length < 5}>
              {loading ? "Sending..." : "Send suggestion"}
            </button>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
          </form>
        )}
      </section>
    </main>
  );
}

export default FAQ;