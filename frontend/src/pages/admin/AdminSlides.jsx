import { useEffect, useState } from "react";
import { api, fileUrl } from "../../lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { FileUpload } from "./FileUpload";

const EMPTY = { image_url: "", heading: "", subheading: "", button_text: "", button_link: "", enabled: true, order: 0 };

export default function AdminSlides() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(undefined);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const load = () => api.get("/slides?all=true").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);
  const open = (c) => { setEditing(c || null); setForm(c || EMPTY); };
  const close = () => { setEditing(undefined); setForm(EMPTY); };
  const save = async (e) => {
    e.preventDefault();
    if (!form.heading.trim()) { toast.error("Heading is required"); return; }
    if (!form.image_url) { toast.error("Please upload a slide image"); return; }
    setSaving(true);
    try {
      if (editing) await api.put(`/slides/${editing.id}`, form);
      else await api.post("/slides", form);
      toast.success("Slide saved"); close(); load();
    } catch (err) {
      const d = err.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Save failed — your entries are preserved");
    } finally { setSaving(false); }
  };
  const del = async (id) => { if (confirm("Delete this slide?")) { try { await api.delete(`/slides/${id}`); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); } } };
  const toggle = async (s) => { await api.put(`/slides/${s.id}`, {...s, enabled: !s.enabled}); load(); };

  return (
    <div data-testid="admin-slides">
      <div className="flex justify-between mb-8">
        <div><div className="eyebrow mb-2">HOMEPAGE</div><h1 className="font-serif text-4xl text-[#F8F8F6]">Slides ({items.length})</h1></div>
        <button onClick={() => open(null)} className="btn-gold" data-testid="add-slide"><Plus size={16} /> Add Slide</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map(s => (
          <div key={s.id} className="admin-card">
            <div className="aspect-[21/9] mb-3 overflow-hidden bg-[#0B0C0E]">{s.image_url && <img src={fileUrl(s.image_url)} alt="" className="w-full h-full object-cover" />}</div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 tracking-widest ${s.enabled ? "bg-green-900/40 text-green-400" : "bg-white/5 text-[#9E9E98]"}`}>{s.enabled ? "LIVE" : "HIDDEN"}</span>
              <span className="text-[10px] text-[#9E9E98]">Order: {s.order}</span>
            </div>
            <h3 className="font-serif text-lg text-[#F8F8F6]">{s.heading}</h3>
            <p className="text-xs text-[#9E9E98] mt-1">{s.subheading}</p>
            <div className="flex gap-3 mt-3 items-center">
              <button onClick={() => open(s)} className="text-xs text-[#D4AF37]" data-testid={`slide-edit-${s.id}`}><Edit size={12} className="inline mr-1" />Edit</button>
              <button onClick={() => toggle(s)} className="text-xs text-[#9E9E98]" data-testid={`slide-toggle-${s.id}`}>{s.enabled ? "Disable" : "Enable"}</button>
              <button onClick={() => del(s.id)} className="text-xs text-red-400 ml-auto" data-testid={`slide-delete-${s.id}`}><Trash2 size={12} className="inline mr-1" />Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing !== undefined && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-auto flex justify-center" data-testid="slide-form-modal">
          <form onSubmit={save} className="bg-[#14161B] border border-white/10 max-w-xl w-full p-6 my-8 h-fit">
            <div className="flex justify-between mb-6"><h2 className="font-serif text-2xl text-[#F8F8F6]">{editing ? "Edit" : "New"} Slide</h2><button type="button" onClick={close}><X className="text-[#9E9E98]" /></button></div>
            <div className="space-y-4">
              <div><label className="eyebrow block mb-2">Image *</label><FileUpload value={form.image_url} onChange={v => setForm({...form, image_url: v})} testid="sf-image" /></div>
              <div><label className="eyebrow block mb-2">Heading *</label><input required value={form.heading} onChange={e => setForm({...form, heading: e.target.value})} data-testid="sf-heading" /></div>
              <div><label className="eyebrow block mb-2">Subheading</label><input value={form.subheading} onChange={e => setForm({...form, subheading: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="eyebrow block mb-2">Button Text</label><input value={form.button_text} onChange={e => setForm({...form, button_text: e.target.value})} /></div>
                <div><label className="eyebrow block mb-2">Button Link</label><input value={form.button_link} onChange={e => setForm({...form, button_link: e.target.value})} /></div>
              </div>
              <div><label className="eyebrow block mb-2">Order</label><input type="number" value={form.order} onChange={e => setForm({...form, order: +e.target.value})} /></div>
              <label className="flex items-center gap-2 text-[#F8F8F6]"><input type="checkbox" checked={form.enabled} onChange={e => setForm({...form, enabled: e.target.checked})} /> Enabled</label>
            </div>
            <div className="flex gap-3 mt-6"><button type="submit" disabled={saving} className="btn-gold disabled:opacity-60" data-testid="sf-save">{saving ? "Saving…" : "Save"}</button><button type="button" onClick={close} className="btn-ghost">Cancel</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
