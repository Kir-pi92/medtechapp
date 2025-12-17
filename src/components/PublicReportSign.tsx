import { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { publicApi } from '../api';
import { SignaturePad } from './SignaturePad';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface PublicReportSignProps {
    token: string;
}

export function PublicReportSign({ token }: PublicReportSignProps) {
    const { t } = useLanguage();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [signature, setSignature] = useState<string | undefined>();
    const [signerName, setSignerName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadReport = async () => {
            try {
                const data = await publicApi.getReport(token);
                setReport(data);
                if (data.contactPerson) {
                    setSignerName(data.contactPerson);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load report');
            } finally {
                setLoading(false);
            }
        };
        loadReport();
    }, [token]);

    const handleSubmit = async () => {
        if (!signature) return;

        setSubmitting(true);
        try {
            await publicApi.signReport(token, {
                signature,
                signerName: signerName || report.contactPerson || 'Customer'
            });
            setSubmitted(true);
        } catch (err: any) {
            alert(err.message || 'Failed to save signature');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Error</h3>
                    <p className="text-slate-600">{error}</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{t('thankYouSigning')}</h3>
                    <p className="text-slate-600">{t('signatureSaved')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-primary-600 p-6 text-white text-center">
                        <h1 className="text-xl font-bold">{t('signReportPublic')}</h1>
                        <p className="text-primary-100 mt-1">{t('publicSignDescription')}</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex justify-between border-b border-slate-100 pb-3">
                            <span className="text-slate-500">{t('customer')}</span>
                            <span className="font-medium text-slate-900 text-right">{report.customerName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-3">
                            <span className="text-slate-500">{t('device')}</span>
                            <span className="font-medium text-slate-900 text-right">{report.deviceType} - {report.brand} {report.model}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-3">
                            <span className="text-slate-500">{t('serialNumber')}</span>
                            <span className="font-medium text-slate-900 text-right">{report.serialNumber}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-3">
                            <span className="text-slate-500">{t('technician')}</span>
                            <span className="font-medium text-slate-900 text-right">{report.technicianName}</span>
                        </div>

                        <div className="pt-2">
                            <h4 className="text-sm font-medium text-slate-700 mb-2">{t('faultDescription')}</h4>
                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm">{report.faultDescription}</p>
                        </div>

                        <div className="pt-2">
                            <h4 className="text-sm font-medium text-slate-700 mb-2">{t('actionTaken')}</h4>
                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm">{report.actionTaken}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('contactPerson')}</label>
                        <input
                            type="text"
                            value={signerName}
                            onChange={(e) => setSignerName(e.target.value)}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm"
                            placeholder={t('contactPerson')}
                        />
                    </div>

                    <SignaturePad
                        label={t('customerSignature')}
                        signerName={signerName}
                        onSave={setSignature}
                        onClear={() => setSignature(undefined)}
                        initialSignature={signature}
                    />

                    <div className="mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={!signature || submitting}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {t('signReportPublic')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
