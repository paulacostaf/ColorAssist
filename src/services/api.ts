export const API_URL = 'http://192.168.15.3:5000';

export async function analisarImagem(imagemUri: string) {
  const respostaImagem = await fetch(imagemUri);
  const blob = await respostaImagem.blob();

  const resposta = await fetch(`${API_URL}/analisar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-Filename': 'imagem.jpg',
    },
    body: blob,
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro ao analisar imagem.');
  }

  return dados;
}