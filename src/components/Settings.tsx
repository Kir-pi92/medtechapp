import { useRef } from 'react';
import { Globe, Check, Upload, Trash2, Building2, Layout, ExternalLink } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useTemplate } from '../TemplateContext';
import type { Language } from '../i18n';

interface SettingsProps {
    onOpenTemplateEditor?: () => void;
}

export function Settings({ onOpenTemplateEditor }: SettingsProps) {
    const { language, setLanguage, t } = useLanguage();
    const { template, setCompanyLogo, setCompanyName } = useTemplate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const languages: { code: Language; name: string; flag: string }[] = [
        { code: 'en', name: t('english'), flag: '🇬🇧' },
        { code: 'tr', name: t('turkish'), flag: '🇹🇷' },
    ];

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCompanyLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{t('settingsTitle')}</h2>
                <p className="text-slate-500">{t('settingsDescription')}</p>
            </div>

            {/* Company Settings Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                        <Building2 className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{t('companySettings')}</h3>
                </div>

                <div className="space-y-6">
                    {/* Company Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('companyName')}</label>
                        <input
                            type="text"
                            value={template.companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            placeholder="MedTech Service"
                        />
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('companyLogo')}</label>

                        <div className="flex gap-4 items-start">
                            {/* Logo Preview */}
                            <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden">
                                {template.companyLogo ? (
                                    <img
                                        src={template.companyLogo}
                                        alt="Company Logo"
                                        className="w-full h-full object-contain p-2"
                                    />
                                ) : (
                                    <div className="text-center text-slate-400 text-xs p-2">
                                        {t('noLogoUploaded')}
                                    </div>
                                )}
                            </div>

                            {/* Upload Controls */}
                            <div className="flex flex-col gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                    {t('uploadLogo')}
                                </button>
                                {template.companyLogo && (
                                    <button
                                        onClick={() => setCompanyLogo(null)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {t('removeLogo')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Editor Card - Link to Full Editor */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                        <Layout className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{t('templateEditor')}</h3>
                </div>

                <p className="text-slate-600 text-sm mb-4">
                    {t('templateEditorDescription')}
                </p>

                <button
                    onClick={onOpenTemplateEditor}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md w-full justify-center"
                >
                    <Layout className="w-5 h-5" />
                    {t('templateEditor')}
                    <ExternalLink className="w-4 h-4 ml-1" />
                </button>
            </div>

            {/* Language Settings Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                        <Globe className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{t('languageSettings')}</h3>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('selectLanguage')}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${language === lang.code
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{lang.flag}</span>
                                    <span className={`font-medium ${language === lang.code ? 'text-primary-700' : 'text-slate-700'
                                        }`}>
                                        {lang.name}
                                    </span>
                                </div>
                                {language === lang.code && (
                                    <Check className="w-5 h-5 text-primary-600" />
                                )}
                            </button>
                        ))}
                    </div>

                    <p className="text-sm text-slate-500 mt-4">
                        {t('settingsSaved')}
                    </p>
                </div>
            </div>
        </div>
    );
}
