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
      const apiBase = import.meta.env.VITE_API_BASE || '';
      const res = await fetch(`${apiBase}/api/suggestions`, {
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
    <main className="faq-modern">
      {/* Hero Section */}
      <section className="faq-hero-section">
        <div className="faq-hero-content">
          <div className="faq-hero-badge">❓ FAQ</div>
          <h1 className="faq-hero-title">
            <span className="text-gradient">Frequently Asked</span> <span className="faq-title-white">Questions</span>
          </h1>
          <p className="faq-hero-desc">
            Find answers to common questions and send suggestions to help us improve the platform.
          </p>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="faq-section">
        <div className="faq-questions-container">
          <div className="faq-grid">
            <div className="faq-card faq-card--faq1">
              <div className="faq-card-title">Is the platform free?</div>
              <div className="faq-card-desc">Yes, all features are free and accessible to everyone. In the future, we may add optional donation options to support development.</div>
            </div>
            <div className="faq-card faq-card--faq2">
              <div className="faq-card-title">Where does the data come from?</div>
              <div className="faq-card-desc">Most data is sourced from reputable public sources such as the World Bank, Eurostat, and national statistics agencies. Data sources are always cited on each chart or dashboard.</div>
            </div>
            <div className="faq-card faq-card--faq3">
              <div className="faq-card-title">Can I use the charts in my own work?</div>
              <div className="faq-card-desc">Yes! You can export charts as images or CSV and use them in presentations, reports, or educational materials. Please credit the platform and the original data source.</div>
            </div>
            <div className="faq-card faq-card--faq4">
              <div className="faq-card-title">How can I suggest a new feature or dataset?</div>
              <div className="faq-card-desc">You can send suggestions using the form below. We welcome feedback and ideas for new features, datasets, or improvements!</div>
            </div>
          </div>
          {/* Suggestion Section - under grid, but in same container */}
          <div className="faq-suggest-section">
            <div className="faq-suggest-card">
              <div className="faq-card-title">Send a suggestion</div>
              {!isAuthenticated ? (
                <div className="faq-card-desc faq-error">
                  You must be logged in to send a suggestion.
                </div>
              ) : (
                <form className="faq-suggestion-form" onSubmit={handleSubmit} autoComplete="off">
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Your suggestion..."
                    minLength={5}
                    maxLength={500}
                    required
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send"}
                  </button>
                  {error && <div className="faq-status faq-error">{error}</div>}
                  {success && <div className="faq-status faq-success">{success}</div>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default FAQ;