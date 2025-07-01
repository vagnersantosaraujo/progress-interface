# Painel de Progresso - DevTutor Pro

Este é um aplicativo web para acompanhar o progresso de estudos em um roteiro de desenvolvimento, construído como um projeto prático de aprendizado.

## Funcionalidades

* Login com conta Google via Firebase Authentication.
* Visualização dinâmica de um roteiro de aprendizagem modular e interativo.
* Sistema de gamificação com Níveis, Pontos de Experiência (XP) e Medalhas (Badges).
* Chat integrado com a IA do Gemini Pro para tirar dúvidas de programação contextualmente.
* Progresso salvo e recuperado do Cloud Firestore.
* Interface responsiva para diferentes tamanhos de tela.

## Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Backend (BaaS):** Google Firebase (Authentication & Firestore)
* **IA Generativa:** Google Gemini Pro API
* **Controle de Versão:** Git & GitHub

## Como Rodar o Projeto Localmente

1.  Clone o repositório (ou tenha os arquivos em uma pasta local).

2.  Crie o arquivo `config.js` na raiz do projeto com as suas chaves do Firebase e do Gemini:
    ```javascript
    const firebaseConfig = {
      apiKey: "SUA_API_KEY",
      authDomain: "SEU_AUTH_DOMAIN",
      projectId: "SEU_PROJECT_ID",
      storageBucket: "SEU_STORAGE_BUCKET",
      messagingSenderId: "SEU_MESSAGING_SENDER_ID",
      appId: "SEU_APP_ID"
    };

    const GEMINI_API_KEY = "SUA_CHAVE_DE_API_DO_GEMINI";
    ```

3.  Inicie um servidor local na pasta do projeto. Se você tem Python 3 instalado, pode usar:
    ```bash
    python3 -m http.server
    ```

4.  Abra o navegador e acesse `http://localhost:8000`.
