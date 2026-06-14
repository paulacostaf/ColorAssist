import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ScreenScroll from '@/src/components/ScreenScroll';

const digitos: Record<string, string[]> = {
  '1': ['010', '110', '010', '010', '010', '010', '111'],
  '2': ['111', '001', '001', '111', '100', '100', '111'],
  '6': ['111', '100', '100', '111', '101', '101', '111'],
  '8': ['111', '101', '101', '111', '101', '101', '111'],
};

type TipoEtapa = 'vermelho-verde' | 'azul-amarelo' | 'tons próximos';

type Etapa = {
  numero: string;
  tipo: TipoEtapa;
  opcoes: string[];
  fundo: string[];
  destaque: string[];
};

type RespostaEtapa = {
  correta: boolean;
  tipo: TipoEtapa;
};

const etapas: Etapa[] = [
  {
    numero: '12',
    tipo: 'vermelho-verde',
    opcoes: ['12', '17', '21'],
    fundo: ['#A7C957', '#B8D66D', '#91B845'],
    destaque: ['#D96C4D', '#E27D60', '#C95B42'],
  },
  {
    numero: '8',
    tipo: 'azul-amarelo',
    opcoes: ['3', '8', '9'],
    fundo: ['#D9B44A', '#E2C05D', '#CDA23D'],
    destaque: ['#527FB3', '#6592C2', '#416E9F'],
  },
  {
    numero: '6',
    tipo: 'tons próximos',
    opcoes: ['5', '6', '9'],
    fundo: ['#8FB6D9', '#A2C4E2', '#79A5CC'],
    destaque: ['#B46A8A', '#C47B99', '#A55A7A'],
  },
];

const circulosFundo = Array.from({ length: 55 }, (_, indice) => ({
  left: 8 + ((indice * 37) % 218),
  top: 7 + ((indice * 53) % 166),
  size: 9 + ((indice * 7) % 8),
}));

type Ponto = {
  left: number;
  top: number;
  size: number;
};

function criarPontosNumero(numero: string): Ponto[] {
  const tamanho = 13;
  const espacamento = 4;
  const larguraDigito = 3 * (tamanho + espacamento);
  const larguraTotal = numero.length * larguraDigito + (numero.length - 1) * 12;
  const inicioX = (242 - larguraTotal) / 2;
  const inicioY = 23;

  return Array.from(numero).flatMap((digito, indiceDigito) =>
    digitos[digito].flatMap((linha, indiceLinha) =>
      linha.split('').flatMap((ponto, indiceColuna) => {
        if (ponto === '0') {
          return [];
        }

        return [{
          left:
            inicioX +
            indiceDigito * (larguraDigito + 12) +
            indiceColuna * (tamanho + espacamento),
          top: inicioY + indiceLinha * (tamanho + espacamento),
          size: tamanho,
        }];
      }),
    ),
  );
}

function obterResultado(acertos: number) {
  if (acertos === 3) {
    return 'Boa percepção nas combinações apresentadas.';
  }

  if (acertos >= 1) {
    return 'Possível dificuldade em algumas combinações.';
  }

  return 'Dificuldade frequente nas combinações apresentadas.';
}

function obterIndicacoes(tiposComErro: TipoEtapa[]) {
  if (!tiposComErro.length) {
    return ['Não houve indicação relevante nas combinações apresentadas.'];
  }

  const textos: Record<TipoEtapa, string> = {
    'vermelho-verde':
      'Tons vermelho-verde: padrão associado a protanopia ou deuteranopia.',
    'azul-amarelo':
      'Tons azul-amarelo: padrão associado a tritanopia.',
    'tons próximos':
      'Tons próximos: dificuldade na diferenciação de cores semelhantes.',
  };

  return tiposComErro.map((tipo) => textos[tipo]);
}

