import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { settingsApi } from './api';
import { useAuth } from './AuthContext';

export type ReportSectionId =
    | 'header'
    | 'customerInfo'
    | 'deviceInfo'
    | 'faultDescription'
    | 'actionTaken'
    | 'partsUsed'
    | 'signatures';

export interface ReportSection {
    id: ReportSectionId;
    visible: boolean;
    size?: 'compact' | 'normal' | 'large';
    width?: 'full' | 'half';  // New: for side-by-side layout
}

export interface TemplateConfig {
    id: string;
    name: string;
    sections: ReportSection[];
    companyLogo: string | null;
    companyName: string;
    createdAt: string;
    // Design options
    primaryColor: string;
    fontFamily: string;
    showGridLines: boolean;
    paperSize: 'a4' | 'letter';
}

const defaultSections: ReportSection[] = [
    { id: 'header', visible: true, size: 'normal', width: 'full' },
    { id: 'customerInfo', visible: true, size: 'compact', width: 'half' },
    { id: 'deviceInfo', visible: true, size: 'compact', width: 'half' },
    { id: 'faultDescription', visible: true, size: 'compact', width: 'full' },
    { id: 'actionTaken', visible: true, size: 'compact', width: 'full' },
    { id: 'partsUsed', visible: true, size: 'compact', width: 'full' },
    { id: 'signatures', visible: true, size: 'normal', width: 'full' },
];

const createDefaultTemplate = (id: string = 'default', name: string = 'Varsayılan Şablon'): TemplateConfig => ({
    id,
    name,
    sections: [...defaultSections.map(s => ({ ...s }))],
    companyLogo: null,
    companyName: 'MedTech Service',
    createdAt: new Date().toISOString(),
    primaryColor: '#0ea5e9',
    fontFamily: 'Inter',
    showGridLines: false,
    paperSize: 'a4',
});

