import { Link } from "react-router-dom";
import { Phone, Mail, MessageCircle, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0B0C0E] border-t border-white/10 pt-20 pb-8 relative overflow-hidden" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-4 gap-12">
        <div className="lg:col-span-2">
          <div className="font-serif text-5xl lg:text-6xl text-[#F8F8F6] leading-[0.95] mb-4">
            Lalu<br/><span className="text-[#D4AF37]">Clading</span>
          </div>
          <p className="text-[#9E9E98] max-w-md text-sm leading-relaxed">
            Architectural Skins of Distinction. Bespoke facade & interior surface systems for luxury residences,
            corporate envelopes and boutique hospitality across India.
          </p>
        </div>
        <div>
          <div className="eyebrow mb-5">Explore</div>
          <ul className="space-y-3 text-sm text-[#F8F8F6]">
            <li><Link to="/products" className="hover:text-[#D4AF37]">Products</Link></li>
            <li><Link to="/applications" className="hover:text-[#D4AF37]">Applications</Link></li>
            <li><Link to="/projects" className="hover:text-[#D4AF37]">Projects</Link></li>
            <li><Link to="/about" className="hover:text-[#D4AF37]">About</Link></li>
            <li><Link to="/contact" className="hover:text-[#D4AF37]">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-5">Direct Channels</div>
          <ul className="space-y-3 text-sm text-[#F8F8F6]">
            <li><a href="tel:8088791219" className="flex items-center gap-3 hover:text-[#D4AF37]"><Phone size={14} /> 8088791219</a></li>
            <li><a href="https://wa.me/918088791219" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#D4AF37]"><MessageCircle size={14} /> WhatsApp</a></li>
            <li><a href="mailto:laluclading45@gmail.com" className="flex items-center gap-3 hover:text-[#D4AF37]"><Mail size={14} /> laluclading45@gmail.com</a></li>
            <li><a href="https://laluclading.com" className="flex items-center gap-3 hover:text-[#D4AF37]"><Globe size={14} /> laluclading.com</a></li>
          </ul>
        </div>
      </div>
      <div className="divider-gold mt-16 mx-6 lg:mx-10" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-6 flex flex-col md:flex-row justify-between gap-3">
        <div className="text-xs text-[#9E9E98] font-mono tracking-widest">© {new Date().getFullYear()} LALU CLADING — ALL RIGHTS RESERVED</div>
        <Link to="/admin/login" className="text-xs text-[#9E9E98] hover:text-[#D4AF37] font-mono tracking-widest" data-testid="admin-link">ADMIN</Link>
      </div>
    </footer>
  );
}
