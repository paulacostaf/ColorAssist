import { AtualizacaoAnalisePeca } from '@/src/domain/pecas/Peca';
import { sqlitePecaRepository } from '@/src/infrastructure/pecas/sqlitePecaRepository';

export function atualizarAnalisePecaUseCase(analise: AtualizacaoAnalisePeca) {
  sqlitePecaRepository.atualizarAnalise(analise);
}
