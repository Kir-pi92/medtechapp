import { useState, useEffect, useRef } from 'react';
import { Globe, Check, Upload, Trash2, Building2, Layout, ExternalLink, Database, Download, Users, Key, Shield, UserPlus, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useTemplate } from '../TemplateContext';
import { useAuth } from '../AuthContext';
import { adminApi, authApi } from '../api';
import { saveAs } from 'file-saver';
import type { Language } from '../i18n';
import type { User } from '../types';

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
            {/* Data Management Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                        <Database className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{t('dataManagement')}</h3>
                </div>

                <div className="space-y-4">
                    <p className="text-slate-600 text-sm">
                        {t('dataManagementDescription')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Backup Button */}
                        <button
                            onClick={async () => {
                                try {
                                    const data = await adminApi.backup();
                                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                    saveAs(blob, `MedTech_FullBackup_${new Date().toISOString().split('T')[0]}.json`);
                                    alert(t('backupSuccess'));
                                } catch (error) {
                                    console.error('Backup failed', error);
                                    alert('Backup failed');
                                }
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors border border-slate-200"
                        >
                            <Download className="w-4 h-4" />
                            {t('backupDatabase')}
                        </button>

                        {/* Restore Button */}
                        <div className="flex-1">
                            <input
                                type="file"
                                id="restore-file"
                                accept=".json"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    if (!confirm(t('restoreWarning'))) {
                                        e.target.value = '';
                                        return;
                                    }

                                    const reader = new FileReader();
                                    reader.onload = async (event) => {
                                        try {
                                            const content = event.target?.result as string;
                                            const data = JSON.parse(content);
                                            const result = await adminApi.restore(data);
                                            alert(`${t('restoreSuccess')} (${result.count} records)`);
                                            window.location.reload(); // Reload to refresh data
                                        } catch (error: any) {
                                            console.error('Restore failed', error);
                                            alert(t('restoreError') + error.message);
                                        }
                                    };
                                    reader.readAsText(file);
                                    e.target.value = '';
                                }}
                            />
                            <button
                                onClick={() => document.getElementById('restore-file')?.click()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-red-50 text-red-600 rounded-lg font-medium transition-colors border border-red-200 hover:border-red-300"
                            >
                                <Upload className="w-4 h-4" />
                                {t('restoreDatabase')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* User Management Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{t('userManagement')}</h3>
                </div>

                <div className="space-y-6">
                    {/* Change Password */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                            <Key className="w-4 h-4 text-slate-500" />
                            {t('changePassword')}
                        </h4>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const current = (form[0] as HTMLInputElement).value;
                            const newPass = (form[1] as HTMLInputElement).value;
                            const confirmPass = (form[2] as HTMLInputElement).value;

                            if (newPass !== confirmPass) {
                                alert(t('passwordMismatch'));
                                return;
                            }

                            try {
                                await authApi.changePassword(current, newPass);
                                alert(t('passwordChangedSuccess'));
                                form.reset();
                            } catch (err: any) {
                                alert(err.message);
                            }
                        }} className="space-y-3">
                            <input
                                type="password"
                                placeholder={t('currentPassword')}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                required
                            />
                            <input
                                type="password"
                                placeholder={t('newPassword')}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                required
                            />
                            <input
                                type="password"
                                placeholder={t('confirmNewPassword')}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                {t('changePassword')}
                            </button>
                        </form>
                    </div>

                    {/* Check if user is created (simplified for now, ideally check role) */}
                    <div>
                        <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-slate-500" />
                            {t('userList')}
                        </h4>

                        {/* User List & Add User Logic would go here. 
                             Since this is becoming a large file, I'll keep it relatively simple for now 
                             by adding a localized UserList component or logic here if needed.
                         */}
                        <UserManagementSection />
                    </div>
                </div>
            </div>

        </div>
    );
}

// Sub-component for User List to keep main component cleaner
function UserManagementSection() {
    const { t } = useLanguage();
    const { user: currentUser, register } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [newUserUser, setNewUserUser] = useState('');
    const [newUserPass, setNewUserPass] = useState('');
    const [newUserFull, setNewUserFull] = useState('');

    const loadUsers = async () => {
        try {
            const data = await authApi.getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(newUserUser, newUserPass, newUserFull);
            setIsAdding(false);
            setNewUserUser('');
            setNewUserPass('');
            setNewUserFull('');
            loadUsers(); // Refresh list
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(t('confirmDeleteUser') + ` (${name})`)) return;
        try {
            await authApi.deleteUser(id);
            loadUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-4">
            {/* Add User Button/Form */}
            {!isAdding ? (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    {t('createNewUser')}
                </button>
            ) : (
                <form onSubmit={handleAddUser} className="bg-primary-50 p-4 rounded-lg border border-primary-100 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                        <h5 className="font-semibold text-primary-800 text-sm">{t('createNewUser')}</h5>
                        <button type="button" onClick={() => setIsAdding(false)} className="text-primary-600 hover:text-primary-800"><X className="w-4 h-4" /></button>
                    </div>
                    <input type="text" placeholder={t('fullName')} value={newUserFull} onChange={e => setNewUserFull(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-primary-200 text-sm" required />
                    <input type="text" placeholder={t('username')} value={newUserUser} onChange={e => setNewUserUser(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-primary-200 text-sm" required />
                    <input type="password" placeholder={t('password')} value={newUserPass} onChange={e => setNewUserPass(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-primary-200 text-sm" required />
                    <button type="submit" className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium">{t('register')}</button>
                </form>
            )}

            {/* Users List */}
            <div className="space-y-2">
                {users.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                                {u.fullName.charAt(0)}
                            </div>
                            <div>
                                <div className="font-medium text-slate-900">{u.fullName} {currentUser?.id === u.id && <span className="text-xs text-primary-600 font-normal">({t('currentUser')})</span>}</div>
                                <div className="text-xs text-slate-500">@{u.username}</div>
                            </div>
                        </div>
                        {currentUser?.id !== u.id && (
                            <button
                                onClick={() => handleDeleteUser(u.id, u.fullName)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title={t('deleteUser')}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
