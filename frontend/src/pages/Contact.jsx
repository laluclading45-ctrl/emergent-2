import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Phone, MessageCircle, Mail, ArrowRight } from "lucide-react";

export default function Contact() {
  const [content, setContent] = useState({});
  const [form, setForm] = useState({ name: "", email: "", phone: "", firm: "", project_type: "", area: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get("/content").then(r => setContent(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/enquiries", form);
      toast.success("Enquiry received. Our team will reach out shortly.");
      setForm({ name: "", email: "", phone: "", firm: "", project_type: "", area: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Something went wrong");
    } finally { setLoading(false); }
  };

  const c = content.contact || {};

  return (
    <div data-testid="contact-page" className="pb-32">
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="eyebrow mb-4"><span className="gold-line" /> DIRECT CHANNEL</div>
        <h1 className="font-serif text-5xl lg:text-7xl text-[#F8F8F6] leading-[1] mb-6">Specify with us.</h1>
        <p className="text-[#9E9E98] max-w-2xl">Speak directly to our architectural team about facade envelopes, interior boiserie, or bespoke perforated screens.</p>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-4">
          <a href={`tel:${c.phone || "8088791219"}`} data-testid="contact-call" className="flex items-center gap-4 p-6 border border-white/10 hover:border-[#D4AF37] transition-colors bg-[#14161B]">
            <div className="w-12 h-12 border border-[#D4AF37] flex items-center justify-center"><Phone className="text-[#D4AF37]" size={18} /></div>
            <div>
              <div className="eyebrow mb-1">CALL</div>
              <div className="text-[#F8F8F6] text-lg">{c.phone || "8088791219"}</div>
            </div>
          </a>
          <a href={`https://wa.me/${c.whatsapp || "918088791219"}?text=Hello%20Lalu%20Clading`} target="_blank" rel="noreferrer" data-testid="contact-whatsapp"
             className="flex items-center gap-4 p-6 border border-white/10 hover:border-[#D4AF37] transition-colors bg-[#14161B]">
            <div className="w-12 h-12 border border-[#D4AF37] flex items-center justify-center"><MessageCircle className="text-[#D4AF37]" size={18} /></div>
            <div>
              <div className="eyebrow mb-1">WHATSAPP</div>
              <div className="text-[#F8F8F6] text-lg">Instant Chat</div>
            </div>
          </a>
          <a href={`mailto:${c.email || "laluclading45@gmail.com"}`} data-testid="contact-email"
             className="flex items-center gap-4 p-6 border border-white/10 hover:border-[#D4AF37] transition-colors bg-[#14161B]">
            <div className="w-12 h-12 border border-[#D4AF37] flex items-center justify-center"><Mail className="text-[#D4AF37]" size={18} /></div>
            <div>
              <div className="eyebrow mb-1">EMAIL</div>
              <div className="text-[#F8F8F6] text-lg break-all">{c.email || "laluclading45@gmail.com"}</div>
            </div>
          </a>
        </div>

        <form onSubmit={submit} className="lg:col-span-3 space-y-4" data-testid="enquiry-form">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="eyebrow block mb-2">Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} data-testid="enq-name" />
            </div>
            <div>
              <label className="eyebrow block mb-2">Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} data-testid="enq-email" />
            </div>
            <div>
              <label className="eyebrow block mb-2">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} data-testid="enq-phone" />
            </div>
            <div>
              <label className="eyebrow block mb-2">Firm / Role</label>
              <input value={form.firm} onChange={e => setForm({...form, firm: e.target.value})} data-testid="enq-firm" />
            </div>
            <div>
              <label className="eyebrow block mb-2">Project Type</label>
              <input value={form.project_type} onChange={e => setForm({...form, project_type: e.target.value})} placeholder="Villa, Hospitality, Corporate…" data-testid="enq-project-type" />
            </div>
            <div>
              <label className="eyebrow block mb-2">Estimated Area</label>
              <input value={form.area} onChange={e => setForm({...form, area: e.target.value})} placeholder="e.g. 12,000 sq.ft." data-testid="enq-area" />
            </div>
          </div>
          <div>
            <label className="eyebrow block mb-2">Message *</label>
            <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} data-testid="enq-message" />
          </div>
          <button type="submit" disabled={loading} className="btn-gold" data-testid="enq-submit">
            {loading ? "Sending..." : "Submit Enquiry"} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