interface TemplateContextType {
    // Current template
    template: TemplateConfig;
    // All saved templates
    templates: TemplateConfig[];
    // Template management
    selectTemplate: (id: string) => void;
    saveTemplate: (name?: string) => void;
    saveAsNewTemplate: (name: string) => void;
    deleteTemplate: (id: string) => void;
    duplicateTemplate: (id: string) => void;
    // Section management
    updateSections: (sections: ReportSection[]) => void;
    toggleSectionVisibility: (id: ReportSectionId) => void;
    setSectionSize: (id: ReportSectionId, size: 'compact' | 'normal' | 'large') => void;
    setSectionWidth: (id: ReportSectionId, width: 'full' | 'half') => void;
    // Company settings
    setCompanyLogo: (logo: string | null) => void;
    setCompanyName: (name: string) => void;
    // Design settings
    setPrimaryColor: (color: string) => void;
    setFontFamily: (font: string) => void;
    setShowGridLines: (show: boolean) => void;
    setPaperSize: (size: 'a4' | 'letter') => void;
    // Reset
    resetTemplate: () => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

interface TemplateProviderProps {
    children: ReactNode;
}

export function TemplateProvider({ children }: TemplateProviderProps) {
    const { isAuthenticated } = useAuth(); // Assuming useAuth is available in this scope, if not need to import
    const [isLoading, setIsLoading] = useState(false);

    const [templates, setTemplates] = useState<TemplateConfig[]>(() => {
        const saved = localStorage.getItem('medtech_templates');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Migrate old templates that don't have width property
                const migrated = parsed.map((tmpl: TemplateConfig) => ({
                    ...tmpl,
                    sections: tmpl.sections.map((s: ReportSection) => ({
                        ...s,
                        width: s.width || 'full'
                    }))
                }));
                return migrated.length > 0 ? migrated : [createDefaultTemplate()];
            } catch {
                return [createDefaultTemplate()];
            }
        }
        return [createDefaultTemplate()];
    });

    const [activeTemplateId, setActiveTemplateId] = useState<string>(() => {
        const saved = localStorage.getItem('medtech_active_template');
        return saved || 'default';
    });

    const template = templates.find(t => t.id === activeTemplateId) || templates[0] || createDefaultTemplate();

    // Import these
    // import { settingsApi } from './api';
    // import { useAuth } from './AuthContext';

    // Load settings from backend when authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        const loadSettings = async () => {
            setIsLoading(true);
            try {
                const settings = await settingsApi.get();
                if (settings) {
                    if (settings.companyName) {
                        setCompanyName(settings.companyName, false); // false = don't save back to server immediately
                    }
                    if (settings.companyLogo) {
                        setCompanyLogo(settings.companyLogo, false);
                    }
                    if (settings.templateConfig && Object.keys(settings.templateConfig).length > 0) {
                        // Assuming templateConfig stores the whole templates array or just config
                        // For simplicity, let's say it stores the templates array under a key 'templates'
                        // Or if the backend schema has 'templateConfig' as TEXT, we can store everything there.
                        // Based on server.cjs: templateConfig TEXT. 

                        // Let's adopt a strategy: Sync templates array with backend.
                        // But existing backend structure in server.cjs uses `templateConfig`.
                        // We will store the `templates` array inside `templateConfig`.

                        const config: any = settings.templateConfig;
                        if (config.templates && Array.isArray(config.templates)) {
                            setTemplates(config.templates);
                            if (config.activeId) setActiveTemplateId(config.activeId);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, [isAuthenticated]);

    // Save to localStorage whenever templates change (Keep this for offline/fast access)
    useEffect(() => {
        localStorage.setItem('medtech_templates', JSON.stringify(templates));
    }, [templates]);

    useEffect(() => {
        localStorage.setItem('medtech_active_template', activeTemplateId);
    }, [activeTemplateId]);

    // Save to Backend Helper
    // We want to avoid saving on every keystroke, but for now simple approach:
    // When critical data changes (Logo, Name, or Template Structure on save/update), push to backend.
    // However, `updateCurrentTemplate` is called often.
    // Let's create a debounced save effect or just save when specific actions happen.
    // Ideally, we should unify state. But for "Company Logo" specifically requested:
    // We can add a specialized effect for syncing specific parts if we want.
    // Or just save everything. Let's save everything but maybe debounce it?

    // Actually, `server.cjs` expects `companyName`, `companyLogo`, `templateConfig`.
    // Let's trigger a save whenever `templates` change, but use a timeout to debounce.

    useEffect(() => {
        if (!isAuthenticated) return;

        const handler = setTimeout(() => {
            const settingsToSave = {
                // Wait, the data model in `server.cjs` separates companyName/Logo from `templateConfig`.
                // But in frontend `TemplateConfig` includes `companyName` and `companyLogo`.
                // We should probably sync the ACTIVE template's info to the top-level DB columns as well for backwards compatibility/easier reading?
                // Or just use the first/active template. 
                // Let's proceed with saving the ACTIVE template's name/logo to the columns, AND the full templates array to the JSON blob.

                companyName: template.companyName,
                companyLogo: template.companyLogo || undefined,
                templateConfig: {
                    templates: templates,
                    activeId: activeTemplateId
                }
            };

            // Avoid saving if we are currently loading
            if (!isLoading) {
                settingsApi.save(settingsToSave).catch(e => console.error("Auto-save settings failed", e));
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(handler);
    }, [templates, activeTemplateId, isAuthenticated, isLoading]);


    const updateCurrentTemplate = (updates: Partial<TemplateConfig>) => {
        setTemplates(prev => prev.map(t =>
            t.id === activeTemplateId ? { ...t, ...updates } : t
        ));
    };

    const selectTemplate = (id: string) => {
        setActiveTemplateId(id);
    };

    const saveTemplate = (name?: string) => {
        if (name) {
            updateCurrentTemplate({ name });
        }
    };

    const saveAsNewTemplate = (name: string) => {
        const newTemplate: TemplateConfig = {
            ...template,
            id: Date.now().toString(),
            name,
            createdAt: new Date().toISOString(),
        };
        setTemplates(prev => [...prev, newTemplate]);
        setActiveTemplateId(newTemplate.id);
    };

    const deleteTemplate = (id: string) => {
        if (templates.length <= 1) return; // Keep at least one template
        setTemplates(prev => prev.filter(t => t.id !== id));
        if (activeTemplateId === id) {
            setActiveTemplateId(templates.find(t => t.id !== id)?.id || 'default');
        }
    };

    const duplicateTemplate = (id: string) => {
        const templateToDuplicate = templates.find(t => t.id === id);
        if (templateToDuplicate) {
            const newTemplate: TemplateConfig = {
                ...templateToDuplicate,
                id: Date.now().toString(),
                name: `${templateToDuplicate.name} (Kopya)`,
                createdAt: new Date().toISOString(),
            };
            setTemplates(prev => [...prev, newTemplate]);
        }
    };

    const updateSections = (sections: ReportSection[]) => {
        updateCurrentTemplate({ sections });
    };

    const toggleSectionVisibility = (id: ReportSectionId) => {
        updateCurrentTemplate({
            sections: template.sections.map(s =>
                s.id === id ? { ...s, visible: !s.visible } : s
            ),
        });
    };

    const setSectionSize = (id: ReportSectionId, size: 'compact' | 'normal' | 'large') => {
        updateCurrentTemplate({
            sections: template.sections.map(s =>
                s.id === id ? { ...s, size } : s
            ),
        });
    };

    const setSectionWidth = (id: ReportSectionId, width: 'full' | 'half') => {
        updateCurrentTemplate({
            sections: template.sections.map(s =>
                s.id === id ? { ...s, width } : s
            ),
        });
    };

    // Modified setters to accept a "save" flag? No, generic update logic handles it via useEffect.
    // Just need to ensure they update the state.

    const setCompanyLogo = (logo: string | null, _save: boolean = true) => {
        // Ignoring _save flag because useEffect handles it. 
        // But if we're loading, we might want to suppress the effect-trigger? 
        // "isLoading" state in useEffect dep array helps, or we check it inside.
        // Actually, setting state WILL trigger the effect. 
        // We added (!isLoading) check in the effect.
        updateCurrentTemplate({ companyLogo: logo });
    };

    const setCompanyName = (name: string, _save: boolean = true) => {
        updateCurrentTemplate({ companyName: name });
    };

    const setPrimaryColor = (color: string) => {
        updateCurrentTemplate({ primaryColor: color });
    };

    const setFontFamily = (font: string) => {
        updateCurrentTemplate({ fontFamily: font });
    };

    const setShowGridLines = (show: boolean) => {
        updateCurrentTemplate({ showGridLines: show });
    };

    const setPaperSize = (size: 'a4' | 'letter') => {
        updateCurrentTemplate({ paperSize: size });
    };

    const resetTemplate = () => {
        updateCurrentTemplate({
            sections: [...defaultSections.map(s => ({ ...s }))],
            primaryColor: '#0ea5e9',
            fontFamily: 'Inter',
            showGridLines: false,
            paperSize: 'a4',
        });
    };

    return (
        <TemplateContext.Provider value={{
            template,
            templates,
            selectTemplate,
            saveTemplate,
            saveAsNewTemplate,
            deleteTemplate,
            duplicateTemplate,
            updateSections,
            toggleSectionVisibility,
            setSectionSize,
            setSectionWidth,
            setCompanyLogo,
            setCompanyName,
            setPrimaryColor,
            setFontFamily,
            setShowGridLines,
            setPaperSize,
            resetTemplate,
        }}>
            {children}
        </TemplateContext.Provider>
    );
}

export function useTemplate() {
    const context = useContext(TemplateContext);
    if (context === undefined) {
        throw new Error('useTemplate must be used within a TemplateProvider');
    }
    return context;
}
