import { sqlitePecaRepository } from '@/src/infrastructure/pecas/sqlitePecaRepository';

export function buscarPecaUseCase(id: number, usuarioId: number) {
  return sqlitePecaRepository.buscarPorId(id, usuarioId);
}
