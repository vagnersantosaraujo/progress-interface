// --- Fonte da Verdade do Roteiro ---
const ROTEIRO_APRENDIZAGEM = [
    { nome: "1. Fundamentos da Web", topicos: ["HTML", "CSS", "JavaScript Básico", "DOM Manipulation"] },
    { nome: "2. Ferramentas Essenciais", topicos: ["Git e Controle de Versão", "GitHub (Pull Requests, Issues)"] },
    { nome: "3. Programação Avançada", topicos: ["Estruturas de Dados", "Algoritmos", "Padrões de Projeto"] },
    { nome: "4. Ecossistema React", topicos: ["Fundamentos do React", "Hooks", "Gerenciamento de Estado"] },
    { nome: "5. React Native", topicos: ["Componentes Nativos", "Navegação", "APIs Nativas"] },
    { nome: "6. Publicação", topicos: ["Build e Assinatura", "Google Play Console", "App Store Connect"] }
];

// --- Inicialização do Firebase ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
console.log("Firebase conectado e pronto para usar!");



// --- Seleção de Elementos ---
const somDeConquista = new Audio('https://www.myinstants.com/media/sounds/wrong-answer-sound-effect.mp3');
somDeConquista.volume = 0.5; // Ajusta o volume para não ser muito alto
const appContainer = document.querySelector('.container');
const mainContent = document.querySelector('#main-content');
const roteiroContainer = document.querySelector('#roteiro-container');
const displayNivel = document.querySelector('#display-nivel');
const displayXp = document.querySelector('#display-xp');
const badgesContainer = document.querySelector('#badges-container');
const actionButtons = document.querySelectorAll('.action-btn');
const ajudaBtn = document.querySelector('#btn-ajuda');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const chatHistory = document.querySelector('#chat-history')

// --- Variáveis de Estado Global ---
let progressoAtual = {};
let docIdAtual = '';

// --- Lógica de Autenticação ---
const loginBtn = document.createElement('button');
loginBtn.innerText = 'Login com Google';
loginBtn.id = 'login-btn';
appContainer.insertBefore(loginBtn, roteiroContainer);

auth.onAuthStateChanged(user => {
    const userProfileSection = document.querySelector('#user-profile');
    const userPhoto = document.querySelector('#user-photo');
    const userName = document.querySelector('#user-name');
    const logoutBtn = document.querySelector('#logout-btn');

    if (user) {
        // --- Usuário está logado ---
        console.log("Usuário logado:", user.displayName, `(ID: ${user.uid})`);
        docIdAtual = user.uid;

        // Preenche os dados do perfil e mostra a seção
        userPhoto.src = user.photoURL;
        userName.innerText = user.displayName;
        userProfileSection.style.display = 'flex';
        
        // Esconde o botão de login principal
        loginBtn.style.display = 'none';
        
        // Mostra o conteúdo principal da aplicação
        mainContent.style.display = 'block';

        // Carrega o progresso do usuário
        carregarProgresso(docIdAtual);

        // Adiciona o evento de clique para o botão de logoff
        logoutBtn.addEventListener('click', () => {
            auth.signOut().catch(error => console.error("Erro no logoff:", error));
        });

    } else {
        // --- Usuário está deslogado ---
        console.log("Nenhum usuário logado.");

        // Esconde a seção de perfil
        userProfileSection.style.display = 'none';

        // Mostra o botão de login principal
        loginBtn.style.display = 'inline-flex'; // Usa 'inline-flex' por causa do nosso estilo
        
        // Esconde o conteúdo principal e limpa o roteiro
        mainContent.style.display = 'none';
        roteiroContainer.innerHTML = '';
    }
});

loginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(error => console.error("Erro no login:", error));
});

function carregarProgresso(userId) {
    if (!userId) return;
    db.collection('progresso_alunos').doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                progressoAtual = doc.data();
                renderizarUICompleta(progressoAtual);
            } else {
                console.log("Novo usuário! Criando perfil de progresso inicial.");
                progressoAtual = {
                    nivel: 1, pontos_xp: 0, conquistas: [], topicos_concluidos: [],
                    modulo_atual: "1. Fundamentos da Web", topico_atual: "HTML",
                    ultima_sessao: new Date().toISOString().split('T')[0],
                    streak_dias: 1
                };
                db.collection('progresso_alunos').doc(userId).set(progressoAtual)
                    .then(() => renderizarUICompleta(progressoAtual));
            }
        })
        .catch(error => console.error("Erro ao buscar documento:", error));
}

function renderizarUICompleta(dados) {
    displayNivel.innerText = dados.nivel;
    displayXp.innerText = dados.pontos_xp;
    renderizarRoteiro(dados);
    exibirMedalhas(dados);
}


