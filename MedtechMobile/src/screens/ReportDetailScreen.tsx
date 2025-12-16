import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { reportService, ServiceReport } from '../services/api';

type RouteProps = RouteProp<RootStackParamList, 'ReportDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ReportDetailScreen() {
    const route = useRoute<RouteProps>();
    const navigation = useNavigation<NavigationProp>();
    const [report, setReport] = useState<ServiceReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadReport();
    }, [route.params.reportId]);

    const loadReport = async () => {
        try {
            const response = await reportService.getById(route.params.reportId);
            setReport(response.data);
        } catch (error) {
            Alert.alert('Hata', 'Rapor yüklenemedi.');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        navigation.navigate('ReportForm', { reportId: route.params.reportId });
    };

    const handleDelete = () => {
        Alert.alert(
            'Raporu Sil',
            'Bu raporu silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await reportService.delete(route.params.reportId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Hata', 'Rapor silinemedi.');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#22c55e';
            case 'pending': return '#f59e0b';
            case 'parts_needed': return '#3b82f6';
            case 'scrapped': return '#ef4444';
            default: return '#64748b';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'Tamamlandı';
            case 'pending': return 'Bekliyor';
            case 'parts_needed': return 'Parça Bekliyor';
            case 'scrapped': return 'Hurda';
            default: return status;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
        );
    }

    if (!report) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Status Badge */}
            <View style={[styles.statusBanner, { backgroundColor: getStatusColor(report.status) }]}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.statusBannerText}>{getStatusText(report.status)}</Text>
            </View>

            {/* Device Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cihaz Bilgileri</Text>
                <View style={styles.infoGrid}>
                    <InfoItem label="Cihaz Türü" value={report.deviceType} />
                    <InfoItem label="Marka" value={report.brand} />
                    <InfoItem label="Model" value={report.model} />
                    <InfoItem label="Seri No" value={report.serialNumber} />
                    {report.tagNumber && <InfoItem label="Künye No" value={report.tagNumber} />}
                    {report.productionYear && <InfoItem label="Üretim Yılı" value={report.productionYear} />}
                </View>
            </View>

            {/* Customer Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
                <View style={styles.infoGrid}>
                    <InfoItem label="Kurum/Hastane" value={report.customerName} full />
                    {report.department && <InfoItem label="Bölüm" value={report.department} />}
                    {report.contactPerson && <InfoItem label="Yetkili" value={report.contactPerson} />}
                </View>
            </View>

            {/* Fault Description */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Arıza Açıklaması</Text>
                <Text style={styles.descriptionText}>{report.faultDescription}</Text>
            </View>

            {/* Action Taken */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Yapılan İşlem</Text>
                <Text style={styles.descriptionText}>{report.actionTaken}</Text>
            </View>

            {/* Notes */}
            {report.notes && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notlar</Text>
                    <Text style={styles.descriptionText}>{report.notes}</Text>
                </View>
            )}

            {/* Photos */}
            {report.photos && report.photos.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fotoğraflar</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.photoGrid}>
                            {report.photos.map((photo, index) => (
                                <Image key={index} source={{ uri: photo }} style={styles.photo} />
                            ))}
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* Signatures */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>İmzalar</Text>
                <View style={styles.signaturesRow}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Teknisyen</Text>
                        <Text style={styles.signatureName}>{report.technicianName}</Text>
                        {report.technicianSignature ? (
                            <Image source={{ uri: report.technicianSignature }} style={styles.signatureImage} />
                        ) : (
                            <View style={styles.signaturePlaceholder}>
                                <Text style={styles.signaturePlaceholderText}>İmza yok</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Müşteri</Text>
                        <Text style={styles.signatureName}>{report.contactPerson || 'Yetkili'}</Text>
                        {report.customerSignature ? (
                            <Image source={{ uri: report.customerSignature }} style={styles.signatureImage} />
                        ) : (
                            <View style={styles.signaturePlaceholder}>
                                <Text style={styles.signaturePlaceholderText}>İmza yok</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Tarih: {formatDate(report.serviceDate)}</Text>
                <Text style={styles.footerText}>Rapor No: #{report.reportNumber || report.id?.slice(0, 8)}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                    <Ionicons name="pencil" size={20} color="#fff" />
                    <Text style={styles.editButtonText}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Ionicons name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

function InfoItem({ label, value, full }: { label: string; value: string; full?: boolean }) {
    return (
        <View style={[styles.infoItem, full && styles.infoItemFull]}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
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
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    statusBannerText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0ea5e9',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    infoItem: {
        width: '48%',
    },
    infoItemFull: {
        width: '100%',
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
    },
    descriptionText: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 22,
    },
    photoGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    signaturesRow: {
        flexDirection: 'row',
        gap: 12,
    },
    signatureBox: {
        flex: 1,
        alignItems: 'center',
    },
    signatureLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    signatureName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    signatureImage: {
        width: '100%',
        height: 60,
        resizeMode: 'contain',
    },
    signaturePlaceholder: {
        width: '100%',
        height: 60,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signaturePlaceholderText: {
        color: '#94a3b8',
        fontSize: 12,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    footerText: {
        fontSize: 12,
        color: '#64748b',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0ea5e9',
        borderRadius: 12,
        padding: 14,
        gap: 8,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        width: 52,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee2e2',
        borderRadius: 12,
    },
});
