import { Scale, Globe, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Scale className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-foreground">
                Legal Shathi
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your trusted platform for legal document templates in Bangladesh. Simple, reliable, and accessible.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-foreground">
              Company
            </h4>
            <ul className="flex flex-col gap-2">
              {["About Us", "Legal Experts", "Pricing", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-foreground">
              Legal
            </h4>
            <ul className="flex flex-col gap-2">
              {["Terms of Service", "Privacy Policy", "Disclaimer", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-foreground">
              Support
            </h4>
            <ul className="flex flex-col gap-2">
              {["Help Center", "FAQs", "Community", "Feedback"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2024 Legal Shathi. All rights reserved.
          </p>
          <div className="flex gap-3">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground">
              <Globe className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground">
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
