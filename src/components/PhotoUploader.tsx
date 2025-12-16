import { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';

interface PhotoUploaderProps {
    photos: string[];
    onPhotosChange: (photos: string[]) => void;
    maxPhotos?: number;
}

export function PhotoUploader({ photos, onPhotosChange, maxPhotos = 5 }: PhotoUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files) return;

        const remainingSlots = maxPhotos - photos.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    onPhotosChange([...photos, result]);
                };
                reader.readAsDataURL(file);
            }
        });
    }, [photos, onPhotosChange, maxPhotos]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const removePhoto = (index: number) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        onPhotosChange(newPhotos);
    };

    const canAddMore = photos.length < maxPhotos;

    return (
        <div className="space-y-3">
            {/* Upload Area */}
            {canAddMore && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                        ${isDragging
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
                        }
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                        <div className={`p-3 rounded-full ${isDragging ? 'bg-primary-100' : 'bg-slate-100'}`}>
                            <Upload className={`w-6 h-6 ${isDragging ? 'text-primary-600' : 'text-slate-500'}`} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-700">
                                Fotoğraf yüklemek için tıklayın
                            </p>
                            <p className="text-sm text-slate-500">
                                veya dosyaları buraya sürükleyin
                            </p>
                        </div>
                        <p className="text-xs text-slate-400">
                            PNG, JPG (max {maxPhotos} fotoğraf)
                        </p>
                    </div>
                </div>
            )}

            {/* Photo Grid */}
            {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {photos.map((photo, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                        >
                            <img
                                src={photo}
                                alt={`Fotoğraf ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                                <X className="w-3 h-3" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                                <span className="text-white text-xs font-medium">
                                    {index + 1}/{photos.length}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Add More Button */}
                    {canAddMore && photos.length > 0 && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-primary-400 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary-500 transition-colors"
                        >
                            <Camera className="w-6 h-6" />
                            <span className="text-xs font-medium">Ekle</span>
                        </button>
                    )}
                </div>
            )}

            {/* Photo count */}
            {photos.length > 0 && (
                <p className="text-xs text-slate-500 text-center">
                    {photos.length} / {maxPhotos} fotoğraf yüklendi
                </p>
            )}
        </div>
    );
}
