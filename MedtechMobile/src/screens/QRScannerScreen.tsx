import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { deviceService } from '../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function QRScannerScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, []);

    const extractKnoFromUrl = (url: string): string | null => {
        try {
            // Handle Sağlık Bakanlığı QR format
            const knoMatch = url.match(/[?&]kno=([^&]+)/i);
            if (knoMatch) return knoMatch[1];

            // Handle direct kno value
            if (/^\d+$/.test(url)) return url;

            return null;
        } catch {
            return null;
        }
    };

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned || isLoading) return;

        setScanned(true);
        const kno = extractKnoFromUrl(data);

        if (!kno) {
            Alert.alert(
                'QR Kod Tanınmadı',
                'Bu QR kod desteklenmiyor. Manuel giriş yapmak ister misiniz?',
                [
                    { text: 'İptal', onPress: () => setScanned(false) },
                    { text: 'Manuel Giriş', onPress: () => navigation.navigate('ReportForm') },
                ]
            );
            return;
        }

        setIsLoading(true);
        try {
            const response = await deviceService.getByKno(kno);
            const deviceData = response.data.data;

            if (deviceData) {
                navigation.navigate('ReportForm', {
                    qrData: {
                        deviceType: deviceData.deviceType || deviceData.materialDescription || '',
                        brand: deviceData.brand || '',
                        model: deviceData.model || '',
                        serialNumber: deviceData.serialNumber || '',
                        tagNumber: deviceData.kimlikNo || kno,
                        customerName: deviceData.institutionName || '',
                        department: deviceData.assigneeLocation || deviceData.location || '',
                    }
                });
            } else {
                Alert.alert('Veri Bulunamadı', 'Cihaz bilgisi bulunamadı.');
                setScanned(false);
            }
        } catch (error) {
            console.error('Error fetching device data:', error);
            Alert.alert(
                'Bağlantı Hatası',
                'Cihaz bilgisi alınamadı. Manuel giriş yapmak ister misiniz?',
                [
                    { text: 'Tekrar Dene', onPress: () => setScanned(false) },
                    { text: 'Manuel Giriş', onPress: () => navigation.navigate('ReportForm') },
                ]
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={64} color="#64748b" />
                <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
                <Text style={styles.permissionText}>
                    QR kod taramak için kamera erişimine izin vermeniz gerekmektedir.
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>İzin Ver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
                {/* Overlay */}
                <View style={styles.overlay}>
                    {/* Top */}
                    <View style={styles.overlayTop} />

                    {/* Middle row */}
                    <View style={styles.overlayMiddle}>
                        <View style={styles.overlaySide} />
                        <View style={styles.scanArea}>
                            <View style={[styles.corner, styles.cornerTL]} />
                            <View style={[styles.corner, styles.cornerTR]} />
                            <View style={[styles.corner, styles.cornerBL]} />
                            <View style={[styles.corner, styles.cornerBR]} />
                        </View>
                        <View style={styles.overlaySide} />
                    </View>

                    {/* Bottom */}
                    <View style={styles.overlayBottom}>
                        <Text style={styles.instructionText}>
                            Cihaz künye QR kodunu çerçeve içine yerleştirin
                        </Text>
                        {isLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator color="#fff" />
                                <Text style={styles.loadingText}>Veri alınıyor...</Text>
                            </View>
                        )}
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f1f5f9',
    },
    permissionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 8,
    },
    permissionText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
    },
    permissionButton: {
        backgroundColor: '#0ea5e9',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    overlay: {
        flex: 1,
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlayMiddle: {
        flexDirection: 'row',
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    scanArea: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#0ea5e9',
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        paddingTop: 30,
    },
    instructionText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        gap: 8,
    },
    loadingText: {
        color: '#fff',
        fontSize: 14,
    },
});
