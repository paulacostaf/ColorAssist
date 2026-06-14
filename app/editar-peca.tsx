import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { buscarPecaPorId, editarPeca } from '@/src/database/database';
import ScreenScroll from '@/src/components/ScreenScroll';

type Peca = {
  id: number;
  nome: string;
  tipo: string;
  imagem_uri: string | null;
};

export default function EditarPecaScreen() {
  const { id } = useLocalSearchParams();

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [imagemUri, setImagemUri] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const peca = buscarPecaPorId(Number(id)) as Peca | null;

    if (peca) {
      setNome(peca.nome);
      setTipo(peca.tipo);
      setImagemUri(peca.imagem_uri);
    }
  }, [id]);

  function handleSalvar() {
    if (!nome || !tipo) {
      Alert.alert('Atenção', 'Preencha o nome e o tipo da peça.');
      return;
    }

    try {
      editarPeca(Number(id), nome, tipo);

      Alert.alert('Sucesso', 'Peça editada com sucesso!');

      router.push('/minhas-pecas');
    } catch {
      Alert.alert('Erro', 'Não foi possível editar a peça.');
    }
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

        <TextInput
          style={styles.input}
          placeholder="Nome da peça"
          placeholderTextColor="#94A3B8"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Tipo da peça"
          placeholderTextColor="#94A3B8"
          value={tipo}
          onChangeText={setTipo}
        />

        <TouchableOpacity style={styles.botaoPrincipal} onPress={handleSalvar}>
          <Text style={styles.textoBotaoPrincipal}>Salvar alterações</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.voltar}>Voltar</Text>
        </TouchableOpacity>
      </View>
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
    marginTop: 18,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
});