export default function TesteDaltonismoScreen() {
  const [respostas, setRespostas] = useState<RespostaEtapa[]>([]);

  const etapaAtual = respostas.length;
  const testeConcluido = respostas.length === etapas.length;
  const etapa = etapas[etapaAtual];
  const acertos = respostas.filter((resposta) => resposta.correta).length;
  const tiposComErro = respostas
    .filter((resposta) => !resposta.correta)
    .map((resposta) => resposta.tipo);

  function responder(resposta: string) {
    setRespostas((respostasAtuais) => [
      ...respostasAtuais,
      {
        correta: resposta === etapa.numero,
        tipo: etapa.tipo,
      },
    ]);
  }

  function refazerTeste() {
    setRespostas([]);
  }

  return (
    <ScreenScroll>
      <View style={styles.card}>
        <Text style={styles.titulo}>Teste de daltonismo</Text>

        <View style={styles.aviso}>
          <Text style={styles.avisoTexto}>
            Este teste é apenas educativo e não substitui avaliação médica ou
            oftalmológica.
          </Text>
        </View>

        {!testeConcluido ? (
          <>
            <Text style={styles.etapaTexto}>
              Etapa {etapaAtual + 1} de {etapas.length}
            </Text>

            <Text style={styles.instrucao}>
              Observe a placa colorida e escolha a opção correspondente.
            </Text>

            <PlacaVisual
              numero={etapa.numero}
              coresFundo={etapa.fundo}
              coresDestaque={etapa.destaque}
            />

            <Text style={styles.pergunta}>Qual número você enxerga?</Text>

            <View style={styles.opcoes}>
              {etapa.opcoes.map((opcao) => (
                <TouchableOpacity
                  key={opcao}
                  style={styles.botaoResposta}
                  onPress={() => responder(opcao)}
                >
                  <Text style={styles.textoResposta}>{opcao}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.resultadoCard}>
            <Text style={styles.resultadoTitulo}>Resultado</Text>
            <Text style={styles.resultadoContagem}>
              Você acertou {acertos} de {etapas.length} etapas.
            </Text>
            <Text style={styles.resultadoTexto}>{obterResultado(acertos)}</Text>

            <View style={styles.indicacaoBox}>
              <Text style={styles.indicacaoTitulo}>Possível indicação:</Text>
              {obterIndicacoes(tiposComErro).map((indicacao) => (
                <Text key={indicacao} style={styles.indicacaoTexto}>
                  {indicacao}
                </Text>
              ))}
            </View>

            <TouchableOpacity style={styles.botaoPrincipal} onPress={refazerTeste}>
              <Text style={styles.textoBotaoPrincipal}>Refazer teste</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
          <Text style={styles.textoBotaoVoltar}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ScreenScroll>
  );
}

function PlacaVisual({
  numero,
  coresFundo,
  coresDestaque,
}: {
  numero: string;
  coresFundo: string[];
  coresDestaque: string[];
}) {
  const pontosNumero = criarPontosNumero(numero);

  return (
    <View
      style={styles.placa}
      accessibilityLabel="Placa educativa com círculos coloridos formando um número"
    >
      {circulosFundo.map((circulo, indice) => (
        <View
          key={`fundo-${indice}`}
          style={[
            styles.circulo,
            {
              backgroundColor: coresFundo[indice % coresFundo.length],
              left: circulo.left,
              top: circulo.top,
              width: circulo.size,
              height: circulo.size,
              borderRadius: circulo.size / 2,
            },
          ]}
        />
      ))}

      {pontosNumero.map((circulo, indice) => (
        <View
          key={`numero-${indice}`}
          style={[
            styles.circulo,
            styles.circuloNumero,
            {
              backgroundColor: coresDestaque[indice % coresDestaque.length],
              left: circulo.left,
              top: circulo.top,
              width: circulo.size,
              height: circulo.size,
              borderRadius: circulo.size / 2,
            },
          ]}
        />
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
    color: '#1E293B',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  aviso: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  avisoTexto: {
    color: '#92400E',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  etapaTexto: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  instrucao: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  placa: {
    width: 242,
    height: 180,
    backgroundColor: '#E8EDC7',
    borderRadius: 90,
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#F8FAFC',
    marginBottom: 20,
  },
  circulo: {
    position: 'absolute',
    opacity: 0.95,
  },
  circuloNumero: {
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  pergunta: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  },
  opcoes: {
    flexDirection: 'row',
    gap: 10,
  },
  botaoResposta: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  textoResposta: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultadoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 18,
  },
  resultadoTitulo: {
    color: '#312E81',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  resultadoContagem: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultadoTexto: {
    color: '#1E293B',
    fontSize: 15,
    lineHeight: 22,
  },
  indicacaoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  indicacaoTitulo: {
    color: '#312E81',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  indicacaoTexto: {
    color: '#1E293B',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 5,
  },
  botaoPrincipal: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoVoltar: {
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  textoBotaoVoltar: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
