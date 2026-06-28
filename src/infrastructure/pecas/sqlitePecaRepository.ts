import {
  atualizarAnalisePeca,
  buscarPecaPorId,
  cadastrarPeca,
  editarPeca,
  excluirPeca,
  listarPecas,
} from '@/src/database/database';
import { PecaRepository } from '@/src/domain/pecas/PecaRepository';

export const sqlitePecaRepository: PecaRepository = {
  cadastrar(peca) {
    cadastrarPeca(
      peca.usuarioId,
      peca.nome,
      peca.tipo,
      peca.imagemUri,
      peca.corDetectada,
      peca.paleta,
      peca.imagemResultado,
    );
  },

  listarPorUsuario(usuarioId) {
    return listarPecas(usuarioId) as ReturnType<PecaRepository['listarPorUsuario']>;
  },

  buscarPorId(id, usuarioId) {
    return buscarPecaPorId(id, usuarioId) as ReturnType<PecaRepository['buscarPorId']>;
  },

  editar(id, usuarioId, nome, tipo) {
    editarPeca(id, usuarioId, nome, tipo);
  },

  excluir(id, usuarioId) {
    excluirPeca(id, usuarioId);
  },

  atualizarAnalise(analise) {
    atualizarAnalisePeca(
      analise.id,
      analise.usuarioId,
      analise.corDetectada,
      analise.paleta,
      analise.imagemResultado,
    );
  },
};
