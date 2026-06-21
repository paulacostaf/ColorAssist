import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
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

import { useSessao } from '@/src/contexts/SessaoContext';
import { buscarPecaPorId, editarPeca } from '@/src/database/database';
import ScreenScroll from '@/src/components/ScreenScroll';

const TIPOS_PECA = [
  'Camiseta',
  'Blusa',
  'Camisa',
  'Cal\u00e7a',
  'Shorts',
  'Saia',
  'Vestido',
  'Casaco',
  'Jaqueta',
  'Moletom',
  'T\u00eanis/Sapato',
  'Acess\u00f3rio',
  'Outro',
];

type Peca = {
  id: number;
  nome: string;
  tipo: string;
  imagem_uri: string | null;
};

export default function EditarPecaScreen() {
  const { id } = useLocalSearchParams();
  const { usuarioLogado } = useSessao();

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [modalTipoVisivel, setModalTipoVisivel] = useState(false);

  useEffect(() => {
    if (!id || !usuarioLogado) return;

    const peca = buscarPecaPorId(Number(id), usuarioLogado.id) as Peca | null;

    if (peca) {
      setNome(peca.nome);
      setTipo(TIPOS_PECA.includes(peca.tipo) ? peca.tipo : 'Outro');
      setImagemUri(peca.imagem_uri);
    }
  }, [id, usuarioLogado]);

  function handleSalvar() {
    if (!usuarioLogado) {
      Alert.alert('Erro', 'Faça login novamente para editar a peça.');
      router.replace('/login');
      return;
    }

    if (!nome || !tipo) {
      Alert.alert('Atenção', 'Preencha o nome e o tipo da peça.');
      return;
    }

    try {
      editarPeca(Number(id), usuarioLogado.id, nome, tipo);

      Alert.alert('Sucesso', 'Peça editada com sucesso!');

      router.push('/minhas-pecas');
    } catch {
      Alert.alert('Erro', 'Não foi possível editar a peça.');
    }
  }

  function selecionarTipo(tipoSelecionado: string) {
    setTipo(tipoSelecionado);
    setModalTipoVisivel(false);
  }

  return (
    <ScreenScroll>
      <View style={styles.card}>
        {imagemUri && (
          <Image
            source={{ uri: imagemUri }}
            style={styles.preview}
            resizeMode="cover"
          />
        )}

        <Text style={styles.titulo}>Editar peça</Text>

        <Text style={styles.subtitulo}>
          Altere os dados da peça cadastrada.
        </Text>

        <Text style={styles.labelCampo}>{"Nome da pe\u00e7a"}</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite o nome"
          placeholderTextColor="#94A3B8"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.labelTipo}>{"Tipo da pe\u00e7a"}</Text>

        <TouchableOpacity
          style={styles.seletorTipo}
          onPress={() => setModalTipoVisivel(true)}
        >
          <Text style={[styles.textoSeletorTipo, !tipo && styles.placeholderTipo]}>
            {tipo || 'Selecione o tipo'}
          </Text>
          <Text style={styles.iconeSeletor}>v</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoPrincipal} onPress={handleSalvar}>
          <Text style={styles.textoBotaoPrincipal}>Salvar alterações</Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
        <Text style={styles.textoBotaoVoltar}>Voltar</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={modalTipoVisivel}
        onRequestClose={() => setModalTipoVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>{"Tipo da pe\u00e7a"}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {TIPOS_PECA.map((tipoOpcao) => {
                const selecionado = tipo === tipoOpcao;

                return (
                  <TouchableOpacity
                    key={tipoOpcao}
                    style={[
                      styles.opcaoModal,
                      selecionado && styles.opcaoModalSelecionada,
                    ]}
                    onPress={() => selecionarTipo(tipoOpcao)}
                  >
                    <Text
                      style={[
                        styles.textoOpcaoModal,
                        selecionado && styles.textoOpcaoModalSelecionada,
                      ]}
                    >
                      {tipoOpcao}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.botaoFecharModal}
              onPress={() => setModalTipoVisivel(false)}
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
  preview: {
    width: '100%',
    height: 170,
    borderRadius: 18,
    marginBottom: 18,
  },
  titulo: {
    fontSize: 28,
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
    marginBottom: 20,
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
  labelTipo: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  seletorTipo: {
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
  textoSeletorTipo: {
    color: '#1E293B',
    fontSize: 16,
  },
  placeholderTipo: {
    color: '#94A3B8',
  },
  iconeSeletor: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: 'bold',
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
  botaoVoltar: {
    backgroundColor: '#4F46E5',
    width: '88%',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 96,
  },
  textoBotaoVoltar: {
    color: '#FFFFFF',
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
