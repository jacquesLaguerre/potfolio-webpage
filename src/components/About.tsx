import { ArrowUpRight, Instagram } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export default function About() {
  return (
    <section id="about">
      <ContainerScroll>
        <div className="about-card">
          <div className="about-avatar">
            <img src="/images/avatar.jpg" alt="Jacques Laguerre" />
          </div>
          <h2 className="about-name">Jacques Laguerre</h2>
          <p className="about-role">Software Developer</p>
          <p className="about-bio">
            Hey there, I'm passionate about creating and maintaining
            software. I've had the opportunity to help and assist several
            individuals with different backgrounds for their tech needs
            which gives me the flexibility to work with anyone. I hope I can
            do the same for you.
          </p>

          <div className="about-socials">
            <a
              href="https://www.instagram.com/jacques_laguerre/?next=%2F"
              target="_blank"
              rel="noreferrer"
              className="social-btn"
              aria-label="Instagram"
            >
              <Instagram size={18} strokeWidth={1.8} />
            </a>
          </div>

          <a href="#contact" className="contact-btn-small">
            <span>Contact Me</span>
            <ArrowUpRight size={14} strokeWidth={2} />
          </a>
          <a
            href="https://calendar.app.google/JYdbwCmvMPgJodQEA"
            target="_blank"
            rel="noreferrer"
            className="contact-btn-small"
          >
            <span>Book Your Consultation</span>
            <ArrowUpRight size={14} strokeWidth={2} />
          </a>
        </div>
      </ContainerScroll>
    </section>
  );
}
