from pathlib import Path

import cv2
import numpy as np


TIPOS_DALTONISMO = ("normal", "protanopia", "deuteranopia", "tritanopia")
PASTA_IMAGENS = Path("imagens")
PASTA_TESTES = Path("imagens_teste")
AMOSTRAS_MAXIMAS_KMEANS = 12000


def redimensionar(imagem, largura=800):
    """Redimensiona a imagem mantendo a proporcao original."""
    altura, largura_original = imagem.shape[:2]
    proporcao = largura / largura_original
    nova_altura = int(altura * proporcao)
    return cv2.resize(imagem, (largura, nova_altura))


def carregar_imagem(caminho):
    imagem = cv2.imread(str(caminho))

    if imagem is None:
        raise FileNotFoundError(f"Nao foi possivel carregar a imagem: {caminho}")

    return imagem


def perguntar_sim_nao(mensagem):
    while True:
        resposta = input(mensagem).strip().lower()

        if resposta in ("s", "sim"):
            return True

        if resposta in ("n", "nao"):
            return False

        print("Digite apenas 's' para sim ou 'n' para nao.")


def escolher_tipo_daltonismo():
    while True:
        tipo = input(
            "Digite o tipo (normal/protanopia/deuteranopia/tritanopia): "
        ).strip().lower()

        if tipo in TIPOS_DALTONISMO:
            return tipo

        print("Tipo invalido. Escolha uma das opcoes mostradas.")


def mostrar_imagem(titulo, imagem):
    cv2.imshow(titulo, imagem)
    cv2.waitKey(0)


def teste_daltonismo():
    print("\nEste teste e apenas uma simulação educativa, nao um diagnostico medico.")
    respostas = []
    testes = [
        (PASTA_TESTES / "teste1.jpg", "12"),
        (PASTA_TESTES / "teste2.jpg", "8"),
    ]

    for indice, (caminho_teste, _) in enumerate(testes, start=1):
        imagem_teste = redimensionar(carregar_imagem(caminho_teste))
        mostrar_imagem(f"Teste {indice}", imagem_teste)
        respostas.append(input("Qual numero voce viu? ").strip())

    cv2.destroyAllWindows()

    primeira_resposta_correta = respostas[0] == testes[0][1]
    segunda_resposta_correta = respostas[1] == testes[1][1]

    if primeira_resposta_correta and segunda_resposta_correta:
        return "normal"

    if not primeira_resposta_correta and segunda_resposta_correta:
        return "protanopia"

    if primeira_resposta_correta and not segunda_resposta_correta:
        return "deuteranopia"

    return "tritanopia"


def pedir_caminho_imagem():
    print("\nEscolha a imagem que deseja corrigir.")
    print("Exemplos: imagens/teste.jpg ou imagens/fsd.jpg")

    while True:
        caminho_digitado = input("Caminho da imagem: ").strip().strip('"')
        caminho = Path(caminho_digitado)

        if not caminho_digitado:
            print("Informe um caminho de imagem.")
            continue

        try:
            carregar_imagem(caminho)
            return caminho
        except FileNotFoundError as erro:
            print(erro)


def criar_mascara(hsv, tipo_daltonismo):
    if tipo_daltonismo == "protanopia":
        mascara_vermelho_baixo = cv2.inRange(
            hsv, np.array([0, 120, 120]), np.array([10, 255, 255])
        )
        mascara_vermelho_alto = cv2.inRange(
            hsv, np.array([170, 120, 120]), np.array([180, 255, 255])
        )
        return mascara_vermelho_baixo + mascara_vermelho_alto, np.array(
            [255, 0, 0], dtype=np.uint8
        )

    if tipo_daltonismo == "deuteranopia":
        mascara = cv2.inRange(
            hsv, np.array([25, 40, 40]), np.array([95, 255, 255])
        )
        return mascara, np.array([0, 0, 255], dtype=np.uint8)

    if tipo_daltonismo == "tritanopia":
        mascara = cv2.inRange(
            hsv, np.array([90, 50, 50]), np.array([130, 255, 255])
        )
        return mascara, np.array([0, 255, 255], dtype=np.uint8)

    raise ValueError("Tipo de daltonismo invalido.")


