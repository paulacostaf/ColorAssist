# ColorAssist

## Descrição

O **ColorAssist** é um aplicativo mobile desenvolvido em **React Native** com **Expo Go**. O objetivo do sistema é permitir o cadastro e a organização de peças de roupa, com apoio de um recurso de análise de cor por imagem.

O aplicativo permite que o usuário faça cadastro, login, cadastre peças com foto, visualize a lista de peças salvas, edite informações e exclua registros.

## Problema

Algumas pessoas possuem dificuldade para identificar cores de roupas ou organizar suas peças. Essa dificuldade pode ser maior em casos de daltonismo ou insegurança na combinação de cores.

Dessa forma, o ColorAssist busca oferecer uma solução simples para registrar peças de roupa e auxiliar na identificação da cor predominante a partir de uma imagem.

## Objetivo

Desenvolver um aplicativo completo com banco de dados persistente, interface de interação com o usuário, login/logout e operações CRUD, utilizando React Native e Expo Go.

## Funcionalidades

* Cadastro de usuário;
* Login e logout;
* Cadastro de peças de roupa;
* Listagem das peças cadastradas;
* Edição de peças;
* Exclusão de peças;
* Upload de imagem da peça;
* Análise da cor predominante por imagem.

## Tecnologias Utilizadas

* React Native;
* Expo Go;
* Expo Router;
* TypeScript;
* SQLite com `expo-sqlite`;
* Expo Image Picker;
* Python;
* OpenCV.

## Banco de Dados

O aplicativo utiliza banco de dados local com **SQLite**, garantindo que os dados permaneçam salvos mesmo após o fechamento do aplicativo.

As principais informações armazenadas são:

* Usuários: nome, e-mail e senha;
* Peças: nome, tipo, cor e imagem.

## Inteligência Artificial

O projeto utiliza um backend em Python com OpenCV para realizar a análise da imagem enviada pelo usuário. A partir da foto da peça, o sistema identifica a cor predominante e retorna essa informação para o aplicativo.

## Como Executar

### Aplicativo

Na pasta principal do projeto:

```bash
npm install
npx expo start
```

Depois, abra o projeto no celular usando o **Expo Go**.

### Backend

Na pasta `backend`:

```bash
pip install -r requirements.txt
python server.py
```

O celular e o computador precisam estar conectados à mesma rede Wi-Fi. O IP do backend deve estar configurado no arquivo:

```text
src/services/api.ts
```

## Resultados Obtidos

O projeto conseguiu atender aos principais requisitos solicitados no trabalho final. Foram implementados banco de dados persistente, interface de interação com o usuário, login/logout e operações CRUD.

Além disso, foi incluído um recurso de análise de imagem, utilizando Python e OpenCV, para identificar a cor predominante das peças cadastradas.

Durante o desenvolvimento, a principal dificuldade foi integrar o aplicativo mobile ao backend, pois foi necessário configurar corretamente o IP da máquina para permitir a comunicação com o celular.

## Requisitos Atendidos

* Banco de dados persistente;
* Interface com botões, inputs e listas;
* React Native com Expo Go;
* Login e logout;
* CRUD completo;
* Uso de imagem;
* Recurso de análise de cor com Inteligência Artificial/Processamento de Imagem.
