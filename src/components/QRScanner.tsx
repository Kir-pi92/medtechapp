import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Loader2, QrCode, AlertCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface QRScannerProps {
    onDataExtracted: (data: {
        deviceType?: string;
        brand?: string;
        model?: string;
        serialNumber?: string;
        tagNumber?: string;
        productionYear?: string;
        customerName?: string;
        department?: string;
    }) => void;
}

export function QRScanner({ onDataExtracted }: QRScannerProps) {
    const { t } = useLanguage();
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scannedUrl, setScannedUrl] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const startScanning = async () => {
        setError(null);
        setIsScanning(true);

        try {
            // Check if camera is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('NOT_SUPPORTED');
            }

            // Clean up existing instance if any
            if (scannerRef.current) {
                try {
                    await scannerRef.current.stop();
                    // await scannerRef.current.clear(); // clear() removes the element content, might break re-use if not careful
                } catch (e) {
                    // ignore
                }
            }

            const html5QrCode = new Html5Qrcode("qr-reader");
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                async (decodedText) => {
                    // Stop scanning
                    await html5QrCode.stop();
                    setIsScanning(false);
                    setScannedUrl(decodedText);

                    // Try to extract data from URL
                    if (decodedText.includes('saglik.gov.tr') || decodedText.includes('kno=')) {
                        await fetchAndParseData(decodedText);
                    } else {
                        setError(t('invalidQrCode'));
                    }
                },
                (errorMessage) => {
                    // verbose logging might fill console, but useful for debug
                    // console.warn(errorMessage);
                }
            );
        } catch (err: any) {
            setIsScanning(false);
            console.error('QR Scanner error:', err);

            let msg = t('cameraAccessDenied');
            if (err.message === 'NOT_SUPPORTED') {
                msg = t('cameraNotSupported');
            } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                msg = t('cameraPermissionDenied');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                msg = t('cameraNotFound');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                msg = t('cameraInUse');
            }

            setError(msg);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch (e) {
                console.error('Error stopping scanner:', e);
            }
        }
        setIsScanning(false);
    };

    const fetchAndParseData = async (url: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // Extract kno from URL
            const knoMatch = url.match(/kno=(\d+)/);
            if (!knoMatch) {
                throw new Error('Invalid QR URL format');
            }

            const kno = knoMatch[1];

            // Use relative path for proxy
            const proxyUrl = `/api/device/${kno}`;

            const response = await fetch(proxyUrl);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch data');
            }

            const data = result.data;

            // Map to our form fields
            const extractedData = {
                deviceType: mapDeviceType(data.deviceType || data.materialDescription || ''),
                brand: data.brand || '',
                model: data.model || '',
                serialNumber: data.serialNumber || '',
                tagNumber: data.kimlikNo || kno,
                productionYear: data.productionYear || data.uretimYili || '',
                customerName: data.institutionName || '',
                department: data.assigneeLocation || data.location || '',
            };

            onDataExtracted(extractedData);
            setIsLoading(false);
            setScannedUrl(null);

        } catch (err) {
            console.error('Fetch error:', err);
            setError(t('fetchError'));
            setIsLoading(false);
        }
    };

    const manualFetch = async () => {
        if (!scannedUrl) return;
        await fetchAndParseData(scannedUrl);
    };

    // Map Turkish device types to our device types
    const mapDeviceType = (turkishType: string): string => {
        const typeMap: Record<string, string> = {
            'EKG': 'ECG Machine',
            'ELEKTRO KARDİYO GRAFİ': 'ECG Machine',
            'HASTA MONİTÖRÜ': 'Patient Monitor',
            'MONİTÖR': 'Patient Monitor',
            'DEFİBRİLATÖR': 'Defibrillator',
            'VENTİLATÖR': 'Ventilator',
            'SOLUNUM': 'Ventilator',
            'İNFÜZYON POMPASI': 'Infusion Pump',
            'POMPA': 'Infusion Pump',
            'ULTRASON': 'Ultrasound',
            'X-RAY': 'X-Ray',
            'RÖNTGEN': 'X-Ray',
        };

        const upperType = turkishType.toUpperCase();
        for (const [key, value] of Object.entries(typeMap)) {
            if (upperType.includes(key)) {
                return value;
            }
        }
        return 'Other';
    };

    return (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200 print:hidden">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-violet-600" />
                    <h4 className="font-semibold text-violet-900">{t('qrScanner')}</h4>
                </div>

                {!isScanning && !isLoading && (
                    <button
                        type="button"
                        onClick={startScanning}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <Camera className="w-4 h-4" />
                        {t('scanQrCode')}
                    </button>
                )}

                {isScanning && (
                    <button
                        type="button"
                        onClick={stopScanning}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <X className="w-4 h-4" />
                        {t('stopScanning')}
                    </button>
                )}
            </div>

            <p className="text-sm text-violet-600 mb-3">{t('qrScannerDescription')}</p>

            {/* Scanner Container */}
            <div
                ref={containerRef}
                id="qr-reader"
                className={`rounded-lg overflow-hidden bg-black ${isScanning ? 'block' : 'hidden'}`}
                style={{ minHeight: isScanning ? '300px' : '0' }}
            />

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center gap-3 py-8 bg-white rounded-lg border border-violet-200">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                    <span className="text-violet-700">{t('fetchingDeviceData')}</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mt-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-red-700 text-sm">{error}</p>
                        {scannedUrl && (
                            <div className="mt-2">
                                <p className="text-xs text-red-600 mb-1">URL: {scannedUrl}</p>
                                <button
                                    type="button"
                                    onClick={manualFetch}
                                    className="text-xs text-red-700 underline hover:no-underline"
                                >
                                    {t('retryFetch')}
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => { setError(null); setScannedUrl(null); }}
                        className="p-1 text-red-400 hover:text-red-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Manual URL Entry */}
            {!isScanning && !isLoading && !error && (
                <div className="mt-3 pt-3 border-t border-violet-200">
                    <details className="text-sm">
                        <summary className="text-violet-600 cursor-pointer hover:text-violet-800">
                            {t('manualUrlEntry')}
                        </summary>
                        <div className="mt-2 flex gap-2">
                            <input
                                type="text"
                                placeholder="https://sbu2.saglik.gov.tr/QR/QR.aspx?kno=..."
                                value={scannedUrl || ''}
                                onChange={(e) => setScannedUrl(e.target.value)}
                                className="flex-1 rounded-lg border border-violet-300 p-2 text-sm"
                            />
                            <button
                                type="button"
                                onClick={manualFetch}
                                disabled={!scannedUrl}
                                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                {t('fetchData')}
                            </button>
                        </div>
                    </details>
                </div>
            )}
        </div>
    );
}
