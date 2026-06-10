import { useEffect, useState, useRef } from "react";
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
  const thumbRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (thumbRef.current) {
      const active = thumbRef.current.children[i] as HTMLElement | undefined;
      active?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [i]);

  if (!images.length) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95" onClick={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm text-white/70">{i + 1} / {images.length}</div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main image */}
      <div className="relative flex flex-1 items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setI((p) => (p - 1 + images.length) % images.length); }}
            className="absolute left-2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-4"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <img
          key={i}
          src={images[i]}
          alt=""
          className="max-h-[70vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
        />

        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setI((p) => (p + 1) % images.length); }}
            className="absolute right-2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-4"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="shrink-0 px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div
            ref={thumbRef}
            className="flex gap-2 overflow-x-auto pb-1 justify-center [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((src, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setI(idx); }}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition ${idx === i ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
