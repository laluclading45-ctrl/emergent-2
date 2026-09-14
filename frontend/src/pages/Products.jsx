import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, fileUrl } from "../lib/api";
import { ArrowUpRight } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [params, setParams] = useSearchParams();
  const catSlug = params.get("category") || "all";

  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    const q = catSlug === "all" ? "" : `?category=${catSlug}`;
    api.get(`/products${q}`).then(r => setProducts(r.data));
  }, [catSlug]);

  return (
    <div data-testid="products-page" className="pb-32">
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="eyebrow mb-4"><span className="gold-line" /> CATALOGUE</div>
        <h1 className="font-serif text-5xl lg:text-7xl text-[#F8F8F6] leading-[1] mb-8">Complete Product Catalogue</h1>
        <p className="text-[#9E9E98] max-w-2xl">Browse architectural cladding surfaces engineered for facade envelopes, boiserie interiors, and bespoke perforation.</p>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-wrap gap-2 mb-12 pb-6 border-b border-white/10 overflow-x-auto">
          <button onClick={() => setParams({})}
            data-testid="filter-all"
            className={`px-5 py-2 text-xs tracking-widest uppercase whitespace-nowrap transition-colors ${catSlug === "all" ? "bg-[#D4AF37] text-[#0B0C0E]" : "text-[#F8F8F6] hover:text-[#D4AF37]"}`}>
            All Products
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setParams({ category: c.slug })}
              data-testid={`filter-${c.slug}`}
              className={`px-5 py-2 text-xs tracking-widest uppercase whitespace-nowrap transition-colors ${catSlug === c.slug ? "bg-[#D4AF37] text-[#0B0C0E]" : "text-[#F8F8F6] hover:text-[#D4AF37]"}`}>
              {c.name}
            </button>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center text-[#9E9E98] py-24">No products yet in this collection.</div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => {
            const cat = categories.find(c => c.id === p.category_id);
            return (
              <Link key={p.id} to={`/products/${p.id}`} data-testid={`product-card-${p.id}`}
                className="group card-gold overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden bg-[#0B0C0E]">
                  <img src={fileUrl(p.main_image)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[900ms]" />
                </div>
                <div className="p-6">
                  <div className="eyebrow text-[0.65rem] mb-2">{cat?.name || "Product"}</div>
                  <h3 className="font-serif text-2xl text-[#F8F8F6] mb-2 group-hover:text-[#D4AF37] transition-colors">{p.name}</h3>
                  <p className="text-sm text-[#9E9E98] line-clamp-2 mb-5">{p.short_description}</p>
                  <div className="flex items-center justify-between text-xs tracking-widest uppercase">
                    <span className="text-[#D4AF37]">View Product</span>
                    <ArrowUpRight size={16} className="text-[#D4AF37] group-hover:rotate-45 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
