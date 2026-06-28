import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { analisarImagemUseCase } from '@/src/application/analise/analisarImagemUseCase';
import { atualizarAnalisePecaUseCase } from '@/src/application/pecas/atualizarAnalisePecaUseCase';
import { excluirPecaUseCase } from '@/src/application/pecas/excluirPecaUseCase';
import { listarPecasUseCase } from '@/src/application/pecas/listarPecasUseCase';
import { useSessao } from '@/src/contexts/SessaoContext';
import { extrairNomeCorPrincipal } from '@/src/domain/analise/AnaliseImagem';
import { Peca } from '@/src/domain/pecas/Peca';

export default function MinhasPecasScreen() {
  const { usuarioLogado } = useSessao();
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [pecaAnalisandoId, setPecaAnalisandoId] = useState<number | null>(null);

  const carregarPecas = useCallback(() => {
    if (!usuarioLogado) {
      setPecas([]);
      return;
    }

    const resultado = listarPecasUseCase(usuarioLogado.id);
    setPecas(resultado);
  }, [usuarioLogado]);

  useFocusEffect(carregarPecas);

  function handleExcluir(id: number) {
    Alert.alert(
      'Excluir peça',
      'Tem certeza que deseja excluir esta peça?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            if (!usuarioLogado) return;

            excluirPecaUseCase(id, usuarioLogado.id);
            carregarPecas();
          },
        },
      ]
    );
  }

  async function handleAnalisarIA(peca: Peca) {
    if (!usuarioLogado) {
      Alert.alert('Erro', 'Fa\u00e7a login novamente para analisar a pe\u00e7a.');
      router.replace('/login');
      return;
    }

    if (!peca.imagem_uri) {
      Alert.alert('Aten\u00e7\u00e3o', 'Esta pe\u00e7a n\u00e3o possui imagem para analisar.');
      return;
    }

    try {
      setPecaAnalisandoId(peca.id);

      const resultado = await analisarImagemUseCase(peca.imagem_uri);
      const corTexto = extrairNomeCorPrincipal(resultado);

      atualizarAnalisePecaUseCase({
        id: peca.id,
        usuarioId: usuarioLogado.id,
        corDetectada: corTexto,
        paleta: JSON.stringify(resultado.cores),
        imagemResultado: resultado.imagem_resultado || null,
      });

      carregarPecas();
      Alert.alert('An\u00e1lise conclu\u00edda', `Cor principal: ${corTexto}`);
    } catch (error: any) {
      Alert.alert(
        'Erro IA',
        error.message || 'N\u00e3o foi poss\u00edvel analisar a imagem com IA.'
      );
    } finally {
      setPecaAnalisandoId(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minhas peças</Text>

      <Text style={styles.subtitulo}>
        Veja as peças cadastradas no ColorAssist.
      </Text>

      <FlatList
        data={pecas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.cardVazio}>
            <Text style={styles.textoVazio}>Nenhuma peça cadastrada ainda.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imagem_uri && (
              <Image
                source={{ uri: item.imagem_uri }}
                style={styles.imagem}
                resizeMode="cover"
              />
            )}

            <View style={styles.info}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.tipo}>{item.tipo}</Text>
              <Text style={styles.data}>Cadastrada em: {item.data_cadastro}</Text>

              {item.cor_detectada ? (
                <Text style={styles.cor}>Cor detectada: {item.cor_detectada}</Text>
              ) : (
                <Text style={styles.corPendente}>Cor ainda não analisada</Text>
              )}

              <View style={styles.acoes}>
                {!item.cor_detectada && (
                  <TouchableOpacity
                    style={styles.botaoIA}
                    onPress={() => handleAnalisarIA(item)}
                    disabled={pecaAnalisandoId === item.id}
                  >
                    <Text style={styles.textoIA}>
                      {pecaAnalisandoId === item.id ? 'Analisando...' : 'Analisar IA'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.botaoEditar}
                  onPress={() => router.push(`/editar-peca?id=${item.id}`)}
                >
                  <Text style={styles.textoEditar}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoExcluir}
                  onPress={() => handleExcluir(item.id)}
                >
                  <Text style={styles.textoExcluir}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
        <Text style={styles.textoBotaoVoltar}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    padding: 24,
    paddingTop: 60,
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
    marginBottom: 20,
  },
  lista: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imagem: {
    width: 92,
    height: 92,
    borderRadius: 16,
    marginRight: 14,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  tipo: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  data: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  cor: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  corPendente: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  acoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  botaoIA: {
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  textoIA: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  botaoEditar: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  textoEditar: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 13,
  },
  botaoExcluir: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  textoExcluir: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cardVazio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },
  textoVazio: {
    color: '#64748B',
    fontSize: 15,
  },
  botaoVoltar: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  textoBotaoVoltar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
