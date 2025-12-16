import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
    { id: 'customerInfo', visible: true, size: 'normal', width: 'half' },
    { id: 'deviceInfo', visible: true, size: 'normal', width: 'half' },
    { id: 'faultDescription', visible: true, size: 'normal', width: 'full' },
    { id: 'actionTaken', visible: true, size: 'normal', width: 'full' },
    { id: 'partsUsed', visible: true, size: 'normal', width: 'full' },
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

    // Save to localStorage whenever templates change
    useEffect(() => {
        localStorage.setItem('medtech_templates', JSON.stringify(templates));
    }, [templates]);

    useEffect(() => {
        localStorage.setItem('medtech_active_template', activeTemplateId);
    }, [activeTemplateId]);

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

    const setCompanyLogo = (logo: string | null) => {
        updateCurrentTemplate({ companyLogo: logo });
    };

    const setCompanyName = (name: string) => {
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
