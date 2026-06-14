import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ScreenScroll from '@/src/components/ScreenScroll';
import { listarPecas } from '@/src/database/database';
import { analisarImagem } from '@/src/services/api';

type CorPrincipal = {
  nome?: string;
  tom?: string;
  hex?: string;
  rgb?: string;
};

type ResultadoAnalise = {
  cor_principal?: string | CorPrincipal;
};

type RGB = {
  r: number;
  g: number;
  b: number;
};

type PecaComparada = {
  imagemUri: string | null;
  resultado: ResultadoAnalise | null;
  nomePeca?: string | null;
  tipoPeca?: string | null;
  corDetectadaSalva?: string | null;
};

type PecaCadastrada = {
  id: number;
  nome: string;
  tipo: string | null;
  imagem_uri: string | null;
  cor_detectada: string | null;
  paleta: string | null;
  imagem_resultado: string | null;
  data_cadastro: string | null;
};

type ResultadoComparacao = {
  contraste: 'baixo' | 'médio' | 'bom';
  risco: 'baixo' | 'médio' | 'alto';
  combinacaoVisual:
    | 'Recomendada'
    | 'Recomendada com atenção'
    | 'Pouco usual'
    | 'Não recomendada para acessibilidade';
  mensagem: string;
};

function obterCorPrincipal(resultado: ResultadoAnalise | null): CorPrincipal {
  if (!resultado?.cor_principal) {
    return {};
  }

  if (typeof resultado.cor_principal === 'string') {
    return { nome: resultado.cor_principal };
  }

  return resultado.cor_principal;
}

function primeiraCorDaPaleta(paleta: string | null): CorPrincipal {
  if (!paleta) {
    return {};
  }

  try {
    const cores = JSON.parse(paleta);

    if (Array.isArray(cores) && cores[0]) {
      return cores[0];
    }
  } catch {
    return {};
  }

  return {};
}

function resultadoDaPecaCadastrada(peca: PecaCadastrada): ResultadoAnalise | null {
  const corPaleta = primeiraCorDaPaleta(peca.paleta);
  const corPrincipal: CorPrincipal = {
    ...corPaleta,
    nome: peca.cor_detectada || corPaleta.nome,
  };

  if (!corPrincipal.nome && !corPrincipal.hex) {
    return null;
  }

  return {
    cor_principal: corPrincipal,
  };
}

function combinarResultadoComCorSalva(
  resultado: ResultadoAnalise,
  corDetectadaSalva?: string | null,
): ResultadoAnalise {
  if (!corDetectadaSalva) {
    return resultado;
  }

  const corPrincipal = obterCorPrincipal(resultado);

  return {
    ...resultado,
    cor_principal: {
      ...corPrincipal,
      nome: corDetectadaSalva,
    },
  };
}

function hexParaRgb(hex?: string): RGB | null {
  if (!hex) {
    return null;
  }

  const valor = hex.replace('#', '').trim();

  if (!/^[0-9a-fA-F]{6}$/.test(valor)) {
    return null;
  }

  return {
    r: parseInt(valor.slice(0, 2), 16),
    g: parseInt(valor.slice(2, 4), 16),
    b: parseInt(valor.slice(4, 6), 16),
  };
}

function componenteLinear(valor: number) {
  const normalizado = valor / 255;
  return normalizado <= 0.03928
    ? normalizado / 12.92
    : Math.pow((normalizado + 0.055) / 1.055, 2.4);
}

function luminanciaRelativa(cor: RGB) {
  return (
    0.2126 * componenteLinear(cor.r) +
    0.7152 * componenteLinear(cor.g) +
    0.0722 * componenteLinear(cor.b)
  );
}

function taxaContraste(cor1: RGB, cor2: RGB) {
  const l1 = luminanciaRelativa(cor1);
  const l2 = luminanciaRelativa(cor2);
  const maior = Math.max(l1, l2);
  const menor = Math.min(l1, l2);

  return (maior + 0.05) / (menor + 0.05);
}

function distanciaRgb(cor1: RGB, cor2: RGB) {
  return Math.sqrt(
    Math.pow(cor1.r - cor2.r, 2) +
      Math.pow(cor1.g - cor2.g, 2) +
      Math.pow(cor1.b - cor2.b, 2),
  );
}

