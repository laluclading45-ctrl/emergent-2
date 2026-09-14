import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, fileUrl } from "../lib/api";
import { Phone, MessageCircle, Download, ArrowLeft, ArrowRight } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [cat, setCat] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    setImgIdx(0);
    api.get(`/products/${id}`).then(r => {
      setP(r.data);
      if (r.data.category_id) api.get(`/categories`).then(cr => setCat(cr.data.find(c => c.id === r.data.category_id)));
    });
  }, [id]);

  if (!p) return <div className="min-h-[60vh] flex items-center justify-center text-[#D4AF37] font-mono text-xs">LOADING…</div>;

  const gallery = p.gallery && p.gallery.length ? p.gallery : [p.main_image].filter(Boolean);
  const waMsg = encodeURIComponent(`Hello Lalu Clading, I would like to enquire about ${p.name}.`);

  return (
    <div data-testid="product-detail" className="pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-10">
        <Link to="/products" className="inline-flex items-center gap-2 text-[#9E9E98] hover:text-[#D4AF37] text-xs tracking-widest uppercase">
          <ArrowLeft size={14} /> Back to Catalogue
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-8 grid lg:grid-cols-2 gap-12">
        <div>
          <div className="aspect-[4/3] bg-[#14161B] overflow-hidden mb-4">
            <img src={fileUrl(gallery[imgIdx])} alt={p.name} className="w-full h-full object-cover" data-testid="product-main-image" />
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`aspect-square overflow-hidden border ${i === imgIdx ? "border-[#D4AF37]" : "border-white/10"}`}>
                  <img src={fileUrl(g)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {p.model_3d_url && (
            <div className="mt-6 p-4 border border-[#D4AF37]/30 bg-[#14161B]">
              <div className="eyebrow mb-2">3D SPECIMEN AVAILABLE</div>
              <a href={fileUrl(p.model_3d_url)} target="_blank" rel="noreferrer" className="text-[#D4AF37] text-sm">Download 3D Model (.glb) →</a>
            </div>
          )}
        </div>

        <div>
          <div className="eyebrow mb-3">{cat?.name || "Product"}</div>
          <h1 className="font-serif text-4xl lg:text-5xl text-[#F8F8F6] leading-tight mb-4" data-testid="product-name">{p.name}</h1>
          <p className="text-[#9E9E98] leading-relaxed mb-8">{p.short_description}</p>

          <div className="flex flex-wrap gap-3 mb-10">
            <a href="tel:8088791219" className="btn-gold" data-testid="product-call"><Phone size={14} /> Call</a>
            <a href={`https://wa.me/918088791219?text=${waMsg}`} target="_blank" rel="noreferrer" className="btn-ghost" data-testid="product-whatsapp"><MessageCircle size={14} /> WhatsApp</a>
            <Link to="/contact" className="btn-ghost" data-testid="product-contact">Contact Us <ArrowRight size={14} /></Link>
          </div>

          {p.brochure_url && (
            <a href={fileUrl(p.brochure_url)} target="_blank" rel="noreferrer"
               data-testid="product-brochure"
               className="flex items-center justify-between px-6 py-4 border border-[#D4AF37]/40 bg-[#14161B] mb-10 hover:border-[#D4AF37] transition-colors">
              <div>
                <div className="eyebrow mb-1">BROCHURE</div>
                <div className="text-[#F8F8F6]">Download Technical Catalogue PDF</div>
              </div>
              <Download size={20} className="text-[#D4AF37]" />
            </a>
          )}

          <div className="mb-10">
            <div className="eyebrow mb-4"><span className="gold-line" /> DETAILS</div>
            <p className="text-[#9E9E98] leading-relaxed">{p.full_description}</p>
          </div>

          {p.features?.length > 0 && (
            <div className="mb-10">
              <div className="eyebrow mb-4"><span className="gold-line" /> FEATURES</div>
              <ul className="space-y-2">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#F8F8F6]">
                    <span className="text-[#D4AF37] mt-1">◆</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {p.applications?.length > 0 && (
            <div className="mb-10">
              <div className="eyebrow mb-4"><span className="gold-line" /> APPLICATIONS</div>
              <div className="flex flex-wrap gap-2">
                {p.applications.map((a, i) => (
                  <span key={i} className="px-3 py-1.5 border border-white/10 text-xs uppercase tracking-widest text-[#9E9E98]">{a}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-10">
            <div className="eyebrow mb-4"><span className="gold-line" /> SPECIFICATIONS</div>
            {p.material && <div className="spec-row"><div className="k">Material</div><div className="v">{p.material}</div></div>}
            {p.finish && <div className="spec-row"><div className="k">Finish</div><div className="v">{p.finish}</div></div>}
            {p.colour && <div className="spec-row"><div className="k">Colour</div><div className="v">{p.colour}</div></div>}
            {p.dimensions && <div className="spec-row"><div className="k">Dimensions</div><div className="v">{p.dimensions}</div></div>}
            {p.specifications?.map((s, i) => (
              <div key={i} className="spec-row"><div className="k">{s.key}</div><div className="v">{s.value}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
