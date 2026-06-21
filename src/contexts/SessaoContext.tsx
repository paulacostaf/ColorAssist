import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

export type UsuarioLogado = {
  id: number;
  nome: string;
  email: string;
  tipo_daltonismo?: string | null;
};

type SessaoContextValue = {
  usuarioLogado: UsuarioLogado | null;
  entrar: (usuario: UsuarioLogado) => void;
  atualizarUsuarioLogado: (dados: Partial<UsuarioLogado>) => void;
  sair: () => void;
};

const SessaoContext = createContext<SessaoContextValue | null>(null);

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null);

  const sessao = useMemo(
    () => ({
      usuarioLogado,
      entrar: setUsuarioLogado,
      atualizarUsuarioLogado: (dados: Partial<UsuarioLogado>) =>
        setUsuarioLogado((usuarioAtual) =>
          usuarioAtual ? { ...usuarioAtual, ...dados } : usuarioAtual
        ),
      sair: () => setUsuarioLogado(null),
    }),
    [usuarioLogado],
  );

  return (
    <SessaoContext.Provider value={sessao}>{children}</SessaoContext.Provider>
  );
}

export function useSessao() {
  const sessao = useContext(SessaoContext);

  if (!sessao) {
    throw new Error('useSessao deve ser usado dentro de SessaoProvider.');
  }

  return sessao;
}