def aplicar_correcao(imagem, tipo_daltonismo, intensidade=0.25):
    hsv = cv2.cvtColor(imagem, cv2.COLOR_BGR2HSV)
    mascara, cor_sobreposicao = criar_mascara(hsv, tipo_daltonismo)

    brilho = hsv[:, :, 2]
    mascara[brilho > 240] = 0

    mascara = cv2.GaussianBlur(mascara, (15, 15), 0)
    mascara = (mascara / 255.0)[..., None]

    imagem_float = imagem.astype(np.float32)
    cor_float = cor_sobreposicao.astype(np.float32)

    corrigida = imagem_float * (1 - mascara * intensidade) + cor_float * (
        mascara * intensidade
    )

    return np.clip(corrigida, 0, 255).astype(np.uint8)


def nomear_cor_por_hsv_legado(hue, saturacao, valor, vermelho, verde, azul):
    """
    Classifica a cor aproximada usando HSV + RGB.
    Isso melhora casos próximos, como rosa/vermelho, coral/laranja e vinho/vermelho.
    """

    # Cores neutras
    if valor < 45:
        return "Preto", "tom muito escuro"

    if saturacao < 25 and valor > 220:
        return "Branco", "tom muito claro"

    if saturacao < 35:
        return "Cinza", "tom neutro"

    # Bege e marrom
    if 8 <= hue < 28 and saturacao < 100 and valor > 140:
        return "Bege", "tom claro amarelado"

    if 5 <= hue < 25 and valor < 150:
        return "Marrom", "tom escuro terroso"

    # Vermelho, rosa, vinho e coral
    if hue < 8 or hue >= 168:
        if valor < 120:
            return "Vinho", "vermelho escuro"

        if vermelho > 150 and azul > 90 and verde > 50:
            if saturacao < 170 or valor > 150:
                return "Rosa", "tom próximo ao vermelho/magenta"

        if vermelho > 170 and verde > 70 and azul < 130:
            return "Coral", "tom entre vermelho e laranja"

        return "Vermelho", "tom avermelhado intenso"

    # Laranja / coral
    if hue < 18:
        if vermelho > 160 and verde > 80 and azul < 130:
            return "Coral", "tom entre rosa, vermelho e laranja"
        return "Laranja", "tom alaranjado"

    # Amarelo
    if hue < 35:
        return "Amarelo", "tom amarelado"

    # Verde
    if hue < 85:
        if valor < 120:
            return "Verde escuro", "tom esverdeado escuro"
        return "Verde", "tom esverdeado"

    # Azul claro / azul
    if hue < 100:
        if valor > 150 and saturacao < 150:
            return "Azul claro", "tom azulado claro"
        return "Azul claro", "tom entre azul e ciano"

    if hue < 125:
        if valor < 120:
            return "Azul escuro", "tom azulado escuro"
        return "Azul", "tom azulado"

    # Roxo / lilás
    if hue < 150:
        if valor > 150 and saturacao < 150:
            return "Lilás", "tom claro entre roxo e rosa"
        return "Roxo", "tom arroxeado"

    # Rosa / magenta
    if hue < 168:
        if valor > 150 and saturacao < 180:
            return "Rosa", "tom rosado/magenta"
        return "Magenta", "tom forte entre rosa e roxo"

    return "Indefinida", "tom aproximado"


