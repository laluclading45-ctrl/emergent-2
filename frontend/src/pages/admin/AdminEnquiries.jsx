import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Trash2 } from "lucide-react";

export default function AdminEnquiries() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/enquiries").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);
  const del = async (id) => { if (confirm("Delete?")) { await api.delete(`/enquiries/${id}`); load(); } };
  return (
    <div data-testid="admin-enquiries">
      <div className="mb-8"><div className="eyebrow mb-2">CUSTOMER</div><h1 className="font-serif text-4xl text-[#F8F8F6]">Enquiries ({items.length})</h1></div>
      <div className="space-y-3">
        {items.map(e => (
          <div key={e.id} className="admin-card">
            <div className="flex justify-between mb-2">
              <div>
                <h3 className="font-serif text-xl text-[#F8F8F6]">{e.name} <span className="text-sm text-[#9E9E98]">— {e.email}</span></h3>
                <div className="text-xs text-[#9E9E98] mt-1">{e.phone} · {e.firm} · {e.project_type} · {e.area}</div>
              </div>
              <button onClick={() => del(e.id)} className="text-red-400"><Trash2 size={16} /></button>
            </div>
            <p className="text-sm text-[#F8F8F6] leading-relaxed">{e.message}</p>
            <div className="text-[10px] text-[#9E9E98] mt-2 font-mono">{new Date(e.created_at).toLocaleString()}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-[#9E9E98] text-sm">No enquiries yet.</div>}
      </div>
    </div>
  );
}