function diferencaBrilho(cor1: RGB, cor2: RGB) {
  const brilho1 = (cor1.r + cor1.g + cor1.b) / 3;
  const brilho2 = (cor2.r + cor2.g + cor2.b) / 3;

  return Math.abs(brilho1 - brilho2);
}

function diferencaParaDaltonismo(cor1: RGB, cor2: RGB) {
  const diferencaVermelhoVerde = Math.abs(
    cor1.r - cor1.g - (cor2.r - cor2.g),
  );
  const diferencaAzulAmarelo = Math.abs(
    cor1.b - (cor1.r + cor1.g) / 2 - (cor2.b - (cor2.r + cor2.g) / 2),
  );

  return diferencaVermelhoVerde * 0.45 + diferencaAzulAmarelo * 0.35;
}

function familiaDaCor(nome?: string) {
  const cor = nome?.toLowerCase() || '';

  if (cor.includes('rosa') || cor.includes('salm')) {
    return 'rosa';
  }

  if (cor.includes('vermelho') || cor.includes('vinho') || cor.includes('coral')) {
    return 'vermelho';
  }

  if (cor.includes('roxo') || cor.includes('lil') || cor.includes('magenta')) {
    return 'roxo';
  }

  if (cor.includes('verde')) {
    return 'verde';
  }

  if (cor.includes('azul')) {
    return 'azul';
  }

  if (cor.includes('amarelo') || cor.includes('laranja')) {
    return 'amarelo';
  }

  if (
    cor.includes('preto') ||
    cor.includes('branco') ||
    cor.includes('cinza') ||
    cor.includes('bege') ||
    cor.includes('marrom')
  ) {
    return 'neutro';
  }

  return 'indefinida';
}

function combinacaoPoucoUsual(nome1?: string, nome2?: string) {
  const familias = [familiaDaCor(nome1), familiaDaCor(nome2)].sort().join('-');

  return [
    'amarelo-roxo',
    'azul-vermelho',
    'rosa-verde',
    'roxo-verde',
    'amarelo-rosa',
  ].includes(familias);
}

function compararCores(
  hex1?: string,
  hex2?: string,
  nome1?: string,
  nome2?: string,
): ResultadoComparacao | null {
  const cor1 = hexParaRgb(hex1);
  const cor2 = hexParaRgb(hex2);

  if (!cor1 || !cor2) {
    return null;
  }

  const contrasteNumerico = taxaContraste(cor1, cor2);
  const distancia = distanciaRgb(cor1, cor2);
  const brilho = diferencaBrilho(cor1, cor2);
  const distanciaDaltonismo = diferencaParaDaltonismo(cor1, cor2);

  let contraste: ResultadoComparacao['contraste'] = 'baixo';
  if (contrasteNumerico >= 3 || (distancia >= 145 && brilho >= 45)) {
    contraste = 'bom';
  } else if (contrasteNumerico >= 1.8 || distancia >= 90 || brilho >= 35) {
    contraste = 'médio';
  }

  let risco: ResultadoComparacao['risco'] = 'alto';
  if (contraste === 'bom' && distanciaDaltonismo >= 45 && brilho >= 35) {
    risco = 'baixo';
  } else if (contraste !== 'baixo' && (distanciaDaltonismo >= 28 || brilho >= 45)) {
    risco = 'médio';
  }

  let mensagem =
    risco === 'baixo'
      ? 'As peças possuem bom contraste visual e tendem a ser fáceis de diferenciar.'
      : risco === 'médio'
        ? 'As peças têm alguma diferença visual, mas ainda podem causar dúvida dependendo da iluminação.'
        : 'Atenção: as cores são próximas e podem causar confusão visual.';

  let combinacaoVisual: ResultadoComparacao['combinacaoVisual'] =
    'Não recomendada para acessibilidade';

  mensagem =
    'As cores são próximas ou têm baixo contraste, podendo dificultar a diferenciação. Para facilitar a percepção, prefira uma peça mais clara, mais escura ou neutra.';

  if (contraste === 'bom' && risco === 'baixo') {
    combinacaoVisual = combinacaoPoucoUsual(nome1, nome2)
      ? 'Pouco usual'
      : 'Recomendada';
    mensagem =
      combinacaoVisual === 'Pouco usual'
        ? 'Essas cores não formam uma combinação visual tão comum. Para maior harmonia, considere combinar uma das peças com tons neutros, como branco, preto, cinza, bege ou jeans.'
        : 'As peças apresentam bom contraste visual e tendem a ser fáceis de diferenciar.';
  } else if (contraste !== 'baixo' && risco !== 'alto') {
    combinacaoVisual = 'Recomendada com atenção';
    mensagem =
      'As peças têm diferença visual moderada. A percepção pode variar conforme a iluminação.';
  }

  return {
    contraste,
    risco,
    combinacaoVisual,
    mensagem,
  };
}

