import { useState } from "react";
import { Send } from "lucide-react";
import { useFadeUp } from "@/hooks/useFadeUp";

export default function Contact() {
  const leftRef = useFadeUp<HTMLDivElement>();
  const formRef = useFadeUp<HTMLDivElement>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submitForm() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setStatus("sending");

    try {
      const res = await fetch("https://formspree.io/f/mdalqgkv", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus("sent");
      } else {
        setError(
          "Something went wrong. Please try again or email jacquesblaguerre@gmail.com directly.",
        );
        setStatus("idle");
      }
    } catch {
      setError(
        "Network error. Please try again or email jacquesblaguerre@gmail.com directly.",
      );
      setStatus("idle");
    }
  }

  return (
    <section id="contact">
      <div className="section-inner">
        <div className="contact-left fade-up" ref={leftRef}>
          <div className="section-label">Get In Touch</div>
          <h2 className="section-title">Let's build something great</h2>
          <p className="contact-tagline">
            Have a project in mind or a question? My inbox is always open.
          </p>
        </div>

        <div className="fade-up" ref={formRef}>
          {status !== "sent" ? (
            <div className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  placeholder="Tell me about your project..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              {error && (
                <p style={{ color: "#e5484d", fontSize: "0.85rem" }}>{error}</p>
              )}
              <button
                className="form-submit"
                disabled={status === "sending"}
                onClick={submitForm}
              >
                <span>{status === "sending" ? "Sending…" : "Send Message"}</span>
                <Send size={16} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <div className="form-success show">
              <div className="form-success-icon">✦</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>
                Message received!
              </h3>
              <p>Thanks for reaching out. I'll get back to you as soon as possible.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
