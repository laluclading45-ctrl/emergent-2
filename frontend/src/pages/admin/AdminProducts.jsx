import { useEffect, useState } from "react";
import { api, fileUrl } from "../../lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Copy, X } from "lucide-react";
import { FileUpload, MultiImageUpload } from "./FileUpload";

const EMPTY = {
  name: "", category_id: "", short_description: "", full_description: "",
  main_image: "", gallery: [], model_3d_url: "",
  features: [], applications: [], material: "", finish: "", colour: "", dimensions: "",
  specifications: [], brochure_url: "", featured: false, published: true, order: 0,
};

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(undefined); // undefined=closed, null=new, object=edit
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get("/products?all=true").then(r => setItems(r.data));
    api.get("/categories?all=true").then(r => setCats(r.data));
  };
  useEffect(() => { load(); }, []);

  const open = (p) => { setEditing(p || null); setForm(p || EMPTY); };
  const close = () => { setEditing(undefined); setForm(EMPTY); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    setSaving(true);
    try {
      if (editing) await api.put(`/products/${editing.id}`, form);
      else await api.post("/products", form);
      toast.success("Product saved");
      close(); load();
    } catch (err) {
      const d = err.response?.data?.detail;
      toast.error(typeof d === "string" ? d : Array.isArray(d) ? d.map(x => x.msg).join(", ") : "Save failed — your entries are preserved");
    } finally { setSaving(false); }
  };
  const del = async (id) => { if (confirm("Delete this product? This cannot be undone.")) { try { await api.delete(`/products/${id}`); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); } } };
  const dup = async (id) => { try { await api.post(`/products/${id}/duplicate`); load(); toast.success("Duplicated"); } catch { toast.error("Duplicate failed"); } };

  return (
    <div data-testid="admin-products">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="eyebrow mb-2">CATALOGUE</div>
          <h1 className="font-serif text-4xl text-[#F8F8F6]">Products ({items.length})</h1>
        </div>
        <button onClick={() => open(null)} className="btn-gold" data-testid="add-product"><Plus size={16} /> Add Product</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(p => (
          <div key={p.id} className="admin-card" data-testid={`admin-product-${p.id}`}>
            <div className="aspect-[4/3] mb-3 overflow-hidden bg-[#0B0C0E]">
              {p.main_image && <img src={fileUrl(p.main_image)} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex items-center gap-2 mb-2">
              {p.featured && <span className="text-[10px] px-2 py-0.5 bg-[#D4AF37] text-[#0B0C0E] tracking-widest">FEATURED</span>}
              <span className={`text-[10px] px-2 py-0.5 tracking-widest ${p.published ? "bg-green-900/40 text-green-400" : "bg-white/5 text-[#9E9E98]"}`}>{p.published ? "PUBLISHED" : "DRAFT"}</span>
            </div>
            <h3 className="font-serif text-lg text-[#F8F8F6]">{p.name}</h3>
            <p className="text-xs text-[#9E9E98] mt-1 line-clamp-2">{p.short_description}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => open(p)} className="text-xs text-[#D4AF37] flex items-center gap-1" data-testid={`edit-${p.id}`}><Edit size={12} /> Edit</button>
              <button onClick={() => dup(p.id)} className="text-xs text-[#9E9E98] flex items-center gap-1" data-testid={`duplicate-${p.id}`}><Copy size={12} /> Duplicate</button>
              <button onClick={() => del(p.id)} className="text-xs text-red-400 flex items-center gap-1 ml-auto" data-testid={`delete-${p.id}`}><Trash2 size={12} /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing !== undefined && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-auto flex justify-center" data-testid="product-form-modal">
          <form onSubmit={save} className="bg-[#14161B] border border-white/10 max-w-3xl w-full p-6 my-8 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-[#F8F8F6]">{editing ? "Edit" : "New"} Product</h2>
              <button type="button" onClick={close}><X className="text-[#9E9E98]" /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="eyebrow block mb-2">Product Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} data-testid="pf-name" />
              </div>
              <div>
                <label className="eyebrow block mb-2">Category</label>
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} data-testid="pf-category">
                  <option value="">— None —</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="eyebrow block mb-2">Order</label>
                <input type="number" value={form.order} onChange={e => setForm({...form, order: +e.target.value})} />
              </div>
              <div className="sm:col-span-2">
                <label className="eyebrow block mb-2">Short Description</label>
                <textarea rows={2} value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} />
              </div>
              <div className="sm:col-span-2">
                <label className="eyebrow block mb-2">Full Description</label>
                <textarea rows={4} value={form.full_description} onChange={e => setForm({...form, full_description: e.target.value})} />
              </div>

              <div>
                <label className="eyebrow block mb-2">Main Image</label>
                <FileUpload value={form.main_image} onChange={v => setForm({...form, main_image: v})} testid="pf-main-image" />
              </div>
              <div>
                <label className="eyebrow block mb-2">3D Model (.glb/.gltf)</label>
                <FileUpload value={form.model_3d_url} onChange={v => setForm({...form, model_3d_url: v})} accept=".glb,.gltf" label="Upload 3D" testid="pf-3d" />
              </div>
              <div className="sm:col-span-2">
                <label className="eyebrow block mb-2">Gallery Images</label>
                <MultiImageUpload value={form.gallery} onChange={v => setForm({...form, gallery: v})} testid="pf-gallery" />
              </div>

              <div><label className="eyebrow block mb-2">Material</label><input value={form.material} onChange={e => setForm({...form, material: e.target.value})} /></div>
              <div><label className="eyebrow block mb-2">Finish</label><input value={form.finish} onChange={e => setForm({...form, finish: e.target.value})} /></div>
              <div><label className="eyebrow block mb-2">Colour</label><input value={form.colour} onChange={e => setForm({...form, colour: e.target.value})} /></div>
              <div><label className="eyebrow block mb-2">Dimensions</label><input value={form.dimensions} onChange={e => setForm({...form, dimensions: e.target.value})} /></div>

              <div className="sm:col-span-2">
                <label className="eyebrow block mb-2">Features (comma separated)</label>
                <input value={(form.features || []).join(", ")} onChange={e => setForm({...form, features: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} />
              </div>
              <div className="sm:col-span-2">
                <label className="eyebrow block mb-2">Applications (comma separated)</label>
                <input value={(form.applications || []).join(", ")} onChange={e => setForm({...form, applications: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} />
              </div>

              <div className="sm:col-span-2">
                <label className="eyebrow block mb-2">Specifications</label>
                {(form.specifications || []).map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="Key" value={s.key} onChange={e => { const n = [...form.specifications]; n[i].key = e.target.value; setForm({...form, specifications: n}); }} />
                    <input placeholder="Value" value={s.value} onChange={e => { const n = [...form.specifications]; n[i].value = e.target.value; setForm({...form, specifications: n}); }} />
                    <button type="button" onClick={() => setForm({...form, specifications: form.specifications.filter((_, x) => x !== i)})} className="text-red-400 px-3"><X size={14} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setForm({...form, specifications: [...(form.specifications || []), {key: "", value: ""}]})} className="text-xs text-[#D4AF37]">+ Add specification</button>
              </div>

              <div className="sm:col-span-2">
                <label className="eyebrow block mb-2">Brochure PDF</label>
                <FileUpload value={form.brochure_url} onChange={v => setForm({...form, brochure_url: v})} accept="application/pdf" label="Upload PDF" testid="pf-brochure" />
              </div>

              <label className="flex items-center gap-2 text-sm text-[#F8F8F6]">
                <input type="checkbox" className="w-4 h-4" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-[#F8F8F6]">
                <input type="checkbox" className="w-4 h-4" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} /> Published
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60" data-testid="pf-save">{saving ? "Saving…" : "Save"}</button>
              <button type="button" onClick={close} className="btn-ghost" data-testid="pf-cancel">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
