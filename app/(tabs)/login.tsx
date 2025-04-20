import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar, Animated
} from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [nickname, setNickname] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  // 애니메이션 값 초기화
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0, duration: 1000, useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 1000, useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const onSubmit = () => {
    const name = nickname.trim();
    if (!name) return;
    router.replace({ pathname: '/', params: { nickname: name } });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={styles.container.backgroundColor} />

      <Animated.View style={[
        styles.inner,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}>
        <Text style={styles.logo}>Q&AI</Text>
        <Text style={styles.title}>👋 닉네임을 입력해주세요</Text>

        <TextInput
          style={[styles.input, isFocused && styles.inputFocused]}
          placeholder="예) 궁금이1"
          placeholderTextColor="#999"
          value={nickname}
          onChangeText={setNickname}
          autoCapitalize="none"
          selectionColor={PRIMARY_GREEN}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <TouchableOpacity
          style={[styles.button, !nickname.trim() && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={!nickname.trim()}
        >
          <Text style={styles.buttonText}>확인</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const PRIMARY_GREEN = '#03C75A';  // Naver 공식 로고 그린  
const WHITE = '#FFFFFF';

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: WHITE,
    justifyContent: 'center', alignItems: 'center',
    padding: 24,
  },
  inner: {
    width: '100%', alignItems: 'center',
  },
  logo: {
    fontSize: 32, fontWeight: '700',
    color: PRIMARY_GREEN, marginBottom: 16,
  },
  title: {
    fontSize: 24, fontWeight: '600',
    color: PRIMARY_GREEN, marginBottom: 20,
  },
  input: {
    width: '80%',
    paddingVertical: 12, paddingHorizontal: 16,
    borderColor: PRIMARY_GREEN, borderWidth: 1,
    borderRadius: 8, marginBottom: 20,
    fontSize: 16, color: '#333',
  },
  inputFocused: {
    borderColor: PRIMARY_GREEN,
    shadowColor: PRIMARY_GREEN, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, elevation: 2,
  },
  button: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#A3D9A5',
  },
  buttonText: {
    color: WHITE, fontSize: 18, fontWeight: '600',
  },
});
