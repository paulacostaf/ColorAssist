import { sqlitePecaRepository } from '@/src/infrastructure/pecas/sqlitePecaRepository';

export function listarPecasUseCase(usuarioId: number) {
  return sqlitePecaRepository.listarPorUsuario(usuarioId);
}
