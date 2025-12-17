import { useRef, useEffect, useState } from 'react';
import { Eraser, Check, X, Upload } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface SignaturePadProps {
    onSave: (signature: string) => void;
    onClear?: () => void;
    initialSignature?: string | null;
    label: string;
    signerName?: string;
}

export function SignaturePad({ onSave, onClear, initialSignature, label, signerName }: SignaturePadProps) {
    const { t } = useLanguage();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(!!initialSignature);
    const [showCanvas, setShowCanvas] = useState(!initialSignature);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);

        // Set drawing style
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw signature line
        ctx.beginPath();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(20, rect.height - 20);
        ctx.lineTo(rect.width - 20, rect.height - 20);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
    }, [showCanvas]);

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();

        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const coords = getCoordinates(e);
        if (!coords) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();

        const coords = getCoordinates(e);
        if (!coords) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw signature line
        ctx.beginPath();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(20, rect.height - 20);
        ctx.lineTo(rect.width - 20, rect.height - 20);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;

        setHasSignature(false);
        onClear?.();
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const signature = canvas.toDataURL('image/png');
        onSave(signature);
        setShowCanvas(false);
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const signature = event.target?.result as string;
            if (signature) {
                onSave(signature);
                setShowCanvas(false);
            }
        };
        reader.readAsDataURL(file);
    };

    if (!showCanvas && initialSignature) {
        return (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    <button
                        type="button"
                        onClick={() => {
                            setShowCanvas(true);
                            setHasSignature(false);
                        }}
                        className="text-xs text-primary-600 hover:text-primary-700"
                    >
                        Yeniden İmzala
                    </button>
                </div>
                {signerName && (
                    <p className="text-sm text-slate-600 mb-2">{signerName}</p>
                )}
                <img
                    src={initialSignature}
                    alt="İmza"
                    className="max-h-20 mx-auto"
                />
            </div>
        );
    }

    return (
        <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                {signerName && (
                    <span className="text-xs text-slate-500">{signerName}</span>
                )}
            </div>

            <div className="relative">
                <canvas
                    ref={canvasRef}
                    className="w-full h-32 border border-slate-300 rounded-lg cursor-crosshair bg-white touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />

                {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-slate-400 text-sm">{t('signHere')}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2 mt-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileUpload}
                />
                <button
                    type="button"
                    onClick={clearCanvas}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors border border-slate-200"
                >
                    <Eraser className="w-4 h-4" />
                    Temizle
                </button>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-medium transition-colors border border-primary-200"
                >
                    <Upload className="w-4 h-4" />
                    {t('uploadSignature')}
                </button>
                <button
                    type="button"
                    onClick={saveSignature}
                    disabled={!hasSignature}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <Check className="w-4 h-4" />
                    Kaydet
                </button>
            </div>
        </div>
    );
}
