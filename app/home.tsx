import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ScreenScroll from '@/src/components/ScreenScroll';
import { useSessao } from '@/src/contexts/SessaoContext';
import { atualizarTipoDaltonismoUsuario } from '@/src/database/database';

const TIPOS_DALTONISMO = [
  'Não sei informar',
  'Protanopia / Protanomalia',
  'Deuteranopia / Deuteranomalia',
  'Tritanopia / Tritanomalia',
  'Outro',
];

function perfilVisual(tipoDaltonismo?: string | null) {
  const tipo = tipoDaltonismo?.trim();

  if (!tipo || tipo === 'Não sei informar' || tipo === 'Outro') {
    return 'análise geral';
  }

  return tipo;
}

export default function HomeAppScreen() {
  const { sair, usuarioLogado, atualizarUsuarioLogado } = useSessao();
  const [modalPerfilVisivel, setModalPerfilVisivel] = useState(false);

  function handleSair() {
    sair();
    router.replace('/');
  }

  function selecionarPerfilVisual(tipoDaltonismo: string) {
    if (usuarioLogado) {
      atualizarTipoDaltonismoUsuario(usuarioLogado.id, tipoDaltonismo);
      atualizarUsuarioLogado({ tipo_daltonismo: tipoDaltonismo });
    }

    setModalPerfilVisivel(false);
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

        <TouchableOpacity
          style={styles.perfilBox}
          onPress={() => setModalPerfilVisivel(true)}
        >
          <Text style={styles.perfilTexto}>
            Perfil visual: {perfilVisual(usuarioLogado?.tipo_daltonismo)}
          </Text>
        </TouchableOpacity>
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

      <Modal
        animationType="fade"
        transparent
        visible={modalPerfilVisivel}
        onRequestClose={() => setModalPerfilVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Perfil visual</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {TIPOS_DALTONISMO.map((tipo) => {
                const selecionado =
                  (usuarioLogado?.tipo_daltonismo || 'Não sei informar') === tipo;

                return (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.opcaoModal,
                      selecionado && styles.opcaoModalSelecionada,
                    ]}
                    onPress={() => selecionarPerfilVisual(tipo)}
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
              onPress={() => setModalPerfilVisivel(false)}
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
  perfilBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  perfilTexto: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
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
