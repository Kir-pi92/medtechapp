import { useTemplate } from '../TemplateContext';
import { ClipboardList } from 'lucide-react';

export function CompanyLogo() {
    const { template } = useTemplate();

    if (template.companyLogo) {
        return (
            <img
                src={template.companyLogo}
                alt={template.companyName || 'Company Logo'}
                className="h-10 w-auto max-w-[120px] object-contain"
            />
        );
    }

    // Default logo if no company logo is set
    return (
        <div className="bg-primary-100 p-2 rounded-lg">
            <ClipboardList className="w-6 h-6 text-primary-600" />
        </div>
    );
}
