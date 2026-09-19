import { useEffect, useState } from "react";
import { api, fileUrl } from "../lib/api";
import { Download } from "lucide-react";

export default function About() {
  const [content, setContent] = useState({});
  const [catalogues, setCatalogues] = useState([]);
  useEffect(() => {
    api.get("/content").then(r => setContent(r.data));
    api.get("/catalogues").then(r => setCatalogues(r.data));
  }, []);

  return (
    <div data-testid="about-page" className="pb-32">
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="eyebrow mb-4"><span className="gold-line" /> ABOUT LALU CLADING</div>
          <h1 className="font-serif text-5xl lg:text-7xl text-[#F8F8F6] leading-[1] mb-6">Architectural Skins of Distinction.</h1>
          <p className="text-[#9E9E98] leading-relaxed mb-4">{content.about}</p>
        </div>
        <div className="aspect-[4/5] overflow-hidden">
          <img loading="lazy" src="https://images.unsplash.com/photo-1615406020658-6c4b805f1f30?w=1600&q=90" alt="" className="w-full h-full object-cover" />
        </div>
      </section>

      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="eyebrow mb-4"><span className="gold-line" /> OUR PILLARS</div>
        <h2 className="font-serif text-4xl lg:text-5xl text-[#F8F8F6] mb-10">Why Lalu Clading.</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {(content.why_choose_us || []).map((w, i) => (
            <div key={i} className="p-8 border border-white/10 bg-[#14161B]">
              <div className="eyebrow mb-3">0{i + 1}</div>
              <h3 className="font-serif text-2xl text-[#F8F8F6] mb-3">{w.title}</h3>
              <p className="text-[#9E9E98] leading-relaxed">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {catalogues.length > 0 && (
        <section className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="eyebrow mb-4"><span className="gold-line" /> CATALOGUES</div>
          <h2 className="font-serif text-4xl lg:text-5xl text-[#F8F8F6] mb-10">Download our technical catalogue.</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {catalogues.map(c => (
              <a key={c.id} href={fileUrl(c.pdf_url)} target="_blank" rel="noreferrer"
                 data-testid={`catalogue-${c.id}`}
                 className="flex items-center justify-between p-6 border border-[#D4AF37]/30 bg-[#14161B] hover:border-[#D4AF37] transition-colors">
                <div>
                  <div className="eyebrow mb-2">PDF BROCHURE</div>
                  <div className="font-serif text-2xl text-[#F8F8F6]">{c.title}</div>
                  <p className="text-sm text-[#9E9E98] mt-1">{c.description}</p>
                </div>
                <Download size={24} className="text-[#D4AF37]" />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
