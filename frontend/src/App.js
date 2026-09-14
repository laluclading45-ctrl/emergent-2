import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Applications from "./pages/Applications";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import About from "./pages/About";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminShell from "./pages/admin/AdminShell";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSlides from "./pages/admin/AdminSlides";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminCatalogues from "./pages/admin/AdminCatalogues";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminContent from "./pages/admin/AdminContent";
import AdminEnquiries from "./pages/admin/AdminEnquiries";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

const RequireAdmin = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0B0C0E] flex items-center justify-center text-[#D4AF37] font-mono text-xs tracking-widest">LOADING…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster theme="dark" position="top-right" richColors />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="slides" element={<AdminSlides />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="catalogues" element={<AdminCatalogues />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
