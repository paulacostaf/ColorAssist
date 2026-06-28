import { ResultadoAnaliseImagem } from './AnaliseImagem';

export type AnaliseImagemGateway = {
  analisar(imagemUri: string): Promise<ResultadoAnaliseImagem>;
};
