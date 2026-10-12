"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Crop,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

export type AspectRatioOption = "4:5" | "1:1" | "3:4" | "16:9" | "original";

interface RatioConfig {
  id: AspectRatioOption;
  label: string;
  badge?: string;
  getRatio: (naturalW: number, naturalH: number) => number;
}

const RATIO_OPTIONS: RatioConfig[] = [
  {
    id: "4:5",
    label: "4:5",
    badge: "Dating",
    getRatio: () => 4 / 5,
  },
  {
    id: "1:1",
    label: "1:1",
    badge: "Square",
    getRatio: () => 1,
  },
  {
    id: "3:4",
    label: "3:4",
    badge: "Portrait",
    getRatio: () => 3 / 4,
  },
  {
    id: "16:9",
    label: "16:9",
    badge: "Wide",
    getRatio: () => 16 / 9,
  },
  {
    id: "original",
    label: "Original",
    badge: "Free",
    getRatio: (w, h) => (h > 0 ? w / h : 1),
  },
];

interface ImageCropModalProps {
  isOpen: boolean;
  file: File | null;
  initialAspectRatio?: AspectRatioOption;
  onCropComplete: (croppedFile: File) => void | Promise<void>;
  onCancel: () => void;
  title?: string;
}

export function ImageCropModal({
  isOpen,
  file,
  initialAspectRatio = "4:5",
  onCropComplete,
  onCancel,
  title = "Adjust & Crop Photo",
}: ImageCropModalProps) {
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioOption>(initialAspectRatio);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; startPanX: number; startPanY: number }>({
    pointerX: 0,
    pointerY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  // Load image object URL whenever file changes
  useEffect(() => {
    if (!file) {
      setImageSrc(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setSelectedRatio(initialAspectRatio);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, initialAspectRatio]);

  // Handle image load to extract natural dimensions
  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Calculate crop frame dimensions inside the preview viewport
  // Viewport box is roughly 340x340 on mobile, 380x380 on desktop
  const currentRatioValue = (() => {
    const matched = RATIO_OPTIONS.find((r) => r.id === selectedRatio);
    return matched ? matched.getRatio(naturalSize.width, naturalSize.height) : 4 / 5;
  })();

  const maxFrameDimension = 320;
  const frameDimensions = (() => {
    const r = currentRatioValue;
    if (r >= 1) {
      const width = maxFrameDimension;
      const height = Math.round(width / r);
      return { width, height };
    } else {
      const height = maxFrameDimension;
      const width = Math.round(height * r);
      return { width, height };
    }
  })();

  // Pan boundary clamping helper
  const clampPan = useCallback(
    (nextX: number, nextY: number, curZoom = zoom, curRot = rotation) => {
      if (naturalSize.width === 0 || naturalSize.height === 0) return { x: 0, y: 0 };

      const isSwapped = curRot % 180 !== 0;
      const orientedW = isSwapped ? naturalSize.height : naturalSize.width;
      const orientedH = isSwapped ? naturalSize.width : naturalSize.height;

      const baseScale = Math.max(
        frameDimensions.width / orientedW,
        frameDimensions.height / orientedH
      );

      const renderedW = orientedW * baseScale * curZoom;
      const renderedH = orientedH * baseScale * curZoom;

      const maxPanX = Math.max(0, (renderedW - frameDimensions.width) / 2);
      const maxPanY = Math.max(0, (renderedH - frameDimensions.height) / 2);

      return {
        x: Math.min(maxPanX, Math.max(-maxPanX, nextX)),
        y: Math.min(maxPanY, Math.max(-maxPanY, nextY)),
      };
    },
    [naturalSize, frameDimensions, zoom, rotation]
  );

  // Re-clamp pan whenever frameDimensions, zoom, or rotation change
  useEffect(() => {
    setPan((prev) => clampPan(prev.x, prev.y));
  }, [clampPan]);

  // Pointer drag event handlers for mouse + touch
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.pointerX;
    const deltaY = e.clientY - dragStartRef.current.pointerY;
    const nextPan = clampPan(
      dragStartRef.current.startPanX + deltaX,
      dragStartRef.current.startPanY + deltaY
    );
    setPan(nextPan);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if already released
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomStep = e.deltaY < 0 ? 0.08 : -0.08;
    const nextZoom = Math.min(3, Math.max(1, zoom + zoomStep));
    setZoom(nextZoom);
    setPan((prev) => clampPan(prev.x, prev.y, nextZoom, rotation));
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    setPan((prev) => clampPan(prev.x, prev.y, zoom, nextRot));
  };

  // Reset adjustments
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Render crop to Canvas and emit standard File
  const handleApplyCrop = async () => {
    if (!imgRef.current || !file || naturalSize.width === 0) return;
    setIsProcessing(true);

    try {
      const img = imgRef.current;
      const isSwapped = rotation % 180 !== 0;
      const orientedW = isSwapped ? naturalSize.height : naturalSize.width;
      const orientedH = isSwapped ? naturalSize.width : naturalSize.height;

      // Base export resolution
      let targetW = 1080;
      let targetH = Math.round(targetW / currentRatioValue);
      if (targetH > 1440) {
        targetH = 1440;
        targetW = Math.round(targetH * currentRatioValue);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize image crop canvas.");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);

      const canvasScale = targetW / frameDimensions.width;
      const screenCenterX = frameDimensions.width / 2 + pan.x;
      const screenCenterY = frameDimensions.height / 2 + pan.y;

      const baseScale = Math.max(
        frameDimensions.width / orientedW,
        frameDimensions.height / orientedH
      );

      ctx.save();
      ctx.translate(screenCenterX * canvasScale, screenCenterY * canvasScale);
      ctx.rotate((rotation * Math.PI) / 180);

      const drawW = naturalSize.width * baseScale * zoom * canvasScale;
      const drawH = naturalSize.height * baseScale * zoom * canvasScale;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92);
      });

      if (!blob) throw new Error("Failed to process cropped photo.");

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const croppedFile = new File([blob], `${baseName}-cropped.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      await onCropComplete(croppedFile);
    } catch (err) {
      console.error("Cropping error:", err);
      alert(err instanceof Error ? err.message : "Could not crop photo");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  const isSwapped = rotation % 180 !== 0;
  const orientedW = isSwapped ? naturalSize.height : naturalSize.width;
  const orientedH = isSwapped ? naturalSize.width : naturalSize.height;
  const baseScale =
    orientedW > 0 && orientedH > 0
      ? Math.max(frameDimensions.width / orientedW, frameDimensions.height / orientedH)
      : 1;

  const displayedImageW = naturalSize.width * baseScale * zoom;
  const displayedImageH = naturalSize.height * baseScale * zoom;

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[95dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#9e1b22] flex items-center justify-center">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                {title}
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500">
                Choose ratio, zoom, and drag to position
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ratio Selector Buttons */}
        <div className="px-4 py-3 bg-stone-50/80 border-b border-stone-100 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Select Aspect Ratio
            </span>
            <span className="text-[11px] text-[#9e1b22] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Optimal Framing
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {RATIO_OPTIONS.map((opt) => {
              const isSelected = selectedRatio === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedRatio(opt.id)}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center border ${
                    isSelected
                      ? "bg-[#9e1b22] text-white border-[#9e1b22] shadow-sm shadow-[#9e1b22]/30"
                      : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <span className="text-xs font-black">{opt.label}</span>
                  <span
                    className={`text-[9px] uppercase tracking-wider font-semibold ${
                      isSelected ? "text-red-100" : "text-stone-400"
                    }`}
                  >
                    {opt.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Viewport Area with Crop Frame */}
        <div
          ref={containerRef}
          className="relative bg-stone-950 flex-1 min-h-[300px] sm:min-h-[350px] flex items-center justify-center overflow-hidden select-none p-4"
          onWheel={handleWheel}
        >
          {/* Crop Frame (The visible crop aperture) */}
          <div
            style={{
              width: `${frameDimensions.width}px`,
              height: `${frameDimensions.height}px`,
              touchAction: "none",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative overflow-hidden cursor-grab active:cursor-grabbing rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] transition-[width,height] duration-200 ${
              isDragging ? "ring-2 ring-[#ea580c]" : ""
            }`}
          >
            {/* The Image */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: `${displayedImageW}px`,
                height: `${displayedImageH}px`,
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
                pointerEvents: "none",
              }}
              className="flex items-center justify-center"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={handleImageLoaded}
                className="w-full h-full object-fill pointer-events-none"
                draggable={false}
              />
            </div>

            {/* Rule of Thirds Guide Grid */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Subtle center hint when not dragged */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white/40" />
            </div>
          </div>

          <div className="absolute bottom-2 text-center pointer-events-none">
            <span className="text-[10px] text-white/60 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
              Drag photo to reposition • Scroll or use slider to zoom
            </span>
          </div>
        </div>

        {/* Controls Toolbar: Zoom, Rotate, Reset */}
        <div className="p-3 sm:px-5 sm:py-3.5 bg-stone-50 border-t border-stone-200 shrink-0 space-y-2.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const nextZoom = Math.max(1, zoom - 0.2);
                setZoom(nextZoom);
                setPan((prev) => clampPan(prev.x, prev.y, nextZoom, rotation));
              }}
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="3"
                step="0.02"
                value={zoom}
                onChange={(e) => {
                  const nextZoom = parseFloat(e.target.value);
                  setZoom(nextZoom);
                  setPan((prev) => clampPan(prev.x, prev.y, nextZoom, rotation));
                }}
                className="w-full accent-[#9e1b22] cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-stone-700 w-9 text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextZoom = Math.min(3, zoom + 0.2);
                setZoom(nextZoom);
                setPan((prev) => clampPan(prev.x, prev.y, nextZoom, rotation));
              }}
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-stone-300 mx-1" />

            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-200 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Rotate 90° clockwise"
            >
              <RotateCw className="w-4 h-4 text-[#ea580c]" />
              <span className="hidden sm:inline">Rotate</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-200 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Reset position"
            >
              <RotateCcw className="w-4 h-4 text-stone-500" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-700 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#9e1b22] hover:bg-[#85161c] text-white shadow-md shadow-[#9e1b22]/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Cropping...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Done &amp; Upload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
