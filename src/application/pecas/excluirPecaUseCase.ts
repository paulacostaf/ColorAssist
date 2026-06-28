import { sqlitePecaRepository } from '@/src/infrastructure/pecas/sqlitePecaRepository';

export function excluirPecaUseCase(id: number, usuarioId: number) {
  sqlitePecaRepository.excluir(id, usuarioId);
}
