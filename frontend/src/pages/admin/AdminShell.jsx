import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Package, FolderOpen, Image as ImageIcon, FileText, Building2, Newspaper, LogOut, MessageSquare, Images } from "lucide-react";

const items = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/categories", icon: FolderOpen, label: "Categories" },
  { to: "/admin/slides", icon: Images, label: "Homepage Slides" },
  { to: "/admin/projects", icon: Building2, label: "Projects" },
  { to: "/admin/catalogues", icon: FileText, label: "Catalogues (PDF)" },
  { to: "/admin/media", icon: ImageIcon, label: "Media Library" },
  { to: "/admin/content", icon: Newspaper, label: "Website Content" },
  { to: "/admin/enquiries", icon: MessageSquare, label: "Enquiries" },
];

export default function AdminShell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="admin-shell flex" data-testid="admin-shell">
      <aside className="admin-sidebar w-64 min-h-screen flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-white/10">
          <img src="/logo-full.png" alt="Lalu Clading" className="h-12 w-auto object-contain rounded-[2px]" data-testid="admin-logo" />
          <div className="eyebrow mt-3">ADMIN PANEL</div>
        </div>
        <nav className="p-3 flex-1 overflow-auto">
          {items.map(it => (
            <NavLink key={it.to} to={it.to} end={it.end} data-testid={`admin-nav-${it.label.replace(/\s+/g, "-").toLowerCase()}`}
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}>
              <it.icon size={16} /> {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 text-xs">
          <div className="text-[#9E9E98] mb-2 break-all">{user?.email}</div>
          <button onClick={() => { logout(); nav("/admin/login"); }} data-testid="admin-logout"
            className="flex items-center gap-2 text-[#F8F8F6] hover:text-[#D4AF37]">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8"><Outlet /></main>
    </div>
  );
}
