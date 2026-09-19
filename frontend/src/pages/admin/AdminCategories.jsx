import { useEffect, useState } from "react";
import { api, fileUrl } from "../../lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { FileUpload } from "./FileUpload";

const EMPTY = { name: "", slug: "", subtitle: "", description: "", image_url: "", order: 0, enabled: true };

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(undefined);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const load = () => api.get("/categories?all=true").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);
  const open = (c) => { setEditing(c || null); setForm(c || EMPTY); };
  const close = () => { setEditing(undefined); setForm(EMPTY); };
  const autoSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Category name is required"); return; }
    const payload = { ...form, slug: form.slug?.trim() || autoSlug(form.name) };
    setSaving(true);
    try {
      if (editing) await api.put(`/categories/${editing.id}`, payload);
      else await api.post("/categories", payload);
      toast.success("Category saved"); close(); load();
    } catch (err) {
      const d = err.response?.data?.detail;
      toast.error(typeof d === "string" ? d : Array.isArray(d) ? d.map(x => x.msg).join(", ") : "Save failed — your entries are preserved");
    } finally { setSaving(false); }
  };
  const del = async (id) => { if (confirm("Delete this category? Products in it will keep their data but lose the link.")) { try { await api.delete(`/categories/${id}`); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); } } };

  return (
    <div data-testid="admin-categories">
      <div className="flex justify-between mb-8">
        <div><div className="eyebrow mb-2">TAXONOMY</div><h1 className="font-serif text-4xl text-[#F8F8F6]">Categories ({items.length})</h1></div>
        <button onClick={() => open(null)} className="btn-gold" data-testid="add-category"><Plus size={16} /> Add Category</button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(c => (
          <div key={c.id} className="admin-card">
            <div className="aspect-[16/9] mb-3 overflow-hidden bg-[#0B0C0E]">{c.image_url && <img loading="lazy" src={fileUrl(c.image_url)} alt="" className="w-full h-full object-cover" />}</div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 tracking-widest ${c.enabled ? "bg-green-900/40 text-green-400" : "bg-white/5 text-[#9E9E98]"}`}>{c.enabled ? "ENABLED" : "HIDDEN"}</span>
              <span className="text-[10px] text-[#9E9E98]">/{c.slug}</span>
            </div>
            <h3 className="font-serif text-lg text-[#F8F8F6]">{c.name}</h3>
            <p className="text-xs text-[#9E9E98] mt-1 line-clamp-2">{c.subtitle}</p>
            <div className="flex gap-3 mt-3">
              <button onClick={() => open(c)} className="text-xs text-[#D4AF37]" data-testid={`cat-edit-${c.id}`}><Edit size={12} className="inline mr-1" />Edit</button>
              <button onClick={() => del(c.id)} className="text-xs text-red-400 ml-auto" data-testid={`cat-delete-${c.id}`}><Trash2 size={12} className="inline mr-1" />Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing !== undefined && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-auto flex justify-center" data-testid="category-form-modal">
          <form onSubmit={save} className="bg-[#14161B] border border-white/10 max-w-xl w-full p-6 my-8 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-[#F8F8F6]">{editing ? "Edit" : "New"} Category</h2>
              <button type="button" onClick={close} data-testid="cf-close"><X className="text-[#9E9E98]" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="eyebrow block mb-2">Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: editing ? form.slug : autoSlug(e.target.value)})} data-testid="cf-name" /></div>
              <div><label className="eyebrow block mb-2">Slug (URL)</label><input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} data-testid="cf-slug" placeholder="auto from name" /></div>
              <div><label className="eyebrow block mb-2">Subtitle</label><input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} /></div>
              <div><label className="eyebrow block mb-2">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div><label className="eyebrow block mb-2">Image</label><FileUpload value={form.image_url} onChange={v => setForm({...form, image_url: v})} testid="cf-image" /></div>
              <div><label className="eyebrow block mb-2">Order</label><input type="number" value={form.order} onChange={e => setForm({...form, order: +e.target.value})} /></div>
              <label className="flex items-center gap-2 text-[#F8F8F6]"><input type="checkbox" checked={form.enabled} onChange={e => setForm({...form, enabled: e.target.checked})} data-testid="cf-enabled" /> Enabled</label>
            </div>
            <div className="flex gap-3 mt-6"><button type="submit" disabled={saving} className="btn-gold disabled:opacity-60" data-testid="cf-save">{saving ? "Saving…" : "Save"}</button><button type="button" onClick={close} className="btn-ghost">Cancel</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
