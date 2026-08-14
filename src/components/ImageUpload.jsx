import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

/** Compress image to data URL (max width 1200px) for localStorage */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Please select an image file"));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      reject(new Error("Image too large (max 4MB)"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1200;
        let { width, height } = img;
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ value, onChange, label = "Screenshot / Image" }) {
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      alert(err.message || "Could not load image");
    }
    e.target.value = "";
  };

  return (
    <div className="mb-4">
      <label className="label">{label}</label>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
          <img src={value} alt="Upload" className="w-full max-h-48 object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl py-8 flex flex-col items-center gap-2 text-slate-400 hover:border-brand-400 hover:text-brand-500 transition"
        >
          <ImagePlus className="w-8 h-8" />
          <span className="text-sm">Click to upload image</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
