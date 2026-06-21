import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ScreenScroll from '@/src/components/ScreenScroll';
import { useSessao } from '@/src/contexts/SessaoContext';

export default function HomeAppScreen() {
  const { sair } = useSessao();

  function handleSair() {
    sair();
    router.replace('/');
  }

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.titulo}>Bem-vindo!</Text>

        <Text style={styles.subtitulo}>
          Escolha uma opção para começar a usar o ColorAssist.
        </Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.botaoPrincipal}
          onPress={() => router.push('/nova-peca')}
        >
          <Text style={styles.textoBotaoPrincipal}>Cadastrar peça</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={styles.botaoSecundario}
  onPress={() => router.push('/minhas-pecas')}
>
  <Text style={styles.textoBotaoSecundario}>Minhas peças</Text>
</TouchableOpacity>
        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={() => router.push('/comparar-roupas')}
        >
          <Text style={styles.textoBotaoSecundario}>Comparar roupas</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.botaoSair}
        onPress={handleSair}
      >
        <Text style={styles.textoSair}>Sair</Text>
      </TouchableOpacity>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 220,
    height: 160,
    marginBottom: 8,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  botaoPrincipal: {
    backgroundColor: '#4F46E5',
    width: '100%',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoSecundario: {
    backgroundColor: '#F8FAFC',
    width: '100%',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 12,
  },
  textoBotaoSecundario: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoSair: {
    backgroundColor: '#FEE2E2',
    width: '100%',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 96,
  },
  textoSair: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
