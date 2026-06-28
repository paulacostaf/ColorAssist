import { sqlitePecaRepository } from '@/src/infrastructure/pecas/sqlitePecaRepository';

export function editarPecaUseCase(
  id: number,
  usuarioId: number,
  nome: string,
  tipo: string,
) {
  sqlitePecaRepository.editar(id, usuarioId, nome, tipo);
}
