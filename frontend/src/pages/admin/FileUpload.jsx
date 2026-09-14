import { useRef, useState } from "react";
import { api, fileUrl } from "../../lib/api";
import { Upload, X, FileText, Box } from "lucide-react";
import { toast } from "sonner";

const uploadOne = async (file, onProgress) => {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post("/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / (e.total || 1))),
  });
  return data;
};

export function FileUpload({ value, onChange, accept = "image/*", label = "Upload", testid }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);

  const doUpload = async (file) => {
    if (!file) return;
    setBusy(true); setProgress(0);
    try {
      const data = await uploadOne(file, setProgress);
      onChange(data.url);
      toast.success("Uploaded");
    } catch (err) {
      const d = err.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Upload failed — click to retry");
    } finally { setBusy(false); setProgress(0); if (ref.current) ref.current.value = ""; }
  };

  const pick = (e) => doUpload(e.target.files?.[0]);
  const onDrop = (e) => { e.preventDefault(); setDrag(false); doUpload(e.dataTransfer.files?.[0]); };

  const isImg = accept.includes("image") && value && !value.match(/\.(glb|gltf|pdf)/i);
  const isPdf = value && value.match(/\.pdf/i);
  const isModel = value && value.match(/\.(glb|gltf)/i);

  return (
    <div>
      {value ? (
        <div className="relative inline-block w-full">
          {isImg ? (
            <img src={fileUrl(value)} alt="" className="w-28 h-28 object-cover border border-white/10" />
          ) : (
            <div className="flex items-center gap-2 p-3 border border-white/10 text-xs text-[#9E9E98]">
              {isPdf && <FileText size={14} className="text-[#D4AF37]" />}
              {isModel && <Box size={14} className="text-[#D4AF37]" />}
              <a href={fileUrl(value)} target="_blank" rel="noreferrer" className="text-[#D4AF37] underline break-all">{value.split("/").pop()}</a>
            </div>
          )}
          <button type="button" onClick={() => onChange("")} data-testid={`${testid}-remove`}
            className="absolute -top-2 -right-2 w-6 h-6 bg-[#D4AF37] text-[#0B0C0E] rounded-full flex items-center justify-center">
            <X size={12} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} disabled={busy} data-testid={testid}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`w-full border border-dashed px-4 py-4 flex flex-col items-center justify-center gap-1 text-sm transition-colors ${drag ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-white/20 hover:border-[#D4AF37]"} text-[#9E9E98] disabled:opacity-60`}>
          {busy ? (
            <>
              <div className="text-xs text-[#D4AF37]">{progress}%</div>
              <div className="w-full h-1 bg-white/10"><div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${progress}%` }} /></div>
            </>
          ) : (
            <>
              <Upload size={16} className="text-[#D4AF37]" />
              <span>{label}</span>
              <span className="text-[10px]">Drag & drop or click to browse</span>
            </>
          )}
        </button>
      )}
      <input ref={ref} type="file" accept={accept} onChange={pick} className="hidden" />
    </div>
  );
}

export function MultiImageUpload({ value = [], onChange, testid }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);

  const doUpload = async (files) => {
    if (!files.length) return;
    setBusy(true);
    const urls = [...value];
    for (let i = 0; i < files.length; i++) {
      try {
        const data = await uploadOne(files[i], (p) => setProgress(Math.round(((i + p / 100) / files.length) * 100)));
        urls.push(data.url);
      } catch { toast.error(`Upload failed: ${files[i].name}`); }
    }
    onChange(urls);
    toast.success(urls.length > value.length ? "Images uploaded" : "Upload complete");
    setBusy(false); setProgress(0);
    if (ref.current) ref.current.value = "";
  };

  const onDrop = (e) => { e.preventDefault(); setDrag(false); doUpload(Array.from(e.dataTransfer.files || [])); };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((u, i) => (
          <div key={i} className="relative">
            <img src={fileUrl(u)} alt="" className="w-20 h-20 object-cover border border-white/10" />
            <button type="button" onClick={() => onChange(value.filter((_, x) => x !== i))} data-testid={`${testid}-remove-${i}`}
              className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-[#0B0C0E] rounded-full flex items-center justify-center">
              <X size={10} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => ref.current?.click()} disabled={busy} data-testid={testid}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`w-20 h-20 border border-dashed flex flex-col items-center justify-center gap-1 text-[#9E9E98] transition-colors ${drag ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-white/20 hover:border-[#D4AF37]"} disabled:opacity-60`}>
          {busy ? <span className="text-[10px] text-[#D4AF37]">{progress}%</span> : <><Upload size={16} className="text-[#D4AF37]" /><span className="text-[9px]">Add</span></>}
        </button>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple onChange={(e) => doUpload(Array.from(e.target.files || []))} className="hidden" />
      {busy && (
        <div className="w-full h-1 bg-white/10"><div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${progress}%` }} /></div>
      )}
      <div className="text-[10px] text-[#9E9E98]">Drag & drop multiple images or click to browse. First image becomes the main image if none set.</div>
    </div>
  );
}