export default function CompararRoupasScreen() {
  const [peca1, setPeca1] = useState<PecaComparada>({
    imagemUri: null,
    resultado: null,
  });
  const [peca2, setPeca2] = useState<PecaComparada>({
    imagemUri: null,
    resultado: null,
  });
  const [analisando, setAnalisando] = useState(false);
  const [comparacao, setComparacao] = useState<ResultadoComparacao | null>(null);
  const [pecasCadastradas, setPecasCadastradas] = useState<PecaCadastrada[]>([]);
  const [seletorAberto, setSeletorAberto] = useState<1 | 2 | null>(null);

  function abrirListaPecas(numeroPeca: 1 | 2) {
    const pecas = listarPecas() as PecaCadastrada[];

    if (!pecas.length) {
      Alert.alert('Atenção', 'Nenhuma peça cadastrada foi encontrada.');
      return;
    }

    setPecasCadastradas(pecas);
    setSeletorAberto(numeroPeca);
  }

  function selecionarPecaCadastrada(numeroPeca: 1 | 2, peca: PecaCadastrada) {
    if (!peca.imagem_uri) {
      Alert.alert('Atenção', 'Esta peça cadastrada não possui imagem salva.');
      return;
    }

    const novaPeca = {
      imagemUri: peca.imagem_uri,
      resultado: resultadoDaPecaCadastrada(peca),
      nomePeca: peca.nome,
      tipoPeca: peca.tipo,
      corDetectadaSalva: peca.cor_detectada,
    };

    if (numeroPeca === 1) {
      setPeca1(novaPeca);
    } else {
      setPeca2(novaPeca);
    }

    setComparacao(null);
    setSeletorAberto(null);
  }

  async function escolherImagem(numeroPeca: 1 | 2) {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        'Permissão necessária',
        'Permita o acesso à galeria para escolher uma imagem.',
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (resultado.canceled) {
      return;
    }

    const novaPeca = {
      imagemUri: resultado.assets[0].uri,
      resultado: null,
      nomePeca: null,
      tipoPeca: null,
      corDetectadaSalva: null,
    };

    if (numeroPeca === 1) {
      setPeca1(novaPeca);
    } else {
      setPeca2(novaPeca);
    }

    setComparacao(null);
    setSeletorAberto(null);
  }

  async function handleComparar() {
    if (!peca1.imagemUri || !peca2.imagemUri) {
      Alert.alert('Atenção', 'Selecione as duas peças antes de comparar.');
      return;
    }

    try {
      setAnalisando(true);

      const resultadoSalvo1 = obterCorPrincipal(peca1.resultado);
      const resultadoSalvo2 = obterCorPrincipal(peca2.resultado);

      const [resultadoObtido1, resultadoObtido2] = await Promise.all([
        peca1.corDetectadaSalva && resultadoSalvo1.hex
          ? peca1.resultado
          : analisarImagem(peca1.imagemUri),
        peca2.corDetectadaSalva && resultadoSalvo2.hex
          ? peca2.resultado
          : analisarImagem(peca2.imagemUri),
      ]);

      const resultado1 = combinarResultadoComCorSalva(
        resultadoObtido1 as ResultadoAnalise,
        peca1.corDetectadaSalva,
      );
      const resultado2 = combinarResultadoComCorSalva(
        resultadoObtido2 as ResultadoAnalise,
        peca2.corDetectadaSalva,
      );
      const cor1 = obterCorPrincipal(resultado1);
      const cor2 = obterCorPrincipal(resultado2);

      setPeca1((pecaAtual) => ({ ...pecaAtual, resultado: resultado1 }));
      setPeca2((pecaAtual) => ({ ...pecaAtual, resultado: resultado2 }));
      setComparacao(compararCores(cor1.hex, cor2.hex, cor1.nome, cor2.nome));
    } catch (error: any) {
      Alert.alert(
        'Erro IA',
        error.message || 'Não foi possível comparar as peças.',
      );
    } finally {
      setAnalisando(false);
    }
  }

  const corPeca1 = obterCorPrincipal(peca1.resultado);
  const corPeca2 = obterCorPrincipal(peca2.resultado);

  return (
    <ScreenScroll>
      <View style={styles.card}>
        <Text style={styles.titulo}>Comparar roupas</Text>

        <Text style={styles.subtitulo}>
          Selecione duas peças para verificar contraste e risco de confusão visual.
        </Text>

        <View style={styles.pecasContainer}>
          <View style={styles.pecaBox}>
            <Text style={styles.pecaTitulo}>Peça 1</Text>

            <TouchableOpacity
              style={styles.botaoImagem}
              onPress={() => escolherImagem(1)}
            >
              <Text style={styles.textoBotaoImagem}>
                {peca1.imagemUri ? 'Trocar imagem' : 'Selecionar imagem'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoPecaCadastrada}
              onPress={() => abrirListaPecas(1)}
            >
              <Text style={styles.textoBotaoImagem}>Usar peça cadastrada</Text>
            </TouchableOpacity>

            {peca1.nomePeca && (
              <View style={styles.dadosPecaSelecionada}>
                <Text style={styles.pecaSelecionada}>Peça cadastrada: {peca1.nomePeca}</Text>
                <Text style={styles.detalhePecaSelecionada}>
                  Tipo: {peca1.tipoPeca || 'Não informado'}
                </Text>
                <Text style={styles.detalhePecaSelecionada}>
                  Cor: {peca1.corDetectadaSalva || 'Ainda não analisada'}
                </Text>
              </View>
            )}

            {seletorAberto === 1 && (
              <ListaPecasCadastradas
                pecas={pecasCadastradas}
                onSelecionar={(peca) => selecionarPecaCadastrada(1, peca)}
              />
            )}

            {peca1.imagemUri && (
              <Image
                source={{ uri: peca1.imagemUri }}
                style={styles.preview}
                resizeMode="cover"
              />
            )}
          </View>

          <View style={styles.pecaBox}>
            <Text style={styles.pecaTitulo}>Peça 2</Text>

            <TouchableOpacity
              style={styles.botaoImagem}
              onPress={() => escolherImagem(2)}
            >
              <Text style={styles.textoBotaoImagem}>
                {peca2.imagemUri ? 'Trocar imagem' : 'Selecionar imagem'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoPecaCadastrada}
              onPress={() => abrirListaPecas(2)}
            >
              <Text style={styles.textoBotaoImagem}>Usar peça cadastrada</Text>
            </TouchableOpacity>

            {peca2.nomePeca && (
              <View style={styles.dadosPecaSelecionada}>
                <Text style={styles.pecaSelecionada}>Peça cadastrada: {peca2.nomePeca}</Text>
                <Text style={styles.detalhePecaSelecionada}>
                  Tipo: {peca2.tipoPeca || 'Não informado'}
                </Text>
                <Text style={styles.detalhePecaSelecionada}>
                  Cor: {peca2.corDetectadaSalva || 'Ainda não analisada'}
                </Text>
              </View>
            )}

            {seletorAberto === 2 && (
              <ListaPecasCadastradas
                pecas={pecasCadastradas}
                onSelecionar={(peca) => selecionarPecaCadastrada(2, peca)}
              />
            )}

            {peca2.imagemUri && (
              <Image
                source={{ uri: peca2.imagemUri }}
                style={styles.preview}
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.botaoPrincipal}
          onPress={handleComparar}
          disabled={analisando}
        >
          <Text style={styles.textoBotaoPrincipal}>
            {analisando ? 'Comparando...' : 'Comparar peças'}
          </Text>
        </TouchableOpacity>

        {(peca1.resultado || peca2.resultado) && (
          <View style={styles.resultados}>
            <ResultadoPeca titulo="Resultado peça 1" cor={corPeca1} />
            <ResultadoPeca titulo="Resultado peça 2" cor={corPeca2} />
          </View>
        )}

        {comparacao && (
          <View style={styles.comparacaoBox}>
            <Text style={styles.resultadoTitulo}>Avaliação de acessibilidade</Text>
            <Text style={styles.resultadoTexto}>
              Contraste: {comparacao.contraste}
            </Text>
            <Text style={styles.resultadoTexto}>
              Risco de confusão: {comparacao.risco}
            </Text>
            <Text style={styles.conclusaoTitulo}>
              Combinação visual: {comparacao.combinacaoVisual}
            </Text>
            <Text style={styles.mensagem}>{comparacao.mensagem}</Text>
          </View>
        )}

        {peca1.resultado && peca2.resultado && !comparacao && (
          <View style={styles.alertaBox}>
            <Text style={styles.alertaTexto}>
              Não foi possível calcular a comparação porque uma das cores não retornou HEX.
            </Text>
          </View>
        )}

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.voltar}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ScreenScroll>
  );
}

