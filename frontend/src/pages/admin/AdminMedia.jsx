import { useEffect, useState, useRef } from "react";
import { api, fileUrl } from "../../lib/api";
import { toast } from "sonner";
import { Upload, Trash2, Copy } from "lucide-react";

export default function AdminMedia() {
  const [items, setItems] = useState([]);
  const ref = useRef();
  const load = () => api.get("/media").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);
  const upload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      const fd = new FormData(); fd.append("file", f);
      try { await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } }); }
      catch { toast.error("Upload failed for " + f.name); }
    }
    toast.success("Uploaded");
    if (ref.current) ref.current.value = "";
    load();
  };
  const del = async (id) => { if (confirm("Delete?")) { await api.delete(`/media/${id}`); load(); } };
  const copy = (url) => { navigator.clipboard.writeText(url); toast.success("URL copied"); };

  return (
    <div data-testid="admin-media">
      <div className="flex justify-between mb-8">
        <div><div className="eyebrow mb-2">ASSETS</div><h1 className="font-serif text-4xl text-[#F8F8F6]">Media Library ({items.length})</h1></div>
        <button onClick={() => ref.current?.click()} className="btn-gold" data-testid="upload-media"><Upload size={16} /> Upload</button>
        <input ref={ref} type="file" multiple onChange={upload} className="hidden" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map(m => (
          <div key={m.id} className="admin-card p-2">
            {m.kind === "image" ? (
              <img loading="lazy" src={fileUrl(m.url)} alt="" className="aspect-square w-full object-cover mb-2" />
            ) : (
              <div className="aspect-square bg-[#0B0C0E] flex items-center justify-center text-[#D4AF37] font-mono text-xs mb-2">
                .{(m.original_filename || "").split(".").pop()?.toUpperCase()}
              </div>
            )}
            <div className="text-[10px] text-[#9E9E98] break-all line-clamp-1">{m.original_filename}</div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => copy(fileUrl(m.url))} className="text-xs text-[#D4AF37]"><Copy size={12} /></button>
              <button onClick={() => del(m.id)} className="text-xs text-red-400 ml-auto"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
