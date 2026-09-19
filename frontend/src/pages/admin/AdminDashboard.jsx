import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  useEffect(() => { api.get("/admin/stats").then(r => setStats(r.data)); }, []);
  const tiles = [
    { key: "products", label: "Products" },
    { key: "categories", label: "Categories" },
    { key: "projects", label: "Projects" },
    { key: "slides", label: "Slides" },
    { key: "catalogues", label: "Catalogues" },
    { key: "media", label: "Media Files" },
    { key: "enquiries", label: "Enquiries" },
  ];
  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <div className="eyebrow mb-2">OVERVIEW</div>
        <h1 className="font-serif text-4xl text-[#F8F8F6]">Dashboard</h1>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map(t => (
          <div key={t.key} className="admin-card" data-testid={`stat-${t.key}`}>
            <div className="eyebrow mb-2">{t.label}</div>
            <div className="font-serif text-5xl text-[#D4AF37]">{stats[t.key] ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
