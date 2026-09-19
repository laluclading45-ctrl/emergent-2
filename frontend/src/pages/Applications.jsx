import { useEffect, useState } from "react";
import { api, fileUrl } from "../lib/api";

export default function Applications() {
  const [content, setContent] = useState({});
  useEffect(() => { api.get("/content").then(r => setContent(r.data)); }, []);
  const apps = content.applications || [];

  return (
    <div data-testid="applications-page" className="pb-32">
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="eyebrow mb-4"><span className="gold-line" /> APPLICATIONS</div>
        <h1 className="font-serif text-5xl lg:text-7xl text-[#F8F8F6] leading-[1] mb-6">Where our surfaces live.</h1>
        <p className="text-[#9E9E98] max-w-2xl">From private residences to corporate envelopes — Lalu Clading materials adapt to any architectural language.</p>
      </section>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-6">
        {apps.map((a, i) => (
          <div key={i} className="relative aspect-[4/3] overflow-hidden card-gold group" data-testid={`app-${i}`}>
            <img loading="lazy" src={fileUrl(a.image)} alt={a.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E] via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <div className="eyebrow mb-2">{String(i + 1).padStart(2, "0")} — APPLICATION</div>
              <h3 className="font-serif text-3xl lg:text-4xl text-[#F8F8F6]">{a.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
