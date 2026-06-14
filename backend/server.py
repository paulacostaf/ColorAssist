from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4
import json
import mimetypes

import cv2
import numpy as np

from main import (
    aplicar_correcao,
    descrever_roupa_por_cor,
    extrair_cores_principais,
    identificar_cor_principal,
)

BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"
UPLOAD_DIR = STATIC_DIR / "uploads"
RESULTADO_DIR = STATIC_DIR / "resultados"
EXTENSOES_PERMITIDAS = {".jpg", ".jpeg", ".png", ".webp"}

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULTADO_DIR.mkdir(parents=True, exist_ok=True)


def enviar_json(handler, status, dados):
    resposta = json.dumps(dados, ensure_ascii=False).encode("utf-8")

    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.send_header("Content-Length", str(len(resposta)))
    handler.end_headers()
    handler.wfile.write(resposta)


def extensao_permitida(nome_arquivo):
    return Path(nome_arquivo).suffix.lower() in EXTENSOES_PERMITIDAS


def salvar_arquivo_enviado(nome_arquivo, conteudo):
    extensao = Path(nome_arquivo).suffix.lower()

    if not extensao:
        extensao = ".jpg"

    nome_final = f"{uuid4().hex}{extensao}"
    caminho = UPLOAD_DIR / nome_final
    caminho.write_bytes(conteudo)

    return caminho, nome_final


def carregar_imagem(caminho):
    dados = np.fromfile(str(caminho), dtype=np.uint8)
    imagem = cv2.imdecode(dados, cv2.IMREAD_COLOR)

    if imagem is None:
        raise ValueError("Não foi possível abrir a imagem enviada.")

    return imagem

def salvar_imagem_corrigida(imagem, extensao):
    nome_resultado = f"{uuid4().hex}_corrigida{extensao}"
    caminho_resultado = RESULTADO_DIR / nome_resultado

    sucesso, buffer = cv2.imencode(extensao, imagem)

    if not sucesso:
        raise ValueError("Não foi possível gerar a imagem corrigida.")

    buffer.tofile(str(caminho_resultado))

    return nome_resultado


class ServidorIA(SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/":
            enviar_json(
                self,
                200,
                {
                    "mensagem": "Backend ColorAssist ativo.",
                    "rota": "POST /analisar",
                },
            )
            return

        return super().do_GET()

    def do_POST(self):
        rota = urlparse(self.path)

        if rota.path != "/analisar":
            enviar_json(self, 404, {"erro": "Rota não encontrada."})
            return

        nome_arquivo = self.headers.get("X-Filename", "imagem.jpg")

        if not extensao_permitida(nome_arquivo):
            enviar_json(self, 400, {"erro": "Use uma imagem JPG, PNG ou WEBP."})
            return

        tamanho = int(self.headers.get("Content-Length", 0))

        if tamanho <= 0:
            enviar_json(self, 400, {"erro": "Envie uma imagem para análise."})
            return

        try:
            conteudo = self.rfile.read(tamanho)

            caminho_upload, nome_upload = salvar_arquivo_enviado(nome_arquivo, conteudo)

            imagem = carregar_imagem(caminho_upload)

            cores = extrair_cores_principais(imagem)

            cor_principal = cores[0] if cores else identificar_cor_principal(imagem)

            descricao = descrever_roupa_por_cor(cor_principal, cores)

            # Aqui mantemos uma correção padrão simples.
            # Se quiser, depois podemos deixar o app escolher o tipo de daltonismo.
            imagem_corrigida = aplicar_correcao(imagem, "deuteranopia")

            nome_resultado = salvar_imagem_corrigida(imagem_corrigida, caminho_upload.suffix)

            host = self.headers.get("Host", "127.0.0.1:5000")

            enviar_json(
                self,
                200,
                {
                    "cor_principal": cor_principal,
                    "cores": cores,
                    "descricao": descricao,
                    "imagem_original": f"http://{host}/static/uploads/{nome_upload}",
                    "imagem_resultado": f"http://{host}/static/resultados/{nome_resultado}",
                },
            )

        except ValueError as erro:
            enviar_json(self, 400, {"erro": str(erro)})

        except Exception as erro:
            enviar_json(self, 500, {"erro": f"Erro interno: {str(erro)}"})

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    mimetypes.add_type("text/css", ".css")

    servidor = ThreadingHTTPServer(("0.0.0.0", 5000), ServidorIA)

    print("Backend ColorAssist rodando.")
    print("Acesse no computador: http://127.0.0.1:5000")
    print("Para acessar pelo celular, use: http://IP_DO_COMPUTADOR:5000")
    print("Rota da IA: POST /analisar")
    print("Pressione Ctrl+C para parar.")

    servidor.serve_forever()


if __name__ == "__main__":
    main()