export const TIPOS_PECA = [
  'Camiseta',
  'Blusa',
  'Camisa',
  'Calça',
  'Shorts',
  'Saia',
  'Vestido',
  'Casaco',
  'Jaqueta',
  'Moletom',
  'Tênis/Sapato',
  'Acessório',
  'Outro',
] as const;

export type TipoPeca = (typeof TIPOS_PECA)[number];

export type Peca = {
  id: number;
  usuario_id?: number;
  nome: string;
  tipo: string | null;
  imagem_uri: string | null;
  cor_detectada: string | null;
  paleta?: string | null;
  imagem_resultado?: string | null;
  data_cadastro: string | null;
};

export type NovaPeca = {
  usuarioId: number;
  nome: string;
  tipo: string;
  imagemUri: string | null;
  corDetectada: string | null;
  paleta: string | null;
  imagemResultado: string | null;
};

export type AtualizacaoAnalisePeca = {
  id: number;
  usuarioId: number;
  corDetectada: string;
  paleta: string | null;
  imagemResultado: string | null;
};
