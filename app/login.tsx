import {
  buscarUsuarioPorEmailSenha,
  garantirUsuarioDemonstracao,
} from '@/src/database/database';
import ScreenScroll from '@/src/components/ScreenScroll';
import { useSessao } from '@/src/contexts/SessaoContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { entrar } = useSessao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }

    const usuario = buscarUsuarioPorEmailSenha(email, senha);

    if (!usuario) {
      Alert.alert('Erro', 'E-mail ou senha inválidos.');
      return;
    }

    entrar(usuario);

    Alert.alert('Sucesso', 'Login realizado com sucesso!');

    router.replace('/home');
  }

  function handleLoginDemonstracao() {
    try {
      garantirUsuarioDemonstracao();
      setEmail('demo@colorassist.com');
      setSenha('123456');
    } catch {
      Alert.alert('Erro', 'NÃ£o foi possÃ­vel preparar o login de demonstraÃ§Ã£o.');
    }
  }

  return (
    <ScreenScroll>
      <View style={styles.card}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.titulo}>Entrar</Text>

        <Text style={styles.subtitulo}>
          Acesse sua conta para cadastrar e analisar suas peças.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity style={styles.botaoPrincipal} onPress={handleLogin}>
          <Text style={styles.textoBotaoPrincipal}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.voltar}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoSecundario} onPress={handleLoginDemonstracao}>
        <Text style={styles.textoBotaoSecundario}>{'Usar login de demonstra\u00e7\u00e3o'}</Text>
      </TouchableOpacity>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  logo: {
    width: 190,
    height: 130,
    alignSelf: 'center',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  botaoPrincipal: {
    backgroundColor: '#4F46E5',
    width: '100%',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoSecundario: {
    backgroundColor: '#EEF2FF',
    width: '100%',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 96,
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  textoBotaoSecundario: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  voltar: {
    textAlign: 'center',
    marginTop: 20,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
});
