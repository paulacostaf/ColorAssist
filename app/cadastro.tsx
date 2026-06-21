import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { cadastrarUsuario } from '@/src/database/database';
import ScreenScroll from '@/src/components/ScreenScroll';

const TIPOS_DALTONISMO = [
  'Não sei informar',
  'Protanopia / Protanomalia',
  'Deuteranopia / Deuteranomalia',
  'Tritanopia / Tritanomalia',
  'Outro',
];

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoDaltonismo, setTipoDaltonismo] = useState('Não sei informar');
  const [modalDaltonismoVisivel, setModalDaltonismoVisivel] = useState(false);

  function handleCadastrar() {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    try {
      cadastrarUsuario(nome, email, senha, tipoDaltonismo);

      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');

      router.push('/login');
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar. Verifique se o e-mail já foi usado.');
    }
  }

  function selecionarTipoDaltonismo(tipo: string) {
    setTipoDaltonismo(tipo);
    setModalDaltonismoVisivel(false);
  }

  return (
    <ScreenScroll>
      <View style={styles.card}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.titulo}>Criar conta</Text>

        <Text style={styles.subtitulo}>
          Cadastre-se para salvar suas peças e análises de cores.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#94A3B8"
          value={nome}
          onChangeText={setNome}
        />

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

        <Text style={styles.labelCampo}>Tipo de daltonismo</Text>

        <TouchableOpacity
          style={styles.seletor}
          onPress={() => setModalDaltonismoVisivel(true)}
        >
          <Text style={styles.textoSeletor}>{tipoDaltonismo}</Text>
          <Text style={styles.iconeSeletor}>v</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoPrincipal} onPress={handleCadastrar}>
          <Text style={styles.textoBotaoPrincipal}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.voltar}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={modalDaltonismoVisivel}
        onRequestClose={() => setModalDaltonismoVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Tipo de daltonismo</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {TIPOS_DALTONISMO.map((tipo) => {
                const selecionado = tipoDaltonismo === tipo;

                return (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.opcaoModal,
                      selecionado && styles.opcaoModalSelecionada,
                    ]}
                    onPress={() => selecionarTipoDaltonismo(tipo)}
                  >
                    <Text
                      style={[
                        styles.textoOpcaoModal,
                        selecionado && styles.textoOpcaoModalSelecionada,
                      ]}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.botaoFecharModal}
              onPress={() => setModalDaltonismoVisivel(false)}
            >
              <Text style={styles.textoFecharModal}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  labelCampo: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  seletor: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textoSeletor: {
    color: '#1E293B',
    fontSize: 16,
    flex: 1,
  },
  iconeSeletor: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 12,
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
  voltar: {
    textAlign: 'center',
    marginTop: 20,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitulo: {
    color: '#1E293B',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  },
  opcaoModal: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  opcaoModalSelecionada: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  textoOpcaoModal: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoOpcaoModalSelecionada: {
    color: '#4F46E5',
  },
  botaoFecharModal: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  textoFecharModal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
