// Minimalist Secure Workspace — image handling stays local, bounded, and reversible before persistence.
import { useEffect, useMemo, useRef, useState } from "react";
import { Crop, LoaderCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

const VIEWPORT_SIZE = 280;
const OUTPUT_SIZE = 180;
const MAX_OUTPUT_BYTES = 100_000;

type ProfileImageCropDialogProps = {
  file: File | null;
  onCancel: () => void;
  onApply: (dataURL: string) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function ProfileImageCropDialog({ file, onCancel, onApply }: ProfileImageCropDialogProps) {
  const [source, setSource] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const dragRef = useRef({ pointerX: 0, pointerY: 0, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    if (!file) {
      setSource(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSource(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setImageSize({ width: 0, height: 0 });
  }, [file]);

  const baseScale = imageSize.width && imageSize.height ? Math.max(VIEWPORT_SIZE / imageSize.width, VIEWPORT_SIZE / imageSize.height) : 1;
  const renderedWidth = imageSize.width * baseScale * zoom;
  const renderedHeight = imageSize.height * baseScale * zoom;
  const maxOffsetX = Math.max(0, (renderedWidth - VIEWPORT_SIZE) / 2);
  const maxOffsetY = Math.max(0, (renderedHeight - VIEWPORT_SIZE) / 2);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, offsetX: offset.x, offsetY: offset.y };
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset({
      x: clamp(dragRef.current.offsetX + event.clientX - dragRef.current.pointerX, -maxOffsetX, maxOffsetX),
      y: clamp(dragRef.current.offsetY + event.clientY - dragRef.current.pointerY, -maxOffsetY, maxOffsetY),
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  };

  const crop = async () => {
    if (!source || !imageSize.width || !imageSize.height) return;
    setProcessing(true);
    try {
      const image = new Image();
      image.src = source;
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Gambar tidak dapat dibaca.")); });
      const renderScale = baseScale * zoom;
      const cropSourceSize = VIEWPORT_SIZE / renderScale;
      const sourceX = clamp((imageSize.width - cropSourceSize) / 2 - offset.x / renderScale, 0, Math.max(0, imageSize.width - cropSourceSize));
      const sourceY = clamp((imageSize.height - cropSourceSize) / 2 - offset.y / renderScale, 0, Math.max(0, imageSize.height - cropSourceSize));
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas browser tidak tersedia.");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, sourceX, sourceY, cropSourceSize, cropSourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      let quality = 0.84;
      let dataURL = canvas.toDataURL("image/jpeg", quality);
      while (dataURL.length * 0.75 > MAX_OUTPUT_BYTES && quality > 0.48) {
        quality -= 0.08;
        dataURL = canvas.toDataURL("image/jpeg", quality);
      }
      onApply(dataURL);
    } catch (error) {
      onCancel();
    } finally {
      setProcessing(false);
    }
  };

  const cropStyle = useMemo(() => ({ width: renderedWidth, height: renderedHeight, left: `calc(50% + ${offset.x}px)`, top: `calc(50% + ${offset.y}px)` }), [renderedHeight, renderedWidth, offset]);

  return (
    <Dialog open={Boolean(file)} onOpenChange={open => { if (!open && !processing) onCancel(); }}>
      <DialogContent className="profile-crop-dialog" aria-describedby="profile-crop-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Crop className="size-4 text-[#1FACFF]" />Crop foto profil</DialogTitle>
          <DialogDescription id="profile-crop-description">Geser gambar di dalam kotak, lalu atur zoom. Hasil disimpan sebagai JPEG kecil di browser.</DialogDescription>
        </DialogHeader>
        <div className={`profile-crop-viewport ${dragging ? "dragging" : ""}`} role="application" aria-label="Area crop foto profil" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
          {source && <img src={source} alt="Pratinjau foto yang sedang dipotong" className="profile-crop-image" style={cropStyle} onLoad={event => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} draggable={false} />}
          <div className="profile-crop-guide" aria-hidden="true" />
        </div>
        <div className="profile-crop-controls">
          <label htmlFor="profile-crop-zoom" className="profile-crop-label">Zoom <span>{zoom.toFixed(1)}×</span></label>
          <Slider id="profile-crop-zoom" min={1} max={3} step={0.05} value={[zoom]} onValueChange={value => { const nextZoom = value[0] ?? 1; setZoom(nextZoom); setOffset(current => ({ x: clamp(current.x, -Math.max(0, (renderedWidth / zoom * nextZoom - VIEWPORT_SIZE) / 2), Math.max(0, (renderedWidth / zoom * nextZoom - VIEWPORT_SIZE) / 2)), y: clamp(current.y, -Math.max(0, (renderedHeight / zoom * nextZoom - VIEWPORT_SIZE) / 2), Math.max(0, (renderedHeight / zoom * nextZoom - VIEWPORT_SIZE) / 2)) })); }} aria-label="Zoom foto profil" />
          <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}><RotateCcw className="mr-2 size-3.5" />Reset crop</Button>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>Batal</Button>
          <Button type="button" className="bg-[#1FACFF] text-white hover:bg-[#0D8DDB]" onClick={crop} disabled={processing || !imageSize.width}>{processing ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Crop className="mr-2 size-4" />}{processing ? "Memproses..." : "Gunakan foto"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
