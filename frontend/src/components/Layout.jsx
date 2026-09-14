import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import { Phone, MessageCircle } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#F8F8F6] flex flex-col">
      <Header />
      <main className="flex-1 pt-20"><Outlet /></main>
      <Footer />
      <a href="https://wa.me/918088791219?text=Hello%20Lalu%20Clading" target="_blank" rel="noreferrer"
         data-testid="floating-whatsapp"
         className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#D4AF37] text-[#0B0C0E] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
        <MessageCircle size={22} />
      </a>
      <a href="tel:8088791219" data-testid="floating-call"
         className="fixed bottom-6 right-24 z-40 w-14 h-14 bg-[#14161B] border border-[#D4AF37]/40 text-[#D4AF37] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
        <Phone size={20} />
      </a>
    </div>
  );
}