def nomear_cor_por_hsv(hue, saturacao, valor, vermelho, verde, azul):
    """
    Classifica a cor aproximada combinando HSV, RGB e CIELAB.
    Separa melhor luminosidade, saturacao e familias de matiz em roupas.
    """

    lab = cv2.cvtColor(
        np.uint8([[[azul, verde, vermelho]]]),
        cv2.COLOR_BGR2LAB,
    )[0][0]
    luminosidade = int(lab[0])
    eixo_a = int(lab[1]) - 128
    eixo_b = int(lab[2]) - 128
    croma_lab = float(np.hypot(eixo_a, eixo_b))

    vermelho_dominante = vermelho > verde + 18 and vermelho > azul + 8
    vermelho_vivo = (
        vermelho > 145
        and saturacao > 120
        and vermelho > verde + 45
        and vermelho > azul + 35
        and verde < 115
        and azul < 135
    )
    rosa_sombreado = (
        vermelho > 70
        and azul > 70
        and verde > 45
        and abs(verde - azul) < 75
        and vermelho < 210
    )
    rosa_frio = (
        vermelho >= verde + 20
        and azul >= verde - 10
        and azul > 80
        and vermelho - azul < 115
    )
    laranja_rosado = vermelho > 125 and verde > 65 and azul < verde + 35

    # Neutros e quase neutros. Nao deixa vermelho/roxo escuro saturado virar preto.
    if valor < 38 or (luminosidade < 42 and saturacao < 90):
        return "Preto", "tom muito escuro"

    if saturacao < 18 and valor > 225 and luminosidade > 215:
        return "Branco", "tom muito claro"

    if saturacao < 32 and croma_lab < 16:
        if valor > 205:
            return "Branco", "tom claro quase neutro"
        if valor < 78:
            return "Preto", "tom escuro quase neutro"
        return "Cinza", "tom neutro"

    if saturacao < 65 and valor > 130 and 8 <= hue < 34 and eixo_b > 6:
        if valor > 185:
            return "Bege", "tom claro amarelado e pouco saturado"
        return "Marrom claro", "tom terroso claro"

    # Amarelos, beges e marrons.
    if 18 <= hue < 36:
        if saturacao < 75 and valor > 155:
            return "Bege", "tom claro amarelado"
        if valor < 105:
            return "Marrom", "amarelo alaranjado escurecido"
        if valor < 165 or saturacao > 155:
            return "Amarelo", "tom amarelado intenso"
        return "Amarelo claro", "tom amarelado claro"

    if 5 <= hue < 18:
        if valor < 92:
            return "Marrom", "tom alaranjado escuro"
        if valor < 170 and eixo_a < 25 and eixo_b > 10:
            return "Marrom claro", "tom terroso claro"
        if valor < 145 and saturacao < 150:
            return "Marrom claro", "tom terroso claro"
        if laranja_rosado and azul > 55 and saturacao < 190:
            return "Salmão", "tom entre rosa e laranja"
        return "Coral", "tom quente entre vermelho e laranja"

    # Vermelhos, rosas, salmao, coral e vinho.
    if hue < 10 or hue >= 165:
        vinho_real = (
            valor < 95
            and luminosidade < 92
            and saturacao > 105
            and vermelho_dominante
            and azul >= verde - 8
        )

        if vinho_real:
            return "Vinho", "vermelho escuro fechado"

        if vermelho_vivo:
            if valor < 120 or luminosidade < 95:
                return "Vermelho escuro", "tom avermelhado escuro"
            return "Vermelho", "tom avermelhado intenso"

        if laranja_rosado and verde > azul + 12:
            if saturacao > 165:
                return "Coral", "tom vermelho alaranjado"
            if valor > 130 and saturacao < 210:
                return "Salmão", "tom rosado alaranjado"
            return "Coral", "tom vermelho alaranjado"

        if rosa_sombreado or rosa_frio:
            if saturacao < 85 and valor < 205:
                return "Rosa antigo", "tom rosado acinzentado"
            if valor > 200 and saturacao < 145:
                return "Rosa claro", "tom rosado claro"
            if valor < 120 and saturacao < 185:
                return "Rosa escuro", "tom rosado em sombra"
            if 80 <= saturacao < 150 and valor < 190:
                return "Rosa queimado", "tom rosado quente e escurecido"
            return "Rosa", "tom rosado"

        if valor < 120 and azul > 45 and saturacao > 120:
            return "Vermelho escuro", "tom avermelhado escuro"

        return "Vermelho", "tom avermelhado"

    # Laranjas intermediarios.
    if 10 <= hue < 18:
        if vermelho > 145 and verde > 80 and azul > 45 and saturacao < 185:
            return "Salmão", "tom suave entre rosa e laranja"
        if valor < 105 and saturacao < 165:
            return "Marrom", "laranja escurecido"
        return "Coral", "tom alaranjado avermelhado"

    # Verdes.
    if 36 <= hue < 86:
        if valor > 175 and saturacao < 150:
            return "Verde claro", "tom esverdeado claro"
        if valor < 105 or luminosidade < 95:
            return "Verde escuro", "tom esverdeado escuro"
        return "Verde", "tom esverdeado"

    # Azuis e cianos.
    if 86 <= hue < 126:
        if valor > 170 and saturacao < 160:
            return "Azul claro", "tom azulado claro"
        if valor < 105 or luminosidade < 95:
            return "Azul escuro", "tom azulado escuro"
        return "Azul", "tom azulado"

    # Lilas, roxos e magentas.
    if 126 <= hue < 150:
        if valor > 145 and saturacao < 165:
            return "Lilás", "tom claro entre roxo e rosa"
        if valor < 105 or luminosidade < 95:
            return "Roxo escuro", "tom arroxeado escuro"
        return "Roxo", "tom arroxeado"

    if 150 <= hue < 165:
        if valor > 155 and saturacao < 175:
            return "Rosa", "tom rosado frio"
        if azul > verde + 35 and saturacao > 150:
            return "Magenta", "tom forte entre rosa e roxo"
        return "Rosa escuro", "tom rosado puxado para magenta"

    return "Indefinida", "tom aproximado"


