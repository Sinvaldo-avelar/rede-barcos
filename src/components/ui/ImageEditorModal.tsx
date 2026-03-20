"use client";

import { useCallback, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

type ImageEditorModalProps = {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSave: (blob: Blob, fileName: string) => Promise<void> | void;
};

type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = src;
  });
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function getRotatedSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getEditedImageBlob({
  imageSrc,
  pixelCrop,
  rotation,
  outputWidth,
  outputHeight,
}: {
  imageSrc: string;
  pixelCrop: PixelCrop;
  rotation: number;
  outputWidth: number;
  outputHeight: number;
}): Promise<Blob> {
  const image = await createImage(imageSrc);
  const rotRad = getRadianAngle(rotation);

  const rotatedSize = getRotatedSize(image.width, image.height, rotation);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Não foi possível inicializar o canvas.");
  }

  canvas.width = rotatedSize.width;
  canvas.height = rotatedSize.height;

  ctx.translate(rotatedSize.width / 2, rotatedSize.height / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const cropCanvas = document.createElement("canvas");
  const cropCtx = cropCanvas.getContext("2d");

  if (!cropCtx) {
    throw new Error("Não foi possível inicializar o canvas de recorte.");
  }

  const safeOutputWidth = Math.max(200, Number(outputWidth) || pixelCrop.width);
  const safeOutputHeight = Math.max(
    200,
    Number(outputHeight) || Math.round((pixelCrop.height * safeOutputWidth) / pixelCrop.width)
  );

  cropCanvas.width = safeOutputWidth;
  cropCanvas.height = safeOutputHeight;

  cropCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    safeOutputWidth,
    safeOutputHeight
  );

  return new Promise((resolve, reject) => {
    cropCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Falha ao gerar imagem editada."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.92
    );
  });
}

export default function ImageEditorModal({ open, imageSrc, onClose, onSave }: ImageEditorModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [outputWidth, setOutputWidth] = useState(1200);
  const [outputHeight, setOutputHeight] = useState(675);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const aspect = useMemo(() => 16 / 9, []);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleSave = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setSaving(true);
      const blob = await getEditedImageBlob({
        imageSrc,
        pixelCrop: {
          x: Math.round(croppedAreaPixels.x),
          y: Math.round(croppedAreaPixels.y),
          width: Math.round(croppedAreaPixels.width),
          height: Math.round(croppedAreaPixels.height),
        },
        rotation,
        outputWidth,
        outputHeight,
      });

      await onSave(blob, `editada-${Date.now()}.jpg`);
    } finally {
      setSaving(false);
    }
  }, [croppedAreaPixels, imageSrc, onSave, outputHeight, outputWidth, rotation]);

  if (!open || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-130 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-black text-slate-900">Editor de imagem</h2>
          <p className="text-xs text-slate-500 mt-1">Use corte livre, rotação e tamanho de saída antes de enviar.</p>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          <div className="relative w-full h-[48vh] min-h-72 bg-slate-900 rounded-xl overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full"
              />
              <input
                type="number"
                min={100}
                max={300}
                step={1}
                value={Math.round(zoom * 100)}
                onChange={(event) => {
                  const zoomPercent = Number(event.target.value);
                  const zoomValue = Math.min(3, Math.max(1, zoomPercent / 100));
                  setZoom(zoomValue);
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Girar</label>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(event) => setRotation(Number(event.target.value))}
                className="w-full"
              />
              <input
                type="number"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setRotation(Math.min(180, Math.max(-180, value)));
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Largura (px)</label>
              <input
                type="number"
                min={200}
                step={10}
                value={outputWidth}
                onChange={(event) => setOutputWidth(Number(event.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Altura (px)</label>
              <input
                type="number"
                min={200}
                step={10}
                value={outputHeight}
                onChange={(event) => setOutputHeight(Number(event.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !croppedAreaPixels}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar imagem"}
          </button>
        </div>
      </div>
    </div>
  );
}
