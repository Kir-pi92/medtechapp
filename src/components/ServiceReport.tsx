import type { ServiceReport as ServiceReportType } from '../types';
import React, { useState } from 'react';
import { Printer, ArrowLeft, Download, CheckCircle2, AlertCircle, Clock, XCircle, Pencil, Mail, Link as LinkIcon, Check } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useTemplate, type ReportSection } from '../TemplateContext';
import { statusTranslationMap } from '../i18n';
import { EmailModal } from './EmailModal';
import { reportsApi } from '../api';

interface ServiceReportProps {
    data: ServiceReportType;
    onBack: () => void;
    onEdit?: () => void;
}

export function ServiceReport({ data, onBack, onEdit }: ServiceReportProps) {
    const { t } = useLanguage();
    const { template } = useTemplate();
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [generatingLink, setGeneratingLink] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleGenerateLink = async () => {
        if (!data.id) return;
        setGeneratingLink(true);
        try {
            const { url } = await reportsApi.generateSignLink(data.id);
            const fullUrl = `${window.location.origin}${url}`;

            // Robust copy to clipboard function
            const copyToClipboard = async (text: string) => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    return navigator.clipboard.writeText(text);
                } else {
                    // Fallback for non-secure contexts (HTTP)
                    const textArea = document.createElement("textarea");
                    textArea.value = text;
                    textArea.style.position = "fixed";  // Avoid scrolling to bottom
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                        const successful = document.execCommand('copy');
                        if (!successful) throw new Error('Copy command failed');
                    } finally {
                        document.body.removeChild(textArea);
                    }
                }
            };

            await copyToClipboard(fullUrl);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (error: any) {
            console.error('Failed to generate link:', error);
            const errorMessage = error.message || 'Unknown error';
            alert(`Link oluşturulamadı: ${errorMessage}\n\nLütfen /api/debug/db-check adresini kontrol edin.`);
        } finally {
            setGeneratingLink(false);
        }
    };

    const getStatusTranslation = (status: string) => {
        const key = statusTranslationMap[status];
        return key ? t(key) : status.replace('_', ' ');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-amber-600" />;
            case 'parts_needed':
                return <AlertCircle className="w-5 h-5 text-orange-600" />;
            case 'scrapped':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' };
            case 'pending': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' };
            case 'parts_needed': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' };
            case 'scrapped': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
            default: return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' };
        }
    };

    const getVisibleSections = () => {
        return template.sections.filter(s => s.visible);
    };

    const getSizeStyles = (size?: 'compact' | 'normal' | 'large') => {
        switch (size) {
            case 'compact':
                return { padding: '8px', fontSize: '0.75rem', minHeight: '30px' };
            case 'large':
                return { padding: '20px', fontSize: '1rem', minHeight: '120px' };
            default:
                return { padding: '12px', fontSize: '0.8125rem', minHeight: '60px' };
        }
    };

    // Section components with professional styling
    const HeaderSection = ({ section }: { section: ReportSection }) => (
        <div className="mb-4">
            {/* Top banner */}
            <div
                className="rounded-t-lg px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4"
                style={{ backgroundColor: template.primaryColor }}
            >
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {template.companyLogo ? (
                        <div className="bg-white rounded-lg p-2 shadow-sm flex-shrink-0">
                            <img src={template.companyLogo} alt="Logo" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
                        </div>
                    ) : (
                        <div className="bg-white/20 rounded-lg p-2 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">
                            <span className="text-white/70 text-xs font-medium">LOGO</span>
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide" style={{ fontFamily: template.fontFamily }}>
                            {template.companyName || 'MedTech Service'}
                        </h1>
                        <p className="text-white/80 text-sm">{t('technicalServiceReport')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    {/* TSE-HYB Logo and Number */}
                    <div className="flex flex-col items-center">
                        <div className="bg-white rounded-lg p-1.5 shadow-sm">
                            <img
                                src="/tse-hyb-logo.jpg"
                                alt="TSE HYB"
                                className="h-10 md:h-12 w-auto object-contain"
                            />
                        </div>
                        <span className="text-white/90 text-xs font-medium mt-1">26-HYB-2438</span>
                    </div>
                    {/* Report ID */}
                    <div className="text-right text-white">
                        <div className="text-white/70 text-sm">{t('reportId')}</div>
                        <div className="font-mono text-lg font-bold">#{data.id?.slice(-9).toUpperCase() || 'XXXXXXXX'}</div>
                    </div>
                </div>
            </div>

            {/* Date and status bar */}
            <div className="bg-slate-50 border-x border-b border-slate-200 rounded-b-lg px-4 md:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 w-full sm:w-auto">
                    <div>
                        <span className="text-slate-500 text-sm">{t('reportDate')}:</span>
                        <span className="ml-2 font-semibold text-slate-900">{data.serviceDate}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 text-sm">{t('technicianLabel')}:</span>
                        <span className="ml-2 font-semibold text-slate-900">{data.technicianName}</span>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border w-full sm:w-auto justify-center ${getStatusColor(data.status).bg} ${getStatusColor(data.status).border}`}>
                    {getStatusIcon(data.status)}
                    <span className={`font-semibold text-sm ${getStatusColor(data.status).text}`}>
                        {getStatusTranslation(data.status)}
                    </span>
                </div>
            </div>
        </div>
    );

    const CustomerInfoSection = ({ section }: { section: ReportSection }) => {
        const sizeStyles = getSizeStyles(section?.size);

        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ fontFamily: template.fontFamily }}>
                <div className="px-4 py-2 border-b" style={{ backgroundColor: `${template.primaryColor}10`, borderColor: `${template.primaryColor}30` }}>
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: template.primaryColor }}>
                        {t('customerInfo')}
                    </h3>
                </div>
                <div className="p-3 space-y-1" style={{ fontSize: sizeStyles.fontSize }}>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">{t('customerLabel')}</span>
                        <span className="font-semibold text-slate-900 text-right">{data.customerName}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">{t('departmentLabel')}</span>
                        <span className="font-medium text-slate-700 text-right">{data.department || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 font-medium">{t('contactLabel')}</span>
                        <span className="font-medium text-slate-700 text-right">{data.contactPerson || '-'}</span>
                    </div>
                </div>
            </div>
        );
    };

    const DeviceInfoSection = ({ section }: { section: ReportSection }) => {
        const sizeStyles = getSizeStyles(section?.size);

        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ fontFamily: template.fontFamily }}>
                <div className="px-4 py-2 border-b" style={{ backgroundColor: `${template.primaryColor}10`, borderColor: `${template.primaryColor}30` }}>
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: template.primaryColor }}>
                        {t('deviceInfo')}
                    </h3>
                </div>
                <div className="p-3 space-y-1" style={{ fontSize: sizeStyles.fontSize }}>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">{t('deviceLabel')}</span>
                        <span className="font-semibold text-slate-900">{data.deviceType}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">{t('brandModel')}</span>
                        <span className="font-medium text-slate-700">{data.brand} / {data.model}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">{t('serialNo')}</span>
                        <span className="font-mono text-slate-700">{data.serialNumber}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">{t('tagNo')}</span>
                        <span className="font-mono text-slate-700">{data.tagNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 font-medium">{t('productionYearLabel')}</span>
                        <span className="font-mono text-slate-700">{data.productionYear || '-'}</span>
                    </div>
                </div>
            </div>
        );
    };

    const FaultDescriptionSection = ({ section }: { section: ReportSection }) => {
        const sizeStyles = getSizeStyles(section?.size);

        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ fontFamily: template.fontFamily }}>
                <div className="px-4 py-2 border-b" style={{ backgroundColor: `${template.primaryColor}10`, borderColor: `${template.primaryColor}30` }}>
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: template.primaryColor }}>
                        {t('faultDescription')}
                    </h3>
                </div>
                <div
                    className="p-4 text-slate-800 leading-relaxed"
                    style={{
                        fontSize: sizeStyles.fontSize,
                        minHeight: sizeStyles.minHeight
                    }}
                >
                    {data.faultDescription}
                </div>
            </div>
        );
    };

    const ActionTakenSection = ({ section }: { section: ReportSection }) => {
        const sizeStyles = getSizeStyles(section?.size);

        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ fontFamily: template.fontFamily }}>
                <div className="px-4 py-2 border-b" style={{ backgroundColor: `${template.primaryColor}10`, borderColor: `${template.primaryColor}30` }}>
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: template.primaryColor }}>
                        {t('actionTaken')}
                    </h3>
                </div>
                <div
                    className="p-4 text-slate-800 leading-relaxed"
                    style={{
                        fontSize: sizeStyles.fontSize,
                        minHeight: sizeStyles.minHeight
                    }}
                >
                    {data.actionTaken}
                </div>
            </div>
        );
    };

    const PartsUsedSection = ({ section }: { section: ReportSection }) => {
        const sizeStyles = getSizeStyles(section?.size);

        if (!data.partsUsed || data.partsUsed.length === 0) return null;

        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ fontFamily: template.fontFamily }}>
                <div className="px-4 py-2 border-b" style={{ backgroundColor: `${template.primaryColor}10`, borderColor: `${template.primaryColor}30` }}>
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: template.primaryColor }}>
                        {t('partsUsed')}
                    </h3>
                </div>
                <div className="px-4 py-2">
                    <table className="w-full" style={{ fontSize: sizeStyles.fontSize }}>
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-2 text-slate-600 font-semibold">{t('partName')}</th>
                                <th className="text-left py-2 text-slate-600 font-semibold">{t('code')}</th>
                                <th className="text-right py-2 text-slate-600 font-semibold">{t('qty')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.partsUsed.map((part, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-1 font-medium text-slate-900">{part.name}</td>
                                    <td className="py-1 font-mono text-slate-500">{part.code || '-'}</td>
                                    <td className="py-1 text-right font-medium text-slate-900">{part.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const SignaturesSection = ({ section }: { section: ReportSection }) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ fontFamily: template.fontFamily }}>
            <div className="px-4 py-2 border-b" style={{ backgroundColor: `${template.primaryColor}10`, borderColor: `${template.primaryColor}30` }}>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: template.primaryColor }}>
                    {t('signatures')}
                </h3>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="text-sm text-slate-500 mb-2">{t('technicianSignature')}</div>
                        <div className="font-semibold text-slate-900 mb-4">{data.technicianName}</div>
                        {data.technicianSignature ? (
                            <div className="border-2 rounded-lg p-2 h-20 flex items-center justify-center" style={{ borderColor: template.primaryColor }}>
                                <img src={data.technicianSignature} alt="Teknisyen İmzası" className="max-h-full" />
                            </div>
                        ) : (
                            <>
                                <div className="border-b-2 h-16" style={{ borderColor: template.primaryColor }}></div>
                                <div className="text-xs text-slate-400 mt-2">{t('signHere')}</div>
                            </>
                        )}
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 mb-2">{t('customerSignature')}</div>
                        <div className="font-semibold text-slate-900 mb-4">{data.contactPerson || t('authorizedPersonnel')}</div>
                        {data.customerSignature ? (
                            <div className="border-2 rounded-lg p-2 h-20 flex items-center justify-center" style={{ borderColor: template.primaryColor }}>
                                <img src={data.customerSignature} alt="Müşteri İmzası" className="max-h-full" />
                            </div>
                        ) : (
                            <>
                                <div className="border-b-2 h-16" style={{ borderColor: template.primaryColor }}></div>
                                <div className="text-xs text-slate-400 mt-2">{t('signHere')}</div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-400">{t('documentCertification')}</p>
            </div>
        </div>
    );

    const PhotoGallerySection = () => {
        if (!data.photos || data.photos.length === 0) return null;

        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ fontFamily: template.fontFamily }}>
                <div className="px-4 py-2 border-b" style={{ backgroundColor: `${template.primaryColor}10`, borderColor: `${template.primaryColor}30` }}>
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: template.primaryColor }}>
                        Fotoğraflar
                    </h3>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {data.photos.map((photo, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                                <img
                                    src={photo}
                                    alt={`Fotoğraf ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                                    <span className="text-white text-xs font-medium">{idx + 1}/{data.photos?.length}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderSection = (section: ReportSection) => {
        switch (section.id) {
            case 'header':
                return <HeaderSection section={section} />;
            case 'customerInfo':
                return <CustomerInfoSection section={section} />;
            case 'deviceInfo':
                return <DeviceInfoSection section={section} />;
            case 'faultDescription':
                return <FaultDescriptionSection section={section} />;
            case 'actionTaken':
                return <ActionTakenSection section={section} />;
            case 'partsUsed':
                return <PartsUsedSection section={section} />;
            case 'signatures':
                return <SignaturesSection section={section} />;
            default:
                return null;
        }
    };

    // Group sections for grid display based on width
    const renderSectionsWithGrid = () => {
        const visibleSections = getVisibleSections();
        const result: React.ReactNode[] = [];
        let i = 0;

        while (i < visibleSections.length) {
            const section = visibleSections[i];
            const nextSection = visibleSections[i + 1];

            // Header always full width
            if (section.id === 'header') {
                result.push(
                    <div key={`row-${i}`}>
                        {renderSection(section)}
                    </div>
                );
                i += 1;
                continue;
            }

            // Check if current and next are both half width
            if (section.width === 'half' && nextSection?.width === 'half') {
                // Render two sections side by side
                result.push(
                    <div key={`row-${i}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>{renderSection(section)}</div>
                        <div>{renderSection(nextSection)}</div>
                    </div>
                );
                i += 2;
            } else {
                // Render single section full width
                result.push(
                    <div key={`row-${i}`} className="mb-3">
                        {renderSection(section)}
                    </div>
                );
                i += 1;
            }
        }

        return result;
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* No-Print Controls */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"
                >
                    <ArrowLeft className="w-4 h-4" /> {t('backToEdit')}
                </button>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all border border-blue-200 text-sm"
                        >
                            <Pencil className="w-4 h-4" /> <span className="hidden sm:inline">{t('editReport')}</span>
                        </button>
                    )}
                    <button
                        onClick={handleGenerateLink}
                        disabled={generatingLink}
                        className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-all border border-purple-200 text-sm"
                    >
                        {linkCopied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                        {linkCopied ? t('linkCopied') : t('signatureLink')}
                    </button>
                    <button
                        onClick={() => setShowEmailModal(true)}
                        className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium transition-all border border-green-200 text-sm"
                    >
                        <Mail className="w-4 h-4" /> <span className="hidden sm:inline">E-posta</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-all border border-slate-200 text-sm"
                    >
                        <Download className="w-4 h-4" /> <span className="hidden sm:inline">{t('downloadPdf')}</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all hover:shadow-xl text-sm"
                        style={{ backgroundColor: template.primaryColor }}
                    >
                        <Printer className="w-4 h-4" /> {t('printReport')}
                    </button>
                </div>
            </div>

            {/* Email Modal */}
            <EmailModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                reportId={data.id || ''}
                defaultEmail={data.customerEmail}
                customerName={data.customerName}
            />

            {/* Printable Area */}
            <div
                className="bg-slate-50 p-4 md:p-8 rounded-2xl print:bg-white print:p-0"
                id="printable-report"
                style={{ fontFamily: template.fontFamily }}
            >
                {renderSectionsWithGrid()}
                {/* Photo Gallery - rendered after other sections */}
                <PhotoGallerySection />
            </div>
        </div>
    );
}
