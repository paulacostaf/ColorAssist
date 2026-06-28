import { AtualizacaoAnalisePeca, NovaPeca, Peca } from './Peca';

export type PecaRepository = {
  cadastrar(peca: NovaPeca): void;
  listarPorUsuario(usuarioId: number): Peca[];
  buscarPorId(id: number, usuarioId: number): Peca | null;
  editar(id: number, usuarioId: number, nome: string, tipo: string): void;
  excluir(id: number, usuarioId: number): void;
  atualizarAnalise(analise: AtualizacaoAnalisePeca): void;
};
