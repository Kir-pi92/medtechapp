import { useState } from 'react';
import { X, Mail, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportId: string;
    defaultEmail?: string;
    customerName?: string;
}

export function EmailModal({ isOpen, onClose, reportId, defaultEmail = '', customerName }: EmailModalProps) {
    const [email, setEmail] = useState(defaultEmail);
    const [subject, setSubject] = useState('Servis Raporu');
    const [message, setMessage] = useState(`Sayın ${customerName || 'Müşterimiz'},\n\nServis raporunuz ekte yer almaktadır.\n\nSaygılarımızla,\nMedTech Service`);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setErrorMessage('E-posta adresi gereklidir.');
            setStatus('error');
            return;
        }

        setStatus('sending');
        setErrorMessage('');

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reportId,
                    to: email,
                    subject,
                    message,
                }),
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    onClose();
                    setStatus('idle');
                }, 2000);
            } else {
                const data = await response.json();
                setErrorMessage(data.message || 'E-posta gönderilemedi.');
                setStatus('error');
            }
        } catch (error) {
            setErrorMessage('Bağlantı hatası. Lütfen tekrar deneyin.');
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Mail className="w-5 h-5 text-primary-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Raporu E-posta ile Gönder</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Success State */}
                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="p-3 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-green-800">E-posta Gönderildi!</h3>
                        <p className="text-sm text-green-600 mt-1">{email} adresine başarıyla gönderildi.</p>
                    </div>
                )}

                {/* Form */}
                {status !== 'success' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Message */}
                        {status === 'error' && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{errorMessage}</span>
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Alıcı E-posta Adresi
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@hastane.com"
                                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                required
                            />
                        </div>

                        {/* Subject Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Konu
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Servis Raporu"
                                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            />
                        </div>

                        {/* Message Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Mesaj
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                            />
                        </div>

                        {/* Info Note */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-700">
                                📎 Servis raporu PDF olarak e-postaya eklenecektir.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors border border-slate-200"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg font-medium transition-colors"
                            >
                                {status === 'sending' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Gönder
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
