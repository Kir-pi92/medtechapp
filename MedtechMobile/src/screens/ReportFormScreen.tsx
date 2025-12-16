import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../App';
import { reportService, ServiceReport } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SignaturePad } from '../components/SignaturePad';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ReportForm'>;

const DEVICE_TYPES = [
    'Patient Monitor',
    'ECG Machine',
    'Defibrillator',
    'Ventilator',
    'Infusion Pump',
    'Ultrasound',
    'X-Ray',
    'CT Scanner',
    'MRI',
    'Other',
];

const STATUS_OPTIONS = [
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'pending', label: 'Bekliyor' },
    { value: 'parts_needed', label: 'Parça Bekliyor' },
    { value: 'scrapped', label: 'Hurda' },
];

export function ReportFormScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Signature State
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [activeSignatureField, setActiveSignatureField] = useState<'technicianSignature' | 'customerSignature' | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<ServiceReport>>({
        deviceType: '',
        brand: '',
        model: '',
        serialNumber: '',
        tagNumber: '',
        productionYear: '',
        customerName: '',
        department: '',
        contactPerson: '',
        customerEmail: '',
        faultDescription: '',
        actionTaken: '',
        status: 'completed',
        technicianName: user?.fullName || '',
        notes: '',
        serviceDate: new Date().toISOString().split('T')[0],
        photos: [],
        technicianSignature: '',
        customerSignature: '',
    });

    useEffect(() => {
        // Load existing report if editing
        if (route.params?.reportId) {
            loadReport(route.params.reportId);
        }
        // Apply QR data if available
        if (route.params?.qrData) {
            const qr = route.params.qrData;
            setFormData(prev => ({
                ...prev,
                ...qr,
            }));
        }
    }, [route.params]);

    const loadReport = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await reportService.getById(id);
            setFormData(response.data);
        } catch (error) {
            Alert.alert('Hata', 'Rapor yüklenemedi.');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const required = ['deviceType', 'brand', 'model', 'serialNumber', 'customerName', 'faultDescription', 'actionTaken', 'technicianName'];
        for (const field of required) {
            if (!formData[field as keyof ServiceReport]) {
                Alert.alert('Eksik Alan', `${field} alanı gereklidir.`);
                return false;
            }
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            if (route.params?.reportId) {
                await reportService.update(route.params.reportId, formData as ServiceReport);
            } else {
                await reportService.create(formData as ServiceReport);
            }
            Alert.alert('Başarılı', 'Rapor kaydedildi.', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Hata', 'Rapor kaydedilemedi.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (field: keyof ServiceReport, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Signature Handlers
    const openSignatureModal = (field: 'technicianSignature' | 'customerSignature') => {
        setActiveSignatureField(field);
        setShowSignatureModal(true);
    };

    const handleSignatureOK = (signature: string) => {
        if (activeSignatureField) {
            updateField(activeSignatureField, signature);
        }
    };

    // Photo Handlers
    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Fotoğraf erişim izni gerekiyor.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const base64Img = `data:image/jpeg;base64,${asset.base64}`;

            setFormData(prev => ({
                ...prev,
                photos: [...(prev.photos || []), base64Img]
            }));
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Kamera erişim izni gerekiyor.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const base64Img = `data:image/jpeg;base64,${asset.base64}`;

            setFormData(prev => ({
                ...prev,
                photos: [...(prev.photos || []), base64Img]
            }));
        }
    };

    const removePhoto = (index: number) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos?.filter((_, i) => i !== index)
        }));
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Device Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cihaz Bilgileri</Text>

                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Cihaz Türü *</Text>
                    <View style={styles.picker}>
                        <Picker
                            selectedValue={formData.deviceType}
                            onValueChange={(value) => updateField('deviceType', value)}
                        >
                            <Picker.Item label="Seçiniz..." value="" />
                            {DEVICE_TYPES.map((type) => (
                                <Picker.Item key={type} label={type} value={type} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Marka *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.brand}
                            onChangeText={(v) => updateField('brand', v)}
                            placeholder="Marka"
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Model *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.model}
                            onChangeText={(v) => updateField('model', v)}
                            placeholder="Model"
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Seri No *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.serialNumber}
                            onChangeText={(v) => updateField('serialNumber', v)}
                            placeholder="Seri Numarası"
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Künye No</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.tagNumber}
                            onChangeText={(v) => updateField('tagNumber', v)}
                            placeholder="Künye No"
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Üretim Yılı</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.productionYear}
                        onChangeText={(v) => updateField('productionYear', v)}
                        placeholder="Örn: 2023"
                        keyboardType="numeric"
                    />
                </View>
            </View>

            {/* Customer Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>

                <Text style={styles.label}>Kurum/Hastane Adı *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.customerName}
                    onChangeText={(v) => updateField('customerName', v)}
                    placeholder="Kurum/Hastane Adı"
                />

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Bölüm</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.department}
                            onChangeText={(v) => updateField('department', v)}
                            placeholder="Bölüm"
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Yetkili Kişi</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.contactPerson}
                            onChangeText={(v) => updateField('contactPerson', v)}
                            placeholder="Yetkili"
                        />
                    </View>
                </View>

                <Text style={styles.label}>E-posta</Text>
                <TextInput
                    style={styles.input}
                    value={formData.customerEmail}
                    onChangeText={(v) => updateField('customerEmail', v)}
                    placeholder="ornek@musteri.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            {/* Service Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Servis Detayları</Text>

                <Text style={styles.label}>Arıza Açıklaması *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.faultDescription}
                    onChangeText={(v) => updateField('faultDescription', v)}
                    placeholder="Arıza açıklamasını yazın..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                <Text style={styles.label}>Yapılan İşlem *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.actionTaken}
                    onChangeText={(v) => updateField('actionTaken', v)}
                    placeholder="Yapılan işlemi yazın..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Durum</Text>
                    <View style={styles.picker}>
                        <Picker
                            selectedValue={formData.status}
                            onValueChange={(value) => updateField('status', value)}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <Text style={styles.label}>Teknisyen *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.technicianName}
                    onChangeText={(v) => updateField('technicianName', v)}
                    placeholder="Teknisyen adı"
                />

                <Text style={styles.label}>Notlar</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.notes}
                    onChangeText={(v) => updateField('notes', v)}
                    placeholder="Ek notlar..."
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />
            </View>

            {/* Photos */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fotoğraflar</Text>

                <View style={styles.photoButtons}>
                    <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                        <Ionicons name="images" size={20} color="#0ea5e9" />
                        <Text style={styles.photoButtonText}>Galeri</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                        <Ionicons name="camera" size={20} color="#0ea5e9" />
                        <Text style={styles.photoButtonText}>Kamera</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                    {formData.photos?.map((photo, index) => (
                        <View key={index} style={styles.photoContainer}>
                            <Image source={{ uri: photo }} style={styles.photoThumbnail} />
                            <TouchableOpacity
                                style={styles.removePhotoButton}
                                onPress={() => removePhoto(index)}
                            >
                                <Ionicons name="close-circle" size={24} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Signatures */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>İmzalar</Text>

                <View style={styles.signatureRow}>
                    <View style={styles.signatureCol}>
                        <Text style={styles.label}>Teknisyen İmzası</Text>
                        <TouchableOpacity
                            style={styles.signatureBox}
                            onPress={() => openSignatureModal('technicianSignature')}
                        >
                            {formData.technicianSignature ? (
                                <Image
                                    source={{ uri: formData.technicianSignature }}
                                    style={styles.signaturePreview}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.signaturePlaceholder}>
                                    <Ionicons name="create-outline" size={24} color="#94a3b8" />
                                    <Text style={styles.signaturePlaceholderText}>İmzala</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {formData.technicianSignature && (
                            <TouchableOpacity
                                onPress={() => updateField('technicianSignature', '')}
                                style={styles.clearSignature}
                            >
                                <Text style={styles.clearSignatureText}>Temizle</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.signatureCol}>
                        <Text style={styles.label}>Müşteri İmzası</Text>
                        <TouchableOpacity
                            style={styles.signatureBox}
                            onPress={() => openSignatureModal('customerSignature')}
                        >
                            {formData.customerSignature ? (
                                <Image
                                    source={{ uri: formData.customerSignature }}
                                    style={styles.signaturePreview}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.signaturePlaceholder}>
                                    <Ionicons name="create-outline" size={24} color="#94a3b8" />
                                    <Text style={styles.signaturePlaceholderText}>İmzala</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {formData.customerSignature && (
                            <TouchableOpacity
                                onPress={() => updateField('customerSignature', '')}
                                style={styles.clearSignature}
                            >
                                <Text style={styles.clearSignatureText}>Temizle</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Ionicons name="save" size={20} color="#fff" />
                        <Text style={styles.saveButtonText}>Kaydet</Text>
                    </>
                )}
            </TouchableOpacity>

            <SignaturePad
                visible={showSignatureModal}
                onClose={() => setShowSignatureModal(false)}
                onOK={handleSignatureOK}
                title={activeSignatureField === 'technicianSignature' ? 'Teknisyen İmzası' : 'Müşteri İmzası'}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0ea5e9',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    inputContainer: {
        marginBottom: 12,
    },
    textArea: {
        height: 100,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    pickerContainer: {
        marginBottom: 12,
    },
    picker: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0ea5e9',
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    // Photos
    photoButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    photoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f9ff',
        padding: 12,
        borderRadius: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: '#bae6fd',
    },
    photoButtonText: {
        color: '#0ea5e9',
        fontWeight: '600',
        fontSize: 14,
    },
    photoScroll: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    photoContainer: {
        marginRight: 12,
        position: 'relative',
    },
    photoThumbnail: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
    },
    removePhotoButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    // Signatures
    signatureRow: {
        flexDirection: 'row',
        gap: 12,
    },
    signatureCol: {
        flex: 1,
    },
    signatureBox: {
        height: 80,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        overflow: 'hidden',
    },
    signaturePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    signaturePlaceholderText: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    signaturePreview: {
        width: '100%',
        height: '100%',
    },
    clearSignature: {
        alignItems: 'center',
    },
    clearSignatureText: {
        fontSize: 12,
        color: '#ef4444',
    },
});
