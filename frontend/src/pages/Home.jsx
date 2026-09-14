import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fileUrl } from "../lib/api";
import { ArrowUpRight, ArrowRight, Phone, MessageCircle, Sparkles, Shield, Layers, Ruler } from "lucide-react";

export default function Home() {
  const [slides, setSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [projects, setProjects] = useState([]);
  const [content, setContent] = useState({});
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get("/slides").then(r => r.data),
      api.get("/categories").then(r => r.data),
      api.get("/products?featured=true").then(r => r.data),
      api.get("/projects").then(r => r.data),
      api.get("/content").then(r => r.data),
    ]).then(([s, c, p, pr, ct]) => {
      setSlides(s); setCategories(c); setFeatured(p.slice(0, 6)); setProjects(pr.slice(0, 4)); setContent(ct);
    });
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const currentSlide = slides[idx];

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden grain" data-testid="hero-section">
        {slides.map((s, i) => (
          <div key={s.id} className={`absolute inset-0 transition-opacity duration-[1800ms] ${i === idx ? "opacity-100" : "opacity-0"}`}>
            <img src={fileUrl(s.image_url)} alt={s.heading} className="w-full h-full object-cover scale-in" />
          </div>
        ))}
        <div className="absolute inset-0 hero-vignette" />
        <div className="relative z-10 h-full flex flex-col justify-end pb-24 lg:pb-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full">
            <div className="eyebrow mb-6 fade-up" style={{animationDelay: '0.2s'}}>
              <span className="gold-line" /> SWISS & ITALIAN INSPIRED FACADES
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-8xl text-[#F8F8F6] leading-[0.98] max-w-5xl fade-up" style={{animationDelay: '0.4s'}}>
              {currentSlide?.heading || "Premium Cladding Solutions for Modern Spaces"}
            </h1>
            <p className="mt-8 text-[#F3EAD8]/80 max-w-xl text-base lg:text-lg leading-relaxed fade-up" style={{animationDelay: '0.6s'}}>
              {currentSlide?.subheading || content.hero_subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4 fade-up" style={{animationDelay: '0.8s'}}>
              <Link to="/products" className="btn-gold" data-testid="hero-cta-explore">Explore Products <ArrowRight size={16} /></Link>
              <Link to="/contact" className="btn-ghost" data-testid="hero-cta-contact">Contact Us <ArrowUpRight size={16} /></Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 right-6 lg:right-10 z-10 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`h-[2px] transition-all ${i === idx ? "w-10 bg-[#D4AF37]" : "w-6 bg-white/30"}`} />
          ))}
        </div>
      </section>

      {/* Marquee */}
      <section className="border-y border-white/10 py-6 overflow-hidden bg-[#0B0C0E]">
        <div className="marquee whitespace-nowrap">
          {["HPL COMPACT", "WPC LOUVERS", "RAINSCREEN FACADES", "BRONZE MASHRABIYA", "CNC PERFORATED SCREENS", "10-YEAR FADE WARRANTY", "EN 438 CERTIFIED", "BESPOKE ARCHITECTURAL SKINS"]
            .concat(["HPL COMPACT", "WPC LOUVERS", "RAINSCREEN FACADES", "BRONZE MASHRABIYA", "CNC PERFORATED SCREENS", "10-YEAR FADE WARRANTY", "EN 438 CERTIFIED", "BESPOKE ARCHITECTURAL SKINS"])
            .map((t, i) => (
              <span key={i} className="eyebrow text-[#9E9E98]">{t} <span className="mx-4 text-[#D4AF37]">✦</span></span>
            ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10" data-testid="categories-section">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div>
            <div className="eyebrow mb-4"><span className="gold-line" /> OUR COLLECTIONS</div>
            <h2 className="font-serif text-4xl lg:text-6xl text-[#F8F8F6] leading-tight max-w-2xl">Architectural surfaces, engineered for distinction.</h2>
          </div>
          <Link to="/products" className="text-[#D4AF37] text-sm tracking-widest uppercase hover:underline">All Products →</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <Link key={c.id} to={`/products?category=${c.slug}`} data-testid={`category-card-${c.slug}`}
              className="group relative aspect-[4/5] overflow-hidden card-gold">
              <img src={fileUrl(c.image_url)} alt={c.name} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-[900ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E] via-[#0B0C0E]/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <div className="eyebrow mb-3">{String(c.order || 0).padStart(2, "0")} — COLLECTION</div>
                <h3 className="font-serif text-3xl text-[#F8F8F6] mb-2">{c.name}</h3>
                <p className="text-sm text-[#9E9E98] leading-relaxed line-clamp-2">{c.subtitle}</p>
                <div className="mt-5 flex items-center gap-2 text-[#D4AF37] text-xs tracking-widest uppercase group-hover:translate-x-1 transition-transform">
                  Discover <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 lg:py-32 bg-[#0F1114]" data-testid="featured-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <div>
              <div className="eyebrow mb-4"><span className="gold-line" /> FEATURED PRODUCTS</div>
              <h2 className="font-serif text-4xl lg:text-5xl text-[#F8F8F6]">Signature specifications.</h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} data-testid={`featured-product-${p.id}`}
                className="group card-gold overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden bg-[#0B0C0E]">
                  <img src={fileUrl(p.main_image)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[900ms]" />
                </div>
                <div className="p-6">
                  <div className="eyebrow text-[0.65rem] mb-2">{p.material}</div>
                  <h3 className="font-serif text-2xl text-[#F8F8F6] mb-2 group-hover:text-[#D4AF37] transition-colors">{p.name}</h3>
                  <p className="text-sm text-[#9E9E98] line-clamp-2">{p.short_description}</p>
                  <div className="mt-5 flex items-center justify-between text-xs tracking-widest uppercase">
                    <span className="text-[#D4AF37]">View Product</span>
                    <ArrowUpRight size={16} className="text-[#D4AF37] group-hover:rotate-45 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-24 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="eyebrow mb-4"><span className="gold-line" /> WHY LALU CLADING</div>
            <h2 className="font-serif text-4xl lg:text-6xl text-[#F8F8F6] leading-tight mb-6">Precision, engineered into every surface.</h2>
            <p className="text-[#9E9E98] leading-relaxed mb-8">{content.about}</p>
            <Link to="/about" className="btn-ghost inline-flex">Our Story <ArrowRight size={16} /></Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Layers, ...(content.why_choose_us?.[0] || { title: "Precision Substructure", text: "Concealed sub-frames." }) },
              { icon: Shield, ...(content.why_choose_us?.[1] || { title: "UV Endurance", text: "10-year fade guarantee." }) },
              { icon: Sparkles, ...(content.why_choose_us?.[2] || { title: "Bespoke Perforation", text: "Parametric CNC." }) },
              { icon: Ruler, ...(content.why_choose_us?.[3] || { title: "Zero-Maintenance", text: "Weatherproof composites." }) },
            ].map((f, i) => (
              <div key={i} className="p-6 border border-white/10 hover:border-[#D4AF37]/40 transition-colors bg-[#14161B]">
                <f.icon size={22} className="text-[#D4AF37] mb-4" />
                <h3 className="font-serif text-xl text-[#F8F8F6] mb-2">{f.title}</h3>
                <p className="text-sm text-[#9E9E98] leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-24 lg:py-32 bg-[#0F1114]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <div>
              <div className="eyebrow mb-4"><span className="gold-line" /> SIGNATURE PROJECTS</div>
              <h2 className="font-serif text-4xl lg:text-5xl text-[#F8F8F6]">Executed with precision.</h2>
            </div>
            <Link to="/projects" className="text-[#D4AF37] text-sm tracking-widest uppercase hover:underline">All Projects →</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p) => (
              <div key={p.id} className="group aspect-[3/2] overflow-hidden relative card-gold" data-testid={`home-project-${p.id}`}>
                <img src={fileUrl(p.cover_image)} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E] via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-7">
                  <div className="eyebrow mb-2">CASE STUDY</div>
                  <h3 className="font-serif text-2xl lg:text-3xl text-[#F8F8F6]">{p.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 max-w-6xl mx-auto px-6 lg:px-10 text-center">
        <div className="eyebrow mb-4">SPECIFY WITH US</div>
        <h2 className="font-serif text-4xl lg:text-6xl text-[#F8F8F6] leading-tight mb-6">Ready to specify your project?</h2>
        <p className="text-[#9E9E98] max-w-2xl mx-auto mb-10">Our architectural team is available for consultation on facade envelopes, interior boiserie, and bespoke perforated screens.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="tel:8088791219" className="btn-gold" data-testid="cta-call"><Phone size={16} /> Call 8088791219</a>
          <a href="https://wa.me/918088791219?text=Hello%20Lalu%20Clading" target="_blank" rel="noreferrer" className="btn-ghost" data-testid="cta-whatsapp"><MessageCircle size={16} /> WhatsApp</a>
        </div>
      </section>
    </div>
  );
}
