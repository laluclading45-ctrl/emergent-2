import { useEffect, useState } from "react";
import { api, fileUrl } from "../lib/api";
import { Dialog, DialogContent } from "../components/ui/dialog";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(null);
  useEffect(() => { api.get("/projects").then(r => setProjects(r.data)); }, []);

  return (
    <div data-testid="projects-page" className="pb-32">
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="eyebrow mb-4"><span className="gold-line" /> SIGNATURE PROJECTS</div>
        <h1 className="font-serif text-5xl lg:text-7xl text-[#F8F8F6] leading-[1] mb-6">Executed with precision.</h1>
        <p className="text-[#9E9E98] max-w-2xl">A curated selection of architectural envelopes and interior boiserie delivered across India.</p>
      </section>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-6">
        {projects.map(p => (
          <button key={p.id} onClick={() => setOpen(p)} data-testid={`project-${p.id}`}
            className="text-left relative aspect-[3/2] overflow-hidden card-gold group">
            <img src={fileUrl(p.cover_image)} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E] via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <div className="eyebrow mb-2">CASE STUDY</div>
              <h3 className="font-serif text-2xl lg:text-3xl text-[#F8F8F6]">{p.title}</h3>
              <p className="text-sm text-[#9E9E98] mt-2 max-w-md line-clamp-2">{p.description}</p>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-w-4xl bg-[#0B0C0E] border-white/10 text-[#F8F8F6]">
          {open && (
            <div>
              <h2 className="font-serif text-3xl mb-2">{open.title}</h2>
              <p className="text-[#9E9E98] mb-6">{open.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <img src={fileUrl(open.cover_image)} alt="" className="w-full aspect-[4/3] object-cover" />
                {(open.images || []).map((im, i) => (
                  <img key={i} src={fileUrl(im)} alt="" className="w-full aspect-[4/3] object-cover" />
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
