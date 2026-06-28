import { NovaPeca } from '@/src/domain/pecas/Peca';
import { sqlitePecaRepository } from '@/src/infrastructure/pecas/sqlitePecaRepository';

export function cadastrarPecaUseCase(peca: NovaPeca) {
  sqlitePecaRepository.cadastrar(peca);
}