function ResultadoPeca({ titulo, cor }: { titulo: string; cor: CorPrincipal }) {
  return (
    <View style={styles.resultadoBox}>
      <Text style={styles.resultadoTitulo}>{titulo}</Text>
      <Text style={styles.resultadoTexto}>Cor: {cor.nome || 'Não identificada'}</Text>
      {cor.tom && <Text style={styles.resultadoTexto}>Tom: {cor.tom}</Text>}
      {cor.hex && (
        <View style={styles.hexLinha}>
          <View style={[styles.amostraCor, { backgroundColor: cor.hex }]} />
          <Text style={styles.resultadoTexto}>HEX: {cor.hex}</Text>
        </View>
      )}
    </View>
  );
}

function ListaPecasCadastradas({
  pecas,
  onSelecionar,
}: {
  pecas: PecaCadastrada[];
  onSelecionar: (peca: PecaCadastrada) => void;
}) {
  return (
    <View style={styles.listaPecas}>
      {pecas.map((peca) => (
        <TouchableOpacity
          key={peca.id}
          style={styles.itemPeca}
          onPress={() => onSelecionar(peca)}
        >
          {peca.imagem_uri && (
            <Image
              source={{ uri: peca.imagem_uri }}
              style={styles.itemPecaImagem}
              resizeMode="cover"
            />
          )}

          <View style={styles.itemPecaInfo}>
            <Text style={styles.itemPecaNome}>{peca.nome}</Text>
            <Text style={styles.itemPecaDetalhe}>
              Tipo: {peca.tipo || 'Não informado'}
            </Text>
            <Text style={styles.itemPecaCor}>
              {peca.cor_detectada
                ? `Cor: ${peca.cor_detectada}`
                : 'Cor ainda não analisada'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
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
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  pecasContainer: {
    gap: 14,
  },
  pecaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
  },
  pecaTitulo: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  botaoImagem: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#4F46E5',
    width: '100%',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoPecaCadastrada: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    width: '100%',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  textoBotaoImagem: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pecaSelecionada: {
    color: '#475569',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  dadosPecaSelecionada: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  detalhePecaSelecionada: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },
  listaPecas: {
    gap: 8,
    marginBottom: 10,
  },
  itemPeca: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPecaImagem: {
    width: 58,
    height: 58,
    borderRadius: 12,
    marginRight: 10,
  },
  itemPecaInfo: {
    flex: 1,
  },
  itemPecaNome: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  itemPecaDetalhe: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },
  itemPecaCor: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  preview: {
    width: '100%',
    height: 150,
    borderRadius: 16,
  },
  botaoPrincipal: {
    backgroundColor: '#4F46E5',
    width: '100%',
    padding: 15,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultados: {
    gap: 10,
    marginTop: 14,
  },
  resultadoBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 12,
  },
  resultadoTitulo: {
    color: '#065F46',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultadoTexto: {
    color: '#047857',
    fontSize: 14,
    lineHeight: 20,
  },
  hexLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amostraCor: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  comparacaoBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
  },
  mensagem: {
    color: '#1E293B',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  conclusaoTitulo: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
  },
  alertaBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
  },
  alertaTexto: {
    color: '#92400E',
    fontSize: 14,
    lineHeight: 20,
  },
  voltar: {
    textAlign: 'center',
    marginTop: 16,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
});
