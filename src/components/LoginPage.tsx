import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { LogIn, UserPlus, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export function LoginPage() {
    const { login, register } = useAuth();
    const { t } = useLanguage();
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegister) {
                await register(username, password, fullName);
            } else {
                await login(username, password);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                        <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('appName')}</h1>
                    <p className="text-slate-500 mt-1">
                        {isRegister ? t('createAccount') : t('loginToAccount')}
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                {t('fullName')}
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                placeholder={t('enterFullName')}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            {t('username')}
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            placeholder={t('enterUsername')}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            {t('password')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all pr-12"
                                placeholder={t('enterPassword')}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isRegister ? (
                            <>
                                <UserPlus className="w-5 h-5" />
                                {t('register')}
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                {t('login')}
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle */}
                <div className="mt-6 text-center">
                    <p className="text-slate-500">
                        {isRegister ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
                        <button
                            type="button"
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            {isRegister ? t('login') : t('register')}
                        </button>
                    </p>
                </div>

                {/* Default credentials hint */}
                <div className="mt-6 p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500">
                        {t('defaultCredentials')}: <span className="font-mono font-medium">admin / admin123</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
