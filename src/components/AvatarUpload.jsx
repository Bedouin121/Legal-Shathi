import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { Camera, X, ZoomIn, ZoomOut, RotateCw, Check, User } from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });

async function getCroppedBlob(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(
    image,
    safeArea / 2 - image.width / 2,
    safeArea / 2 - image.height / 2
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
}

// ─── component ──────────────────────────────────────────────────────────────

/**
 * AvatarUpload
 *
 * Props:
 *   value      – current preview data-URL (or null)
 *   onChange   – called with a File when the user confirms a crop
 *   onClear    – called when the user removes the picture
 *   disabled   – disables all interactions
 *   size       – avatar circle diameter in px (default 96)
 */
const AvatarUpload = ({
  value = null,
  onChange,
  onClear,
  disabled = false,
  size = 96,
}) => {
  const fileInputRef = useRef(null);

  // raw src fed into the cropper
  const [rawSrc, setRawSrc] = useState(null);

  // cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Please choose an image under 10 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRawSrc(reader.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
    // reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleConfirm = async () => {
    if (!rawSrc || !croppedAreaPixels) return;
    const blob = await getCroppedBlob(rawSrc, croppedAreaPixels, rotation);
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    onChange?.(file, URL.createObjectURL(blob));
    setRawSrc(null);
  };

  const handleCancel = () => {
    setRawSrc(null);
  };

  const handleClear = () => {
    onClear?.();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {/* ── Avatar circle + trigger ── */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative group"
          style={{ width: size, height: size }}
        >
          {/* Circle */}
          <div
            className="w-full h-full rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-border"
            style={{ width: size, height: size }}
          >
            {value ? (
              <img
                src={value}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <User
                className="text-primary/50"
                style={{ width: size * 0.42, height: size * 0.42 }}
              />
            )}
          </div>

          {/* Hover overlay — click to pick file */}
          {!disabled && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              aria-label="Upload profile picture"
            >
              <Camera className="text-white" style={{ width: size * 0.28, height: size * 0.28 }} />
            </button>
          )}

          {/* Remove badge */}
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-md hover:bg-destructive/80 transition-colors"
              aria-label="Remove picture"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Label */}
        <button
          type="button"
          onClick={() => !disabled && fileInputRef.current?.click()}
          disabled={disabled}
          className="text-xs font-medium text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {value ? "Change photo" : "Add profile photo"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* ── Crop modal ── */}
      {rawSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Crop your photo"
        >
          <div className="w-full max-w-sm bg-card rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Crop your photo</h2>
              <button
                type="button"
                onClick={handleCancel}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Cancel"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Cropper area */}
            <div className="relative bg-black" style={{ height: 280 }}>
              <Cropper
                image={rawSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="px-4 py-3 space-y-3 border-t border-border bg-card">
              {/* Zoom */}
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-primary h-1.5 rounded-full cursor-pointer"
                  aria-label="Zoom"
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>

              {/* Rotate */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Rotate</span>
                <div className="flex gap-1">
                  {[-90, -45, -15, 15, 45, 90].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() =>
                        setRotation((r) => {
                          const next = (r + deg) % 360;
                          return next < 0 ? next + 360 : next;
                        })
                      }
                      className="px-2 py-1 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                    >
                      {deg > 0 ? `+${deg}°` : `${deg}°`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Use Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AvatarUpload;
