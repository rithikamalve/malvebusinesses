import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function Lightbox({
  images,
  index,
  onClose,
}: {
  images: string[];
  index: number;
  onClose: () => void;
}) {
  const [i, setI] = useState(index);
  useEffect(() => setI(index), [index]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((p) => (p + 1) % images.length);
      if (e.key === "ArrowLeft") setI((p) => (p - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  if (!images.length) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
        <X className="h-5 w-5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); setI((p) => (p - 1 + images.length) % images.length); }}
        className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <img
        src={images[i]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      />
      <button
        onClick={(e) => { e.stopPropagation(); setI((p) => (p + 1) % images.length); }}
        className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/80">{i + 1} / {images.length}</div>
    </div>
  );
}
