import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export function SettingsScreen() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
            ]
        );
    };

    const menuItems = [
        {
            title: 'Uygulama Bilgileri',
            icon: 'information-circle-outline' as const,
            items: [
                { label: 'Versiyon', value: '1.0.0' },
                { label: 'Build', value: '2024.12.08' },
            ],
        },
        {
            title: 'Destek',
            icon: 'help-circle-outline' as const,
            items: [
                {
                    label: 'Yardım',
                    action: () => Alert.alert('Yardım', 'Destek için: destek@medtech.com'),
                    showArrow: true,
                },
                {
                    label: 'Geri Bildirim',
                    action: () => Linking.openURL('mailto:destek@medtech.com'),
                    showArrow: true,
                },
            ],
        },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* User Card */}
            <View style={styles.userCard}>
                <View style={styles.userAvatar}>
                    <Text style={styles.userInitials}>
                        {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user?.fullName}</Text>
                    <Text style={styles.userRole}>
                        {user?.role === 'admin' ? 'Yönetici' : 'Teknisyen'}
                    </Text>
                    <Text style={styles.userUsername}>@{user?.username}</Text>
                </View>
            </View>

            {/* Menu Sections */}
            {menuItems.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name={section.icon} size={20} color="#0ea5e9" />
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                    </View>
                    {section.items.map((item, itemIndex) => (
                        <TouchableOpacity
                            key={itemIndex}
                            style={styles.menuItem}
                            onPress={item.action}
                            disabled={!item.action}
                        >
                            <Text style={styles.menuItemLabel}>{item.label}</Text>
                            {item.value && (
                                <Text style={styles.menuItemValue}>{item.value}</Text>
                            )}
                            {item.showArrow && (
                                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            ))}

            {/* Server Info */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="server-outline" size={20} color="#0ea5e9" />
                    <Text style={styles.sectionTitle}>Sunucu Bağlantısı</Text>
                </View>
                <View style={styles.menuItem}>
                    <Text style={styles.menuItemLabel}>API Sunucusu</Text>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Bağlı</Text>
                </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>MedTech Service</Text>
                <Text style={styles.footerSubtext}>Tıbbi Cihaz Servis Takip Sistemi</Text>
            </View>
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
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    userAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#0ea5e9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInitials: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    userInfo: {
        marginLeft: 16,
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    userRole: {
        fontSize: 14,
        color: '#0ea5e9',
        marginTop: 2,
    },
    userUsername: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 4,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    menuItemLabel: {
        flex: 1,
        fontSize: 15,
        color: '#475569',
    },
    menuItemValue: {
        fontSize: 15,
        color: '#94a3b8',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e',
        marginRight: 6,
    },
    statusText: {
        fontSize: 14,
        color: '#22c55e',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        padding: 16,
        gap: 8,
        marginBottom: 24,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ef4444',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    footerSubtext: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
});
