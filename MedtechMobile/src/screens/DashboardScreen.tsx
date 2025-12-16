import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { reportService, ServiceReport } from '../services/api';
import { useAuth } from '../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuth();
    const [reports, setReports] = useState<ServiceReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadReports = async (showRefresh = false) => {
        if (showRefresh) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const response = await reportService.getAll();
            setReports(response.data);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadReports();
        }, [])
    );

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
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const renderReportItem = ({ item }: { item: ServiceReport }) => (
        <TouchableOpacity
            style={styles.reportCard}
            onPress={() => navigation.navigate('ReportDetail', { reportId: item.id! })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.reportInfo}>
                    <Text style={styles.deviceType}>{item.deviceType}</Text>
                    <Text style={styles.reportNumber}>#{item.reportNumber || item.id?.slice(0, 8)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="business-outline" size={16} color="#64748b" />
                    <Text style={styles.infoText}>{item.customerName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="hardware-chip-outline" size={16} color="#64748b" />
                    <Text style={styles.infoText}>{item.brand} {item.model}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#64748b" />
                    <Text style={styles.infoText}>{formatDate(item.serviceDate)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Merhaba, {user?.fullName}</Text>
                <Text style={styles.subtitle}>{reports.length} servis raporu</Text>
            </View>
            <TouchableOpacity
                style={styles.qrButton}
                onPress={() => navigation.navigate('QRScanner')}
            >
                <Ionicons name="qr-code" size={24} color="#0ea5e9" />
            </TouchableOpacity>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Henüz rapor yok</Text>
            <Text style={styles.emptyText}>Yeni bir servis raporu oluşturmak için + butonuna tıklayın</Text>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={reports}
                keyExtractor={(item) => item.id!}
                renderItem={renderReportItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => loadReports(true)}
                        colors={['#0ea5e9']}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    qrButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    reportInfo: {
        flex: 1,
    },
    deviceType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    reportNumber: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardBody: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#475569',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
});
