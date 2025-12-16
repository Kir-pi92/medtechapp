import { useState, useRef } from 'react';
import {
    GripVertical, Eye, EyeOff, ArrowLeft, Save, RotateCcw, Move,
    Download, Printer, Plus, Copy, Trash2, Check, Palette,
    Minimize2, Square, Maximize2, FileText, Columns, RectangleHorizontal,
    ChevronUp, ChevronDown
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useTemplate, type ReportSectionId, type ReportSection } from '../TemplateContext';

const sectionNameMap: Record<ReportSectionId, string> = {
    header: 'sectionHeader',
    customerInfo: 'sectionCustomerInfo',
    deviceInfo: 'sectionDeviceInfo',
    faultDescription: 'sectionFaultDescription',
    actionTaken: 'sectionActionTaken',
    partsUsed: 'sectionPartsUsed',
    signatures: 'sectionSignatures',
};

interface TemplateEditorProps {
    onBack: () => void;
}

export function TemplateEditor({ onBack }: TemplateEditorProps) {
    const { t } = useLanguage();
    const {
        template,
        templates,
        selectTemplate,
        saveAsNewTemplate,
        deleteTemplate,
        duplicateTemplate,
        updateSections,
        toggleSectionVisibility,
        setSectionSize,
        setSectionWidth,
        setPrimaryColor,
        setFontFamily,
        setShowGridLines,
        resetTemplate
    } = useTemplate();

    const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [activeTab, setActiveTab] = useState<'layout' | 'design' | 'templates'>('layout');
    const containerRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleSaveNewTemplate = () => {
        if (newTemplateName.trim()) {
            saveAsNewTemplate(newTemplateName.trim());
            setNewTemplateName('');
            setShowNewTemplateModal(false);
        }
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...template.sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSections.length) return;
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        updateSections(newSections);
    };

    const colorOptions = [
        { name: 'Sky', value: '#0ea5e9' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Indigo', value: '#6366f1' },
        { name: 'Purple', value: '#8b5cf6' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Green', value: '#22c55e' },
        { name: 'Teal', value: '#14b8a6' },
        { name: 'Slate', value: '#64748b' },
    ];

    const fontOptions = [
        // Modern Sans-Serif Fonts
        { name: 'Inter', value: 'Inter', category: 'Modern' },
        { name: 'Outfit', value: 'Outfit', category: 'Modern' },
        { name: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans', category: 'Modern' },
        { name: 'DM Sans', value: 'DM Sans', category: 'Modern' },
        { name: 'Space Grotesk', value: 'Space Grotesk', category: 'Modern' },
        { name: 'Manrope', value: 'Manrope', category: 'Modern' },
        // Popular Sans-Serif
        { name: 'Roboto', value: 'Roboto', category: 'Popular' },
        { name: 'Open Sans', value: 'Open Sans', category: 'Popular' },
        { name: 'Lato', value: 'Lato', category: 'Popular' },
        { name: 'Montserrat', value: 'Montserrat', category: 'Popular' },
        { name: 'Poppins', value: 'Poppins', category: 'Popular' },
        { name: 'Nunito', value: 'Nunito', category: 'Popular' },
        { name: 'Raleway', value: 'Raleway', category: 'Popular' },
        { name: 'Work Sans', value: 'Work Sans', category: 'Popular' },
        { name: 'Ubuntu', value: 'Ubuntu', category: 'Popular' },
        { name: 'Quicksand', value: 'Quicksand', category: 'Popular' },
        // Clean & Professional
        { name: 'Source Sans Pro', value: 'Source Sans Pro', category: 'Professional' },
        { name: 'Nunito Sans', value: 'Nunito Sans', category: 'Professional' },
        { name: 'Rubik', value: 'Rubik', category: 'Professional' },
        { name: 'Mulish', value: 'Mulish', category: 'Professional' },
        { name: 'Karla', value: 'Karla', category: 'Professional' },
        { name: 'Barlow', value: 'Barlow', category: 'Professional' },
        // Elegant & Display
        { name: 'Playfair Display', value: 'Playfair Display', category: 'Elegant' },
        { name: 'Oswald', value: 'Oswald', category: 'Elegant' },
        { name: 'Crimson Pro', value: 'Crimson Pro', category: 'Elegant' },
        { name: 'Libre Baskerville', value: 'Libre Baskerville', category: 'Elegant' },
        // Serif Fonts
        { name: 'Merriweather', value: 'Merriweather', category: 'Serif' },
        { name: 'Lora', value: 'Lora', category: 'Serif' },
        { name: 'PT Serif', value: 'PT Serif', category: 'Serif' },
        // System Fonts
        { name: 'Arial', value: 'Arial', category: 'System' },
        { name: 'Times New Roman', value: 'Times New Roman', category: 'System' },
    ];

    // Sample data for preview
    const sampleData = {
        customerName: 'Örnek Hastane A.Ş.',
        department: 'Kardiyoloji Bölümü',
        contactPerson: 'Dr. Ahmet Yılmaz',
        deviceType: 'Hasta Monitörü',
        brand: 'Philips',
        model: 'MX800',
        serialNumber: 'SN123456789',
        tagNumber: 'TG-2024-001',
        faultDescription: 'Cihaz açılmıyor, güç adaptörü kontrol edildi. Ekranda görüntü yok.',
        actionTaken: 'Ana kart değiştirildi, güç kaynağı yenilendi. Tüm kablolar kontrol edildi. Cihaz test edildi ve çalışır durumda teslim edildi.',
        technicianName: 'Mehmet Tekniker',
        serviceDate: new Date().toISOString().split('T')[0],
    };

    const getSizeClass = (size?: 'compact' | 'normal' | 'large') => {
        switch (size) {
            case 'compact': return 'text-[8px] p-1';
            case 'large': return 'text-[11px] p-3';
            default: return 'text-[9px] p-2';
        }
    };

    const renderSectionPreview = (section: ReportSection) => {
        const opacity = section.visible ? 'opacity-100' : 'opacity-30';
        const sizeClass = getSizeClass(section.size);

        switch (section.id) {
            case 'header':
                return (
                    <div className={`${opacity} ${sizeClass} transition-opacity`}>
                        <div className="flex justify-between items-start border-b pb-2" style={{ borderColor: template.primaryColor, borderWidth: '2px' }}>
                            <div className="flex items-center gap-2">
                                {template.companyLogo ? (
                                    <img src={template.companyLogo} alt="Logo" className="w-8 h-8 object-contain" />
                                ) : (
                                    <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-400 text-[6px]">LOGO</div>
                                )}
                                <div>
                                    <div className="font-bold text-slate-800 uppercase" style={{ fontFamily: template.fontFamily, fontSize: '0.7em' }}>
                                        {t('technicalServiceReport')}
                                    </div>
                                    <div className="text-slate-500" style={{ fontSize: '0.5em' }}>{template.companyName}</div>
                                </div>
                            </div>
                            <div className="text-right" style={{ fontSize: '0.5em' }}>
                                <div className="text-slate-500">{t('reportDate')}</div>
                                <div className="font-medium">{sampleData.serviceDate}</div>
                            </div>
                        </div>
                    </div>
                );

            case 'customerInfo':
                return (
                    <div className={`${opacity} ${sizeClass} transition-opacity`}>
                        <div className="font-bold uppercase mb-1" style={{ fontSize: '0.55em', color: template.primaryColor }}>{t('customerInfo')}</div>
                        <div className="space-y-0.5" style={{ fontSize: '0.5em' }}>
                            <div className="flex justify-between"><span className="text-slate-500">{t('customerLabel')}</span><span className="font-medium">{sampleData.customerName}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">{t('departmentLabel')}</span><span>{sampleData.department}</span></div>
                        </div>
                    </div>
                );

            case 'deviceInfo':
                return (
                    <div className={`${opacity} ${sizeClass} transition-opacity`}>
                        <div className="font-bold uppercase mb-1" style={{ fontSize: '0.55em', color: template.primaryColor }}>{t('deviceInfo')}</div>
                        <div className="space-y-0.5" style={{ fontSize: '0.5em' }}>
                            <div className="flex justify-between"><span className="text-slate-500">{t('deviceLabel')}</span><span className="font-medium">{sampleData.deviceType}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">{t('brandModel')}</span><span>{sampleData.brand} / {sampleData.model}</span></div>
                        </div>
                    </div>
                );

            case 'faultDescription':
                return (
                    <div className={`${opacity} ${sizeClass} transition-opacity`}>
                        <div className="font-bold uppercase mb-1" style={{ fontSize: '0.55em', color: template.primaryColor }}>{t('faultDescription')}</div>
                        <div className="bg-slate-50 p-1 rounded text-slate-700 border border-slate-200" style={{ fontSize: '0.5em' }}>
                            {sampleData.faultDescription.slice(0, 50)}...
                        </div>
                    </div>
                );

            case 'actionTaken':
                return (
                    <div className={`${opacity} ${sizeClass} transition-opacity`}>
                        <div className="font-bold uppercase mb-1" style={{ fontSize: '0.55em', color: template.primaryColor }}>{t('actionTaken')}</div>
                        <div className="bg-slate-50 p-1 rounded text-slate-700 border border-slate-200" style={{ fontSize: '0.5em' }}>
                            {sampleData.actionTaken.slice(0, 60)}...
                        </div>
                    </div>
                );

            case 'partsUsed':
                return (
                    <div className={`${opacity} ${sizeClass} transition-opacity`}>
                        <div className="font-bold uppercase mb-1" style={{ fontSize: '0.55em', color: template.primaryColor }}>{t('partsUsed')}</div>
                        <div className="bg-slate-50 rounded border border-slate-200 p-1" style={{ fontSize: '0.45em' }}>
                            <div className="flex justify-between font-medium"><span>Ana Kart</span><span>1 adet</span></div>
                        </div>
                    </div>
                );

            case 'signatures':
                return (
                    <div className={`${opacity} ${sizeClass} transition-opacity border-t pt-1`} style={{ borderColor: template.primaryColor }}>
                        <div className="flex justify-between gap-2">
                            <div className="flex-1">
                                <div className="font-bold uppercase" style={{ fontSize: '0.45em', color: template.primaryColor }}>{t('technicianSignature')}</div>
                                <div className="h-px mt-2 w-full" style={{ backgroundColor: template.primaryColor }}></div>
                            </div>
                            <div className="flex-1">
                                <div className="font-bold uppercase" style={{ fontSize: '0.45em', color: template.primaryColor }}>{t('customerSignature')}</div>
                                <div className="h-px mt-2 w-full" style={{ backgroundColor: template.primaryColor }}></div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Render sections with proper grid layout
    const renderPreviewSections = () => {
        const result: JSX.Element[] = [];
        let i = 0;

        while (i < template.sections.length) {
            const section = template.sections[i];
            const nextSection = template.sections[i + 1];

            // Check if current and next are both half width and visible
            if (section.width === 'half' && nextSection?.width === 'half') {
                result.push(
                    <div key={`row-${i}`} className="flex gap-2 mb-2">
                        <div className={`flex-1 rounded border-2 border-dashed transition-all ${section.visible ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'}`}>
                            {renderSectionPreview(section)}
                        </div>
                        <div className={`flex-1 rounded border-2 border-dashed transition-all ${nextSection.visible ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'}`}>
                            {renderSectionPreview(nextSection)}
                        </div>
                    </div>
                );
                i += 2;
            } else {
                result.push(
                    <div key={`row-${i}`} className={`mb-2 rounded border-2 border-dashed transition-all ${section.visible ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'}`}>
                        {renderSectionPreview(section)}
                    </div>
                );
                i += 1;
            }
        }

        return result;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">{t('backToEdit')}</span>
                        </button>
                        <div className="h-6 w-px bg-slate-300"></div>
                        <h1 className="text-lg font-bold text-slate-900">{t('templateEditor')}</h1>
                        <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{template.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            {t('printReport')}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            {t('downloadPdf')}
                        </button>
                        <button
                            onClick={resetTemplate}
                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            {t('resetTemplate')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 print:hidden">
                <div className="flex gap-6">
                    {/* Report Preview */}
                    <div className="flex-1">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-3">
                            <Move className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <p className="text-sm text-blue-800">
                                <strong>Bölümleri sağ panelden düzenleyebilirsiniz.</strong> Yarım genişlikteki ardışık bölümler yan yana görünür.
                            </p>
                        </div>

                        <div
                            ref={containerRef}
                            className="bg-white rounded-xl shadow-xl border border-slate-200 p-6"
                            style={{
                                backgroundImage: template.showGridLines ? 'linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)' : 'none',
                                backgroundSize: '20px 20px'
                            }}
                        >
                            {/* A4 Preview Container */}
                            <div
                                className="bg-white border border-slate-300 shadow-lg mx-auto rounded-sm"
                                style={{
                                    width: '100%',
                                    maxWidth: '480px',
                                    minHeight: '550px',
                                    padding: '16px',
                                    fontFamily: template.fontFamily
                                }}
                            >
                                {renderPreviewSections()}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-96 flex-shrink-0 space-y-4">
                        {/* Tabs */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex gap-1">
                            <button
                                onClick={() => setActiveTab('layout')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'layout'
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                📐 {t('templateEditor')}
                            </button>
                            <button
                                onClick={() => setActiveTab('design')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'design'
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                🎨 {t('designSettings')}
                            </button>
                            <button
                                onClick={() => setActiveTab('templates')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'templates'
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                📁 {t('savedTemplates')}
                            </button>
                        </div>

                        {/* Layout Tab */}
                        {activeTab === 'layout' && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                <h3 className="font-semibold text-slate-900 mb-1">{t('dragToReorder')}</h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    <Columns className="w-3 h-3 inline mr-1" />Yarım genişlikteki ardışık bölümler yan yana görünür
                                </p>

                                <div className="space-y-2">
                                    {template.sections.map((section, index) => (
                                        <div
                                            key={section.id}
                                            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${section.visible
                                                ? section.width === 'half'
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : 'bg-slate-50 border-slate-200'
                                                : 'bg-slate-100 border-slate-100 opacity-50'
                                                }`}
                                        >
                                            {/* Move buttons */}
                                            <div className="flex flex-col gap-0.5">
                                                <button
                                                    onClick={() => moveSection(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <ChevronUp className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => moveSection(index, 'down')}
                                                    disabled={index === template.sections.length - 1}
                                                    className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <ChevronDown className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* Section name */}
                                            <span className="flex-1 text-sm font-medium">
                                                {t(sectionNameMap[section.id] as 'sectionHeader')}
                                            </span>

                                            {/* Width toggle */}
                                            <div className="flex gap-1 bg-white rounded-lg p-0.5 border border-slate-200">
                                                <button
                                                    onClick={() => setSectionWidth(section.id, 'full')}
                                                    className={`p-1.5 rounded transition-all ${(!section.width || section.width === 'full')
                                                        ? 'bg-slate-800 text-white'
                                                        : 'text-slate-400 hover:text-slate-600'
                                                        }`}
                                                    title={t('fullWidth')}
                                                >
                                                    <RectangleHorizontal className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setSectionWidth(section.id, 'half')}
                                                    className={`p-1.5 rounded transition-all ${section.width === 'half'
                                                        ? 'bg-blue-500 text-white'
                                                        : 'text-slate-400 hover:text-slate-600'
                                                        }`}
                                                    title={t('halfWidth')}
                                                >
                                                    <Columns className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Size toggle */}
                                            <div className="flex gap-0.5 bg-white rounded-lg p-0.5 border border-slate-200">
                                                <button
                                                    onClick={() => setSectionSize(section.id, 'compact')}
                                                    className={`p-1 rounded transition-all ${section.size === 'compact'
                                                        ? 'bg-slate-800 text-white'
                                                        : 'text-slate-400 hover:text-slate-600'
                                                        }`}
                                                    title={t('compact')}
                                                >
                                                    <Minimize2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => setSectionSize(section.id, 'normal')}
                                                    className={`p-1 rounded transition-all ${(!section.size || section.size === 'normal')
                                                        ? 'bg-slate-800 text-white'
                                                        : 'text-slate-400 hover:text-slate-600'
                                                        }`}
                                                    title={t('normal')}
                                                >
                                                    <Square className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => setSectionSize(section.id, 'large')}
                                                    className={`p-1 rounded transition-all ${section.size === 'large'
                                                        ? 'bg-slate-800 text-white'
                                                        : 'text-slate-400 hover:text-slate-600'
                                                        }`}
                                                    title={t('large')}
                                                >
                                                    <Maximize2 className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* Visibility toggle */}
                                            <button
                                                onClick={() => toggleSectionVisibility(section.id)}
                                                className={`p-1.5 rounded-lg transition-all ${section.visible
                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                    : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                                    }`}
                                            >
                                                {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Design Tab */}
                        {activeTab === 'design' && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-5">
                                {/* Primary Color */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">{t('primaryColor')}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => setPrimaryColor(color.value)}
                                                className={`w-9 h-9 rounded-full border-3 transition-all shadow-sm ${template.primaryColor === color.value
                                                    ? 'border-slate-800 scale-110 ring-2 ring-offset-2 ring-slate-300'
                                                    : 'border-white hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Font Family */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">{t('fontFamily')}</label>
                                    <select
                                        value={template.fontFamily}
                                        onChange={(e) => setFontFamily(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500"
                                    >
                                        <optgroup label="✨ Modern">
                                            {fontOptions.filter(f => f.category === 'Modern').map((font) => (
                                                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                                    {font.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="⭐ Popular">
                                            {fontOptions.filter(f => f.category === 'Popular').map((font) => (
                                                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                                    {font.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="💼 Professional">
                                            {fontOptions.filter(f => f.category === 'Professional').map((font) => (
                                                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                                    {font.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="🎨 Elegant">
                                            {fontOptions.filter(f => f.category === 'Elegant').map((font) => (
                                                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                                    {font.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="📜 Serif">
                                            {fontOptions.filter(f => f.category === 'Serif').map((font) => (
                                                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                                    {font.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="💻 System">
                                            {fontOptions.filter(f => f.category === 'System').map((font) => (
                                                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                                    {font.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1" style={{ fontFamily: template.fontFamily }}>
                                        Önizleme: {template.fontFamily}
                                    </p>
                                </div>

                                {/* Show Grid Lines */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <label className="text-sm font-medium text-slate-700">{t('showGridLines')}</label>
                                    <button
                                        onClick={() => setShowGridLines(!template.showGridLines)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${template.showGridLines ? 'bg-primary-500' : 'bg-slate-300'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${template.showGridLines ? 'left-6' : 'left-0.5'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Templates Tab */}
                        {activeTab === 'templates' && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-slate-900">{t('savedTemplates')}</h3>
                                    <button
                                        onClick={() => setShowNewTemplateModal(true)}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {t('newTemplate')}
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {templates.map((tmpl) => (
                                        <div
                                            key={tmpl.id}
                                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${template.id === tmpl.id
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                            onClick={() => selectTemplate(tmpl.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {template.id === tmpl.id && (
                                                        <Check className="w-4 h-4 text-primary-600" />
                                                    )}
                                                    <span className="font-medium text-sm">{tmpl.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); duplicateTemplate(tmpl.id); }}
                                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                        title={t('duplicate')}
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    {templates.length > 1 && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteTemplate(tmpl.id); }}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title={t('deleteTemplate')}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 ml-6">
                                                {new Date(tmpl.createdAt).toLocaleDateString('tr-TR')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Template Modal */}
            {showNewTemplateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewTemplateModal(false)}>
                    <div className="bg-white rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('newTemplate')}</h3>
                        <input
                            type="text"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder={t('templateName')}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm mb-4 focus:ring-2 focus:ring-primary-500"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveNewTemplate()}
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowNewTemplateModal(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSaveNewTemplate}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {t('saveAsNew')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
