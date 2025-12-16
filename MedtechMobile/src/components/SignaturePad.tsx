import React, { useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';

interface SignaturePadProps {
    visible: boolean;
    onClose: () => void;
    onOK: (signature: string) => void;
    title?: string;
}

export function SignaturePad({ visible, onClose, onOK, title = 'İmza' }: SignaturePadProps) {
    const ref = useRef<SignatureViewRef>(null);

    const handleOK = (signature: string) => {
        onOK(signature);
        onClose();
    };

    const handleClear = () => {
        ref.current?.clearSignature();
    };

    const handleConfirm = () => {
        ref.current?.readSignature();
    };

    const style = `
        .m-signature-pad--footer {display: none; margin: 0px;}
        body,html {width: 100%; height: 100%;}
    `;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.signatureContainer}>
                        <SignatureScreen
                            ref={ref}
                            onOK={handleOK}
                            webStyle={style}
                            backgroundColor="#fff"
                            bgSrc="" // Transparent background if not specified
                            descriptionText="İmza alanı"
                        />
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                            <Ionicons name="refresh" size={20} color="#64748b" />
                            <Text style={styles.clearButtonText}>Temizle</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveButton} onPress={handleConfirm}>
                            <Ionicons name="checkmark" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>Kaydet</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '70%',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    closeButton: {
        padding: 4,
    },
    signatureContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
    },
    clearButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        padding: 14,
        borderRadius: 12,
        gap: 8,
    },
    clearButtonText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 16,
    },
    saveButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0ea5e9',
        padding: 14,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
