import { analisarImagem } from '@/src/services/api';
import { AnaliseImagemGateway } from '@/src/domain/analise/AnaliseImagemGateway';

export const httpAnaliseImagemGateway: AnaliseImagemGateway = {
  analisar: analisarImagem,
};
