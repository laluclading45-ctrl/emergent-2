import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";

export default function AdminContent() {
  const [content, setContent] = useState(null);
  useEffect(() => { api.get("/content").then(r => setContent(r.data)); }, []);
  if (!content) return <div className="text-[#9E9E98]">Loading…</div>;

  const save = async () => {
    await api.put("/content", content);
    toast.success("Content saved");
  };
  const update = (k, v) => setContent({...content, [k]: v});

  return (
    <div data-testid="admin-content">
      <div className="mb-8"><div className="eyebrow mb-2">EDITOR</div><h1 className="font-serif text-4xl text-[#F8F8F6]">Website Content</h1></div>
      <div className="grid gap-4 max-w-3xl">
        <div><label className="eyebrow block mb-2">Hero Title</label><input value={content.hero_title || ""} onChange={e => update("hero_title", e.target.value)} /></div>
        <div><label className="eyebrow block mb-2">Hero Subtitle</label><input value={content.hero_subtitle || ""} onChange={e => update("hero_subtitle", e.target.value)} data-testid="content-hero-subtitle" /></div>
        <div><label className="eyebrow block mb-2">About Us</label><textarea rows={5} value={content.about || ""} onChange={e => update("about", e.target.value)} /></div>
        <div><label className="eyebrow block mb-2">Footer Tagline</label><input value={content.footer_tagline || ""} onChange={e => update("footer_tagline", e.target.value)} /></div>

        <div className="admin-card">
          <div className="eyebrow mb-3">Contact Details</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-xs text-[#9E9E98]">Phone</label><input value={content.contact?.phone || ""} onChange={e => update("contact", {...(content.contact || {}), phone: e.target.value})} /></div>
            <div><label className="text-xs text-[#9E9E98]">WhatsApp (with country code)</label><input value={content.contact?.whatsapp || ""} onChange={e => update("contact", {...(content.contact || {}), whatsapp: e.target.value})} /></div>
            <div><label className="text-xs text-[#9E9E98]">Email</label><input value={content.contact?.email || ""} onChange={e => update("contact", {...(content.contact || {}), email: e.target.value})} /></div>
            <div><label className="text-xs text-[#9E9E98]">Website</label><input value={content.contact?.website || ""} onChange={e => update("contact", {...(content.contact || {}), website: e.target.value})} /></div>
            <div className="sm:col-span-2"><label className="text-xs text-[#9E9E98]">Address</label><input value={content.contact?.address || ""} onChange={e => update("contact", {...(content.contact || {}), address: e.target.value})} /></div>
          </div>
        </div>

        <div className="admin-card">
          <div className="eyebrow mb-3">Why Choose Us (JSON)</div>
          <textarea rows={8} className="font-mono text-xs" value={JSON.stringify(content.why_choose_us || [], null, 2)}
            onChange={e => { try { update("why_choose_us", JSON.parse(e.target.value)); } catch { /* ignore */ } }} />
        </div>

        <div className="admin-card">
          <div className="eyebrow mb-3">Applications (JSON)</div>
          <textarea rows={8} className="font-mono text-xs" value={JSON.stringify(content.applications || [], null, 2)}
            onChange={e => { try { update("applications", JSON.parse(e.target.value)); } catch { /* ignore */ } }} />
        </div>

        <div><label className="eyebrow block mb-2">SEO Title</label><input value={content.seo_title || ""} onChange={e => update("seo_title", e.target.value)} /></div>
        <div><label className="eyebrow block mb-2">SEO Description</label><textarea rows={2} value={content.seo_description || ""} onChange={e => update("seo_description", e.target.value)} /></div>

        <button onClick={save} className="btn-gold w-fit" data-testid="content-save">Save Content</button>
      </div>
    </div>
  );
}
