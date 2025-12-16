import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Hata', 'Kullanıcı adı ve şifre gereklidir.');
            return;
        }

        setIsLoading(true);
        const result = await login(username, password);
        setIsLoading(false);

        if (!result.success) {
            Alert.alert('Giriş Başarısız', result.error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="medkit" size={48} color="#fff" />
                    </View>
                    <Text style={styles.title}>MedTech Service</Text>
                    <Text style={styles.subtitle}>Tıbbi Cihaz Servis Takibi</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Kullanıcı Adı"
                            placeholderTextColor="#94a3b8"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Şifre"
                            placeholderTextColor="#94a3b8"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#64748b"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.loginButtonText}>Giriş Yap</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Varsayılan giriş: admin / admin123
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0ea5e9',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 52,
        fontSize: 16,
        color: '#1e293b',
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0ea5e9',
        borderRadius: 12,
        height: 52,
        marginTop: 8,
        gap: 8,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
});