def limitar_amostras(pixels, limite=AMOSTRAS_MAXIMAS_KMEANS):
    """Mantem o k-means rapido e reproduzivel em imagens grandes."""

    if len(pixels) <= limite:
        return pixels

    indices = np.linspace(0, len(pixels) - 1, limite, dtype=np.int32)
    return pixels[indices]


def criar_mascara_pixels_relevantes(imagem):
    """
    Cria uma mascara para focar na peca de roupa.
    Remove branco forte, pixels sem informacao de cor e fundos parecidos com as bordas.
    """

    hsv = cv2.cvtColor(imagem, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(imagem, cv2.COLOR_BGR2LAB)

    saturacao = hsv[:, :, 1]
    valor = hsv[:, :, 2]

    mascara = (
        ((saturacao > 35) & (valor > 35) & (valor < 245))
        | ((valor < 155) & (saturacao > 18))
    )

    altura, largura = imagem.shape[:2]
    faixa = max(4, min(altura, largura) // 18)
    bordas = np.concatenate(
        [
            lab[:faixa, :, :].reshape(-1, 3),
            lab[-faixa:, :, :].reshape(-1, 3),
            lab[:, :faixa, :].reshape(-1, 3),
            lab[:, -faixa:, :].reshape(-1, 3),
        ],
        axis=0,
    )

    cor_fundo_lab = np.median(bordas, axis=0)
    distancia_fundo = np.linalg.norm(lab.astype(np.float32) - cor_fundo_lab, axis=2)
    mascara_sem_fundo = mascara & (distancia_fundo > 28)

    if np.count_nonzero(mascara_sem_fundo) > 200:
        mascara = mascara_sem_fundo

    mascara_uint8 = mascara.astype(np.uint8) * 255
    kernel = np.ones((3, 3), np.uint8)
    mascara_uint8 = cv2.morphologyEx(mascara_uint8, cv2.MORPH_OPEN, kernel)
    mascara_uint8 = cv2.morphologyEx(mascara_uint8, cv2.MORPH_CLOSE, kernel)

    return mascara_uint8.astype(bool)


def centro_lab_para_bgr(centro_lab):
    lab_pixel = np.uint8([[np.clip(centro_lab, 0, 255)]])
    return cv2.cvtColor(lab_pixel, cv2.COLOR_LAB2BGR)[0][0]


def cor_representativa_do_grupo(pixels_bgr, labels, indice, centro_lab):
    grupo = pixels_bgr[labels == indice]

    if len(grupo) < 10:
        return centro_lab_para_bgr(centro_lab)

    hsv = cv2.cvtColor(np.uint8([grupo]), cv2.COLOR_BGR2HSV)[0]
    valores = hsv[:, 2]

    limite_sombra = np.percentile(valores, 25)
    limite_brilho = np.percentile(valores, 95)
    pixels_centrais = grupo[(valores >= limite_sombra) & (valores <= limite_brilho)]

    if len(pixels_centrais) < 10:
        pixels_centrais = grupo

    return np.uint8(np.clip(np.median(pixels_centrais, axis=0), 0, 255))


def extrair_cores_principais(imagem, quantidade=4):
    """
    Extrai as cores dominantes tentando ignorar fundo claro,
    sombras fortes e regiões pouco relevantes.
    """

    pequena = redimensionar(imagem, largura=320)
    mascara_roupa = criar_mascara_pixels_relevantes(pequena)
    hsv = cv2.cvtColor(pequena, cv2.COLOR_BGR2HSV)

    saturacao = hsv[:, :, 1]
    valor = hsv[:, :, 2]

    # Máscara seletiva:
    # ignora fundo muito branco/claro e pixels quase sem cor.
    mascara_roupa = (
        ((saturacao > 40) & (valor > 45))
        | ((valor < 160) & (saturacao > 20))
    )
    mascara_roupa = criar_mascara_pixels_relevantes(pequena)

    pixels = pequena[mascara_roupa]

    if len(pixels) < 200:
        pixels = pequena.reshape(-1, 3)

    pixels = limitar_amostras(pixels)
    pixels_lab = cv2.cvtColor(np.uint8([pixels]), cv2.COLOR_BGR2LAB)[0]

    pixels_float = np.float32(pixels_lab)
    criterios = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, 0.2)
    quantidade_grupos = min(quantidade, len(pixels_float))

    cv2.setRNGSeed(42)
    _, labels, centros = cv2.kmeans(
        pixels_float,
        quantidade_grupos,
        None,
        criterios,
        8,
        cv2.KMEANS_PP_CENTERS,
    )

    labels_flat = labels.flatten()
    contagens = np.bincount(labels_flat)
    total = int(contagens.sum())
    ordem = np.argsort(contagens)[::-1]
    cores = []

    for indice in ordem:
        cor_bgr = cor_representativa_do_grupo(pixels, labels_flat, indice, centros[indice])

        azul, verde, vermelho = [int(valor_cor) for valor_cor in cor_bgr]

        cor_hsv = cv2.cvtColor(np.uint8([[cor_bgr]]), cv2.COLOR_BGR2HSV)[0][0]
        hue = int(cor_hsv[0])
        sat = int(cor_hsv[1])
        val = int(cor_hsv[2])

        nome, tom = nomear_cor_por_hsv(hue, sat, val, vermelho, verde, azul)

        percentual = round((int(contagens[indice]) / total) * 100)

        # Evita repetir a mesma cor várias vezes
        if any(cor["nome"] == nome for cor in cores):
            continue

        cores.append(
            {
                "nome": nome,
                "tom": tom,
                "hex": f"#{vermelho:02x}{verde:02x}{azul:02x}",
                "rgb": f"RGB({vermelho}, {verde}, {azul})",
                "percentual": percentual,
            }
        )

        if len(cores) == quantidade:
            break

    return cores


def identificar_cor_principal(imagem):
    cores = extrair_cores_principais(imagem, quantidade=4)

    if not cores:
        return {
            "nome": "Indefinida",
            "tom": "não identificado",
            "hex": "#cccccc",
            "rgb": "RGB(204, 204, 204)",
            "percentual": 0,
        }

    return cores[0]


def descrever_roupa_por_cor(cor_principal, cores):
    nome_principal = cor_principal["nome"].lower()
    tom = cor_principal.get("tom", "tom aproximado")
    outras_cores = [cor["nome"].lower() for cor in cores[1:3]]

    if outras_cores:
        complemento = " Também aparecem tons de " + " e ".join(outras_cores) + "."
    else:
        complemento = ""

    return f"A roupa parece ser principalmente {nome_principal}, com {tom}.{complemento}"


def salvar_resultado(imagem_corrigida, caminho_original):
    nome_saida = f"{caminho_original.stem}_corrigida{caminho_original.suffix}"
    caminho_saida = caminho_original.with_name(nome_saida)

    if cv2.imwrite(str(caminho_saida), imagem_corrigida):
        print(f"Imagem salva em: {caminho_saida}")
    else:
        print("Nao foi possivel salvar a imagem corrigida.")


def main():
    sabe_tipo = perguntar_sim_nao("Voce sabe seu tipo de daltonismo? (s/n): ")

    if sabe_tipo:
        tipo_daltonismo = escolher_tipo_daltonismo()
    else:
        tipo_daltonismo = teste_daltonismo()
        print(f"Tipo identificado: {tipo_daltonismo}")

    caminho_imagem = pedir_caminho_imagem()
    imagem = redimensionar(carregar_imagem(caminho_imagem))

    if tipo_daltonismo == "normal":
        mostrar_imagem("Imagem", imagem)
        cv2.destroyAllWindows()
        return

    corrigida = aplicar_correcao(imagem, tipo_daltonismo)

    cv2.imshow("Original", imagem)
    cv2.imshow("Corrigida", corrigida)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    if perguntar_sim_nao("Deseja salvar a imagem corrigida? (s/n): "):
        salvar_resultado(corrigida, caminho_imagem)


if __name__ == "__main__":
    main()
