import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Save, FileText, PenTool, Camera, Mail } from 'lucide-react';
import { serviceReportSchema, type ServiceReport, DEVICE_TYPES } from '../types';
import { useLanguage } from '../LanguageContext';
import { deviceTypeTranslationMap } from '../i18n';
import { QRScanner } from './QRScanner';
import { SignaturePad } from './SignaturePad';
import { PhotoUploader } from './PhotoUploader';

interface ServiceFormProps {
    onSubmit: (data: ServiceReport) => void;
    initialData?: Partial<ServiceReport>;
    isEditing?: boolean;
}

export function ServiceForm({ onSubmit, initialData, isEditing }: ServiceFormProps) {
    const { t } = useLanguage();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ServiceReport>({
        resolver: zodResolver(serviceReportSchema),
        defaultValues: {
            serviceDate: new Date().toISOString().split('T')[0],
            status: 'completed',
            partsUsed: [],
            photos: [],
            ...initialData,
        },
    });

    // Watch for photos and signatures
    const photos = watch('photos') || [];
    const technicianSignature = watch('technicianSignature');
    const customerSignature = watch('customerSignature');

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'partsUsed',
    });

    const getDeviceTypeTranslation = (deviceType: string) => {
        const key = deviceTypeTranslationMap[deviceType];
        return key ? t(key) : deviceType;
    };

    const handleQRDataExtracted = (data: {
        deviceType?: string;
        brand?: string;
        model?: string;
        serialNumber?: string;
        tagNumber?: string;
        productionYear?: string;
        customerName?: string;
        department?: string;
    }) => {
        if (data.deviceType) setValue('deviceType', data.deviceType);
        if (data.brand) setValue('brand', data.brand);
        if (data.model) setValue('model', data.model);
        if (data.serialNumber) setValue('serialNumber', data.serialNumber);
        if (data.tagNumber) setValue('tagNumber', data.tagNumber);
        if (data.productionYear) setValue('productionYear', data.productionYear);
        if (data.customerName) setValue('customerName', data.customerName);
        if (data.department) setValue('department', data.department);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">

            {/* Report Information Section */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-xl border border-primary-200 shadow-sm">
                <h3 className="text-lg font-semibold text-primary-900 mb-4 border-b border-primary-200 pb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {t('reportInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-primary-800">{t('reportNumber')}</label>
                        <input
                            type="text"
                            {...register('reportNumber')}
                            className="w-full rounded-lg border-primary-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                            placeholder={t('reportNumberPlaceholder')}
                        />
                        <p className="text-xs text-primary-600">{t('reportNumberHint')}</p>
                    </div>
                </div>
            </div>

            {/* QR Scanner Section - Only visible in app, not in print */}
            {!isEditing && (
                <QRScanner onDataExtracted={handleQRDataExtracted} />
            )}

            {/* Device Information Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                    {t('deviceInformation')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('deviceType')}</label>
                        <select
                            {...register('deviceType')}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        >
                            <option value="">{t('selectType')}</option>
                            {DEVICE_TYPES.map((type) => (
                                <option key={type} value={type}>{getDeviceTypeTranslation(type)}</option>
                            ))}
                        </select>
                        {errors.deviceType && <p className="text-red-500 text-xs">{errors.deviceType.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('brand')}</label>
                        <input
                            type="text"
                            {...register('brand')}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            placeholder={t('brandPlaceholder')}
                        />
                        {errors.brand && <p className="text-red-500 text-xs">{errors.brand.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('model')}</label>
                        <input
                            type="text"
                            {...register('model')}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                        {errors.model && <p className="text-red-500 text-xs">{errors.model.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('serialNumber')}</label>
                        <input
                            type="text"
                            {...register('serialNumber')}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                        {errors.serialNumber && <p className="text-red-500 text-xs">{errors.serialNumber.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('tagNumber')}</label>
                        <input
                            type="text"
                            {...register('tagNumber')}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('productionYear')}</label>
                        <input
                            type="text"
                            {...register('productionYear')}
                            placeholder="2020"
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Customer Information Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                    {t('customerInformation')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('customerName')}</label>
                        <input
                            type="text"
                            {...register('customerName')}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                        {errors.customerName && <p className="text-red-500 text-xs">{errors.customerName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('department')}</label>
                        <input
                            type="text"
                            {...register('department')}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('contactPerson')}</label>
                        <input
                            type="text"
                            {...register('contactPerson')}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Service Details Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                    {t('serviceDetails')}
                </h3>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('faultDescription')}</label>
                        <textarea
                            {...register('faultDescription')}
                            rows={3}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            placeholder={t('faultPlaceholder')}
                        />
                        {errors.faultDescription && <p className="text-red-500 text-xs">{errors.faultDescription.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('actionTaken')}</label>
                        <textarea
                            {...register('actionTaken')}
                            rows={4}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            placeholder={t('actionPlaceholder')}
                        />
                        {errors.actionTaken && <p className="text-red-500 text-xs">{errors.actionTaken.message}</p>}
                    </div>

                    {/* Parts Used Dynamic Fields */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-slate-700">{t('partsUsed')}</label>
                            <button
                                type="button"
                                onClick={() => append({ name: '', quantity: 1 })}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> {t('addPart')}
                            </button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-3 items-start flex-col sm:flex-row">
                                <div className="flex-1 w-full sm:w-auto">
                                    <input
                                        {...register(`partsUsed.${index}.name` as const)}
                                        placeholder={t('partName')}
                                        className="w-full rounded-lg border-slate-300 border p-2 text-sm"
                                    />
                                </div>
                                <div className="w-full sm:w-24">
                                    <input
                                        {...register(`partsUsed.${index}.code` as const)}
                                        placeholder={t('code')}
                                        className="w-full rounded-lg border-slate-300 border p-2 text-sm"
                                    />
                                </div>
                                <div className="w-full sm:w-20">
                                    <input
                                        type="number"
                                        {...register(`partsUsed.${index}.quantity` as const, { valueAsNumber: true })}
                                        placeholder={t('qty')}
                                        className="w-full rounded-lg border-slate-300 border p-2 text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors self-end sm:self-center"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Final Details */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('statusLabel')}</label>
                        <select
                            {...register('status')}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        >
                            <option value="completed">{t('completed')}</option>
                            <option value="pending">{t('pending')}</option>
                            <option value="parts_needed">{t('partsNeeded')}</option>
                            <option value="scrapped">{t('scrapped')}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('technicianName')}</label>
                        <input
                            type="text"
                            {...register('technicianName')}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                        {errors.technicianName && <p className="text-red-500 text-xs">{errors.technicianName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{t('dateLabel')}</label>
                        <input
                            type="date"
                            {...register('serviceDate')}
                            className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                        {errors.serviceDate && <p className="text-red-500 text-xs">{errors.serviceDate.message}</p>}
                    </div>
                </div>
            </div>

            {/* Photos Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Fotoğraflar
                </h3>
                <PhotoUploader
                    photos={photos}
                    onPhotosChange={(newPhotos) => setValue('photos', newPhotos)}
                    maxPhotos={5}
                />
            </div>

            {/* Customer Email Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Müşteri İletişim
                </h3>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Müşteri E-posta Adresi</label>
                    <input
                        type="email"
                        {...register('customerEmail')}
                        placeholder="ornek@hastane.com"
                        className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                    {errors.customerEmail && <p className="text-red-500 text-xs">{errors.customerEmail.message}</p>}
                    <p className="text-xs text-slate-500">Rapor tamamlandığında bu adrese e-posta gönderilebilir.</p>
                </div>
            </div>

            {/* Signatures Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <PenTool className="w-5 h-5" />
                    İmzalar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SignaturePad
                        label="Teknisyen İmzası"
                        signerName={watch('technicianName')}
                        initialSignature={technicianSignature}
                        onSave={(sig) => setValue('technicianSignature', sig)}
                        onClear={() => setValue('technicianSignature', undefined)}
                    />
                    <SignaturePad
                        label="Müşteri İmzası"
                        signerName={watch('contactPerson')}
                        initialSignature={customerSignature}
                        onSave={(sig) => setValue('customerSignature', sig)}
                        onClear={() => setValue('customerSignature', undefined)}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5" />
                    {t('generateReport')}
                </button>
            </div>
        </form>
    );
}
