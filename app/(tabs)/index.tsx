import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ScreenScroll from '@/src/components/ScreenScroll';

export default function HomeScreen() {
  return (
    <ScreenScroll>
      <View style={styles.cardPrincipal}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logoImagem}
          resizeMode="contain"
        />

        <Text style={styles.tituloCard}>Análise inteligente de cores</Text>

        <Text style={styles.textoCard}>
          O ColorAssist é um aplicativo para cadastrar peças de roupa e identificar
          a cor predominante por meio de análise de imagem com Inteligência Artificial.
        </Text>

        <TouchableOpacity
          style={styles.botaoPrincipal}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.textoBotaoPrincipal}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={() => router.push('/cadastro')}
        >
          <Text style={styles.textoBotaoSecundario}>Criar conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoSecundario, styles.botaoTeste]}
          onPress={() => router.push('/teste-daltonismo')}
        >
          <Text style={styles.textoBotaoSecundario}>Teste de daltonismo</Text>
        </TouchableOpacity>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  cardPrincipal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  logoImagem: {
    width: 270,
    height: 210,
    marginBottom: 8,
  },
  tituloCard: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 10,
  },
  textoCard: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
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
  },
  textoBotaoSecundario: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoTeste: {
    backgroundColor: '#EEF2FF',
    marginTop: 12,
  },
});