function renderizarRoteiro(dados) {
    roteiroContainer.innerHTML = '';
    const moduloAtualNome = dados.modulo_atual;
    const topicosConcluidos = dados.topicos_concluidos || [];
    const indiceModuloAtual = ROTEIRO_APRENDIZAGEM.findIndex(m => m.nome === moduloAtualNome);

    const checkIconSVG = `<svg class="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
    const arrowIconSVG = `<svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`;

    ROTEIRO_APRENDIZAGEM.forEach((modulo, index) => {
        const moduloWrapper = document.createElement('div');
        moduloWrapper.className = 'modulo-wrapper';

        const moduloHeader = document.createElement('div');
        let classeModulo = 'modulo-item';

        if (index < indiceModuloAtual) { classeModulo += ' modulo-concluido'; }
        else if (index === indiceModuloAtual) { classeModulo += ' modulo-atual'; }
        else { classeModulo += ' modulo-futuro'; }
        moduloHeader.className = classeModulo;

        let headerContent = '';
        let nomeModulo, progressoContent;

        if (index < indiceModuloAtual) { // Módulo Concluído
            // MUDANÇA: O ícone de check agora é parte do nome do módulo
            nomeModulo = `<span>${modulo.nome} ${checkIconSVG}</span>`;
            progressoContent = `<div class="progress-wrapper"><div class="progress-bar-container"><div class="progress-bar-fill" style="width: 100%;"></div></div><span class="progress-text">100%</span></div>`;
            headerContent = `<div class="modulo-info">${nomeModulo}${progressoContent}</div>${arrowIconSVG}`;
        } else if (index === indiceModuloAtual) { // Módulo Atual
            nomeModulo = `<span>${modulo.nome}</span>`;
            const topicosDoModulo = modulo.topicos;
            const topicosConcluidosNesteModulo = topicosConcluidos.filter(t => topicosDoModulo.includes(t)).length;
            const percentual = (topicosDoModulo.length > 0) ? (topicosConcluidosNesteModulo / topicosDoModulo.length) * 100 : 0;
            progressoContent = `<div class="progress-wrapper"><div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${percentual}%;"></div></div><span class="progress-text">${Math.round(percentual)}%</span></div>`;
            headerContent = `<div class="modulo-info">${nomeModulo}${progressoContent}</div>${arrowIconSVG}`;
        } else { // Módulo Futuro
            nomeModulo = `<span>${modulo.nome}</span>`;
            headerContent = `<div class="modulo-info">${nomeModulo}</div>${arrowIconSVG}`;
        }
        
        moduloHeader.innerHTML = headerContent;

        const topicosList = document.createElement('ul');
        topicosList.className = 'topicos-list';
        modulo.topicos.forEach(topico => {
            const isConcluido = topicosConcluidos.includes(topico);
            const topicoItem = document.createElement('li');
            topicoItem.className = isConcluido ? 'topico-concluido' : '';
            topicoItem.innerText = topico;
            topicosList.appendChild(topicoItem);
        });

        moduloWrapper.appendChild(moduloHeader);
        moduloWrapper.appendChild(topicosList);
        roteiroContainer.appendChild(moduloWrapper);

        moduloHeader.addEventListener('click', () => {
            // Permite expandir qualquer módulo
            moduloWrapper.classList.toggle('expanded');
        });
    });
}


function exibirMedalhas(dados) {
    badgesContainer.innerHTML = '';
    const conquistas = dados.conquistas || [];
    if (conquistas.length > 0) {
        conquistas.forEach(conquistaNome => {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'badge';
            badgeElement.title = conquistaNome;
            const iniciais = conquistaNome.split(' ').map(palavra => palavra[0]).join('');
            badgeElement.innerText = iniciais;
            badgesContainer.appendChild(badgeElement);
        });
    } else {
        badgesContainer.innerText = "Nenhuma medalha ainda.";
    }
}


actionButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (!docIdAtual) {
            alert('Faça o login primeiro.');
            return;
        }

        const xpGanhos = parseInt(button.dataset.xp);
        const novoXp = (progressoAtual.pontos_xp || 0) + xpGanhos;
        
        let atualizacoes = {
            pontos_xp: novoXp
        };

        // --- LÓGICA DE AVANÇO (A GRANDE MUDANÇA) ---
        if (button.id === 'btn-licao' && progressoAtual.topico_atual) {
            const topicoAtual = progressoAtual.topico_atual;
            
            // Adiciona o tópico atual aos concluídos
            if (!(progressoAtual.topicos_concluidos || []).includes(topicoAtual)) {
                atualizacoes.topicos_concluidos = firebase.firestore.FieldValue.arrayUnion(topicoAtual);
            }

            // Encontra o próximo tópico e módulo
            const indiceModuloAtual = ROTEIRO_APRENDIZAGEM.findIndex(m => m.nome === progressoAtual.modulo_atual);
            const moduloAtual = ROTEIRO_APRENDIZAGEM[indiceModuloAtual];
            
            const indiceTopicoAtual = moduloAtual.topicos.indexOf(progressoAtual.topico_atual);

            if (indiceTopicoAtual < moduloAtual.topicos.length - 1) {
                // Se ainda há tópicos neste módulo, avança para o próximo
                atualizacoes.topico_atual = moduloAtual.topicos[indiceTopicoAtual + 1];
            } else if (indiceModuloAtual < ROTEIRO_APRENDIZAGEM.length - 1) {
                // Se era o último tópico, avança para o próximo módulo
                const proximoModulo = ROTEIRO_APRENDIZAGEM[indiceModuloAtual + 1];
                atualizacoes.modulo_atual = proximoModulo.nome;
                atualizacoes.topico_atual = proximoModulo.topicos[0];
            } else {
                // Se era o último tópico do último módulo
                atualizacoes.topico_atual = "Parabéns, você concluiu o roteiro!";
            }
        }
        
        db.collection('progresso_alunos').doc(docIdAtual).update(atualizacoes)
        .then(() => {
            console.log("Progresso atualizado com sucesso!");
            somDeConquista.play(); //Toca som
            // Força a recarga dos dados do Firestore para garantir que a UI reflita o estado mais recente
            carregarProgresso(docIdAtual);
        })
        .catch(error => {
            console.error("Erro ao atualizar progresso:", error);
        });
    });
});
ajudaBtn.addEventListener('click', function() {
    alert(
        'Bem-vindo ao Painel de Progresso!\n\n' +
        '1. Faça login com sua conta Google para carregar ou criar seu progresso.\n' +
        '2. Use os botões de ação para registrar as tarefas concluídas e ganhar XP.\n' +
        '3. Acompanhe sua jornada através dos módulos expansíveis.'
    );
});


// --- LÓGICA DO CHAT COM GEMINI ---

// Função para adicionar mensagens na tela do chat
function adicionarMensagemAoHistorico(texto, autor) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${autor}`; // autor será 'user' ou 'model'
    messageElement.innerHTML = marked.parse(texto);
    chatHistory.appendChild(messageElement);
    // Rola o chat para a última mensagem
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Função que envia a mensagem para a API do Gemini
// SUBSTITUA toda a sua função enviarMensagemParaGemini por esta:
// SUBSTITUA toda a sua função enviarMensagemParaGemini por esta versão final:

async function enviarMensagemParaGemini(prompt) {
    adicionarMensagemAoHistorico(prompt, 'user');
    chatInput.value = '';

    const loadingElement = document.createElement('div');
    loadingElement.className = 'chat-message model';
    loadingElement.innerText = 'Digitando...';
    chatHistory.appendChild(loadingElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // --- NOVA LÓGICA: CONSTRUÇÃO DINÂMICA DO CONTEXTO ---
    const topicosConcluidosTexto = progressoAtual.topicos_concluidos && progressoAtual.topicos_concluidos.length > 0
        ? progressoAtual.topicos_concluidos.join(', ')
        : "Nenhum tópico concluído ainda.";

    const instrucaoDeSistemaDinamica = `
        Você é o "DevTutor Pro", um tutor de programação sênior e paciente.
        Responda sempre em português do Brasil.
        Seu foco principal é em desenvolvimento de software, incluindo HTML, CSS, JavaScript, Git, React e React Native.
        Use formatação Markdown para melhorar a legibilidade, incluindo **negrito** para termos importantes e blocos de código (usando três crases) para exemplos.
        Mantenha um tom encorajador e positivo.

        ---
        CONTEXTO ATUAL DO ALUNO:
        - Módulo Atual: ${progressoAtual.modulo_atual}
        - Tópico Atual: ${progressoAtual.topico_atual}
        - Tópicos Já Concluídos: ${topicosConcluidosTexto}
        ---

        Leve este contexto em consideração para não sugerir tópicos que o aluno já dominou e para adaptar suas explicações ao nível atual dele.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                systemInstruction: {
                    parts: [{
                        text: instrucaoDeSistemaDinamica // Usando a nova instrução dinâmica
                    }]
                }
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
            const textoDoModelo = data.candidates[0].content.parts[0].text;
            chatHistory.removeChild(loadingElement);
            adicionarMensagemAoHistorico(textoDoModelo, 'model');
        } else {
            console.error("API retornou um erro:", data);
            throw new Error("Resposta da API inválida ou contém um erro.");
        }

    } catch (error) {
        console.error("Erro ao chamar a API do Gemini:", error);
        chatHistory.removeChild(loadingElement);
        adicionarMensagemAoHistorico("Desculpe, não consegui processar sua pergunta. Verifique o console para detalhes do erro.", 'model');
    }
}


// Ouve o evento de "submit" do formulário
chatForm.addEventListener('submit', (event) => {
    event.preventDefault(); // <<< A LINHA MAIS IMPORTANTE! Impede o recarregamento da página.
    const userPrompt = chatInput.value.trim();
    if (userPrompt) {
        enviarMensagemParaGemini(userPrompt);
    }
});
