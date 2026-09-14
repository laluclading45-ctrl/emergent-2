import { useEffect, useState } from "react";
import { api, fileUrl } from "../../lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { FileUpload, MultiImageUpload } from "./FileUpload";

const EMPTY = { title: "", description: "", category_id: "", cover_image: "", images: [], published: true, order: 0 };

export default function AdminProjects() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(undefined);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const load = () => api.get("/projects?all=true").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);
  const open = (c) => { setEditing(c || null); setForm(c || EMPTY); };
  const close = () => { setEditing(undefined); setForm(EMPTY); };
  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      if (editing) await api.put(`/projects/${editing.id}`, form);
      else await api.post("/projects", form);
      toast.success("Project saved"); close(); load();
    } catch (err) {
      const d = err.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Save failed — your entries are preserved");
    } finally { setSaving(false); }
  };
  const del = async (id) => { if (confirm("Delete this project?")) { try { await api.delete(`/projects/${id}`); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); } } };

  return (
    <div data-testid="admin-projects">
      <div className="flex justify-between mb-8">
        <div><div className="eyebrow mb-2">GALLERY</div><h1 className="font-serif text-4xl text-[#F8F8F6]">Projects ({items.length})</h1></div>
        <button onClick={() => open(null)} className="btn-gold" data-testid="add-project"><Plus size={16} /> Add Project</button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(p => (
          <div key={p.id} className="admin-card">
            <div className="aspect-[4/3] mb-3 overflow-hidden bg-[#0B0C0E]">{p.cover_image && <img src={fileUrl(p.cover_image)} alt="" className="w-full h-full object-cover" />}</div>
            <span className={`text-[10px] px-2 py-0.5 tracking-widest ${p.published ? "bg-green-900/40 text-green-400" : "bg-white/5 text-[#9E9E98]"}`}>{p.published ? "PUBLISHED" : "DRAFT"}</span>
            <h3 className="font-serif text-lg text-[#F8F8F6] mt-2">{p.title}</h3>
            <p className="text-xs text-[#9E9E98] mt-1 line-clamp-2">{p.description}</p>
            <div className="flex gap-3 mt-3">
              <button onClick={() => open(p)} className="text-xs text-[#D4AF37]"><Edit size={12} className="inline mr-1" />Edit</button>
              <button onClick={() => del(p.id)} className="text-xs text-red-400 ml-auto"><Trash2 size={12} className="inline mr-1" />Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing !== undefined && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-auto flex justify-center" data-testid="project-form-modal">
          <form onSubmit={save} className="bg-[#14161B] border border-white/10 max-w-2xl w-full p-6 my-8 h-fit">
            <div className="flex justify-between mb-6"><h2 className="font-serif text-2xl text-[#F8F8F6]">{editing ? "Edit" : "New"} Project</h2><button type="button" onClick={close}><X className="text-[#9E9E98]" /></button></div>
            <div className="space-y-4">
              <div><label className="eyebrow block mb-2">Title *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div><label className="eyebrow block mb-2">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div><label className="eyebrow block mb-2">Cover Image</label><FileUpload value={form.cover_image} onChange={v => setForm({...form, cover_image: v})} /></div>
              <div><label className="eyebrow block mb-2">Gallery Images</label><MultiImageUpload value={form.images} onChange={v => setForm({...form, images: v})} /></div>
              <div><label className="eyebrow block mb-2">Order</label><input type="number" value={form.order} onChange={e => setForm({...form, order: +e.target.value})} /></div>
              <label className="flex items-center gap-2 text-[#F8F8F6]"><input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} /> Published</label>
            </div>
            <div className="flex gap-3 mt-6"><button type="submit" disabled={saving} className="btn-gold disabled:opacity-60" data-testid="prf-save">{saving ? "Saving…" : "Save"}</button><button type="button" onClick={close} className="btn-ghost">Cancel</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
