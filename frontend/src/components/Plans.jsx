import React from "react";
import "../css/Plans.css";

const Plans = () => (
  <main className="plans-modern">
    {/* Hero Section */}
    <section className="plans-hero-section">
      <div className="plans-hero-content">
        <div className="plans-hero-badge">🚀 Coming Soon</div>
        <h1 className="plans-hero-title">
          <span className="text-gradient">Support & Donations</span>
        </h1>
        <p className="plans-hero-desc">
          We believe in open access to public data. All features are currently free for everyone.<br/>
          In the future, we plan to introduce a simple, transparent way to support the project via donations.
        </p>
      </div>
    </section>
    {/* Plans/Donation Section */}
    <section className="plans-section">
      <div className="plans-container">
        <div className="plans-card">
          <div className="plans-card-title">Future Plans</div>
          <div className="plans-card-desc">
            <p>
              We are exploring options to add a donation feature, so anyone who finds this platform useful can help support its development and hosting costs.
            </p>
            <p>
              <strong>All features will remain free</strong> and accessible to everyone. Donations will be entirely optional and used to improve the platform.
            </p>
            <p>
              If you have suggestions for donation methods (PayPal, Stripe, crypto, etc.), feel free to <a href="mailto:contact@dataplatform.com" style={{color:'var(--primary)'}}>contact us</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default Plans;