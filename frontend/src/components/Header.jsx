import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/applications", label: "Applications" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`glass-header fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? "py-3" : "py-5"}`} data-testid="site-header">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3 group">
          <div className="w-9 h-9 border border-[#D4AF37] flex items-center justify-center">
            <span className="font-serif text-[#D4AF37] text-lg leading-none">L</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-lg tracking-wide text-[#F8F8F6]">Lalu Clading</span>
            <span className="eyebrow text-[0.6rem] tracking-[0.35em]">ARCHITECTURAL SKINS</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} data-testid={`nav-${n.label.toLowerCase()}`}
              className={({ isActive }) => `text-sm tracking-wide transition-colors ${isActive ? "text-[#D4AF37]" : "text-[#F8F8F6] hover:text-[#D4AF37]"}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="https://wa.me/918088791219?text=Hello%20Lalu%20Clading" target="_blank" rel="noreferrer"
             data-testid="header-whatsapp" className="w-10 h-10 border border-[#D4AF37]/40 hover:border-[#D4AF37] flex items-center justify-center transition-colors group">
            <MessageCircle size={16} className="text-[#D4AF37] group-hover:scale-110 transition-transform" />
          </a>
          <button className="lg:hidden text-[#F8F8F6]" onClick={() => setOpen(!open)} data-testid="mobile-menu-btn">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 mt-3 pt-3 px-6 pb-5 bg-[#0B0C0E]" data-testid="mobile-menu">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)}
              className="block py-3 text-[#F8F8F6] border-b border-white/5 last:border-0">
              {n.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
