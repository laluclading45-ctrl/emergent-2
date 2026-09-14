import { useEffect, useState } from "react";
import { api, fileUrl } from "../../lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X, Download } from "lucide-react";
import { FileUpload } from "./FileUpload";

const EMPTY = { title: "", description: "", pdf_url: "", published: true, order: 0 };

export default function AdminCatalogues() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(undefined);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const load = () => api.get("/catalogues?all=true").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);
  const open = (c) => { setEditing(c || null); setForm(c || EMPTY); };
  const close = () => { setEditing(undefined); setForm(EMPTY); };
  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.pdf_url) { toast.error("Please upload a PDF"); return; }
    setSaving(true);
    try {
      if (editing) await api.put(`/catalogues/${editing.id}`, form);
      else await api.post("/catalogues", form);
      toast.success("Catalogue saved"); close(); load();
    } catch (err) {
      const d = err.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Save failed — your entries are preserved");
    } finally { setSaving(false); }
  };
  const del = async (id) => { if (confirm("Delete this catalogue?")) { try { await api.delete(`/catalogues/${id}`); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); } } };

  return (
    <div data-testid="admin-catalogues">
      <div className="flex justify-between mb-8">
        <div><div className="eyebrow mb-2">BROCHURES</div><h1 className="font-serif text-4xl text-[#F8F8F6]">Catalogues ({items.length})</h1></div>
        <button onClick={() => open(null)} className="btn-gold" data-testid="add-catalogue"><Plus size={16} /> Add Catalogue</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map(c => (
          <div key={c.id} className="admin-card">
            <span className={`text-[10px] px-2 py-0.5 tracking-widest ${c.published ? "bg-green-900/40 text-green-400" : "bg-white/5 text-[#9E9E98]"}`}>{c.published ? "PUBLISHED" : "DRAFT"}</span>
            <h3 className="font-serif text-lg text-[#F8F8F6] mt-2">{c.title}</h3>
            <p className="text-xs text-[#9E9E98] mt-1">{c.description}</p>
            <a href={fileUrl(c.pdf_url)} target="_blank" rel="noreferrer" className="text-xs text-[#D4AF37] mt-2 inline-flex items-center gap-1"><Download size={12} /> Open PDF</a>
            <div className="flex gap-3 mt-3">
              <button onClick={() => open(c)} className="text-xs text-[#D4AF37]"><Edit size={12} className="inline mr-1" />Edit</button>
              <button onClick={() => del(c.id)} className="text-xs text-red-400 ml-auto"><Trash2 size={12} className="inline mr-1" />Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing !== undefined && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-auto flex justify-center" data-testid="catalogue-form-modal">
          <form onSubmit={save} className="bg-[#14161B] border border-white/10 max-w-xl w-full p-6 my-8 h-fit">
            <div className="flex justify-between mb-6"><h2 className="font-serif text-2xl text-[#F8F8F6]">{editing ? "Edit" : "New"} Catalogue</h2><button type="button" onClick={close}><X className="text-[#9E9E98]" /></button></div>
            <div className="space-y-4">
              <div><label className="eyebrow block mb-2">Title *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div><label className="eyebrow block mb-2">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div><label className="eyebrow block mb-2">PDF *</label><FileUpload value={form.pdf_url} onChange={v => setForm({...form, pdf_url: v})} accept="application/pdf" label="Upload PDF" /></div>
              <div><label className="eyebrow block mb-2">Order</label><input type="number" value={form.order} onChange={e => setForm({...form, order: +e.target.value})} /></div>
              <label className="flex items-center gap-2 text-[#F8F8F6]"><input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} /> Published</label>
            </div>
            <div className="flex gap-3 mt-6"><button type="submit" disabled={saving} className="btn-gold disabled:opacity-60" data-testid="catf-save">{saving ? "Saving…" : "Save"}</button><button type="button" onClick={close} className="btn-ghost">Cancel</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
