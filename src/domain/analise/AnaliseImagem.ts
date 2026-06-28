import { Peca } from '@/src/domain/pecas/Peca';

export type CorPrincipal = {
  nome?: string;
  cor?: string;
  tom?: string;
  hex?: string;
  rgb?: string;
  percentual?: number;
};

export type ResultadoAnaliseImagem = {
  cor_principal?: string | CorPrincipal;
  cores?: CorPrincipal[];
  descricao?: string;
  imagem_original?: string;
  imagem_resultado?: string | null;
};

export function normalizarHex(hex?: string): string | undefined {
  if (!hex) {
    return undefined;
  }

  const valor = hex.trim().match(/#?([0-9a-fA-F]{6})/);

  if (!valor) {
    return undefined;
  }

  return `#${valor[1].toLowerCase()}`;
}

export function obterCorPrincipal(
  resultado: ResultadoAnaliseImagem | null,
): CorPrincipal {
  if (!resultado?.cor_principal) {
    return {};
  }

  if (typeof resultado.cor_principal === 'string') {
    return { nome: resultado.cor_principal };
  }

  return {
    ...resultado.cor_principal,
    hex: normalizarHex(resultado.cor_principal.hex),
  };
}

export function extrairNomeCorPrincipal(resultado: ResultadoAnaliseImagem) {
  const corPrincipal = obterCorPrincipal(resultado);

  return (
    corPrincipal.nome ||
    corPrincipal.cor ||
    corPrincipal.hex ||
    JSON.stringify(resultado.cor_principal)
  );
}

export function primeiraCorDaPaleta(paleta: string | null): CorPrincipal {
  if (!paleta) {
    return {};
  }

  try {
    const cores = JSON.parse(paleta);

    if (Array.isArray(cores) && cores[0]) {
      return {
        ...cores[0],
        hex: normalizarHex(cores[0].hex),
      };
    }
  } catch {
    return {};
  }

  return {};
}

export function resultadoDaPecaCadastrada(
  peca: Pick<Peca, 'cor_detectada' | 'paleta'>,
): ResultadoAnaliseImagem | null {
  const corPaleta = primeiraCorDaPaleta(peca.paleta || null);
  const corPrincipal: CorPrincipal = {
    ...corPaleta,
    nome: peca.cor_detectada || corPaleta.nome,
  };

  if (!corPrincipal.nome && !corPrincipal.hex) {
    return null;
  }

  return {
    cor_principal: corPrincipal,
  };
}

export function combinarResultadoComCorSalva(
  resultado: ResultadoAnaliseImagem,
  corDetectadaSalva?: string | null,
): ResultadoAnaliseImagem {
  if (!corDetectadaSalva) {
    return resultado;
  }

  const corPrincipal = obterCorPrincipal(resultado);

  return {
    ...resultado,
    cor_principal: {
      ...corPrincipal,
      nome: corDetectadaSalva,
    },
  };
}
