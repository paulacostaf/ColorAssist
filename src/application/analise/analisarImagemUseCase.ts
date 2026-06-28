import { httpAnaliseImagemGateway } from '@/src/infrastructure/analise/httpAnaliseImagemGateway';

export function analisarImagemUseCase(imagemUri: string) {
  return httpAnaliseImagemGateway.analisar(imagemUri);
}
