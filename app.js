// Configuração do Firebase (a sua deve estar aqui)
// A configuração foi movida para o arquivo config.js

// Adicione no topo do app.js
const ROTEIRO_APRENDIZAGEM = [
    { nome: "1. Fundamentos da Web", topicos: ["HTML", "CSS", "JavaScript Básico", "DOM Manipulation"] },
    { nome: "2. Ferramentas Essenciais", topicos: ["Git e Controle de Versão", "GitHub (Pull Requests, Issues)"] },
    { nome: "3. Programação Avançada", topicos: ["Estruturas de Dados", "Algoritmos", "Padrões de Projeto"] },
    { nome: "4. Ecossistema React", topicos: ["Fundamentos do React", "Hooks", "Gerenciamento de Estado"] },
    { nome: "5. React Native", topicos: ["Componentes Nativos", "Navegação", "APIs Nativas"] },
    { nome: "6. Publicação", topicos: ["Build e Assinatura", "Google Play Console", "App Store Connect"] }
];

// O resto do seu código app.js começa aqui...
// const firebaseConfig = ... (se estiver aqui) ou a inicialização do Firebase

// Inicialização e referências
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("Firebase conectado e pronto para usar!");

// Seleção de Elementos
const roteiroContainer = document.querySelector('#roteiro-container'); // << Novo Seletor
const idInput = document.querySelector('#firestore-id');
const carregarBtn = document.querySelector('#carregar-progresso-btn');
const displayNivel = document.querySelector('#display-nivel');
const displayXp = document.querySelector('#display-xp');
const badgesContainer = document.querySelector('#badges-container');
const actionButtons = document.querySelectorAll('.action-btn');
const ajudaBtn = document.querySelector('#btn-ajuda'); // << ADICIONE ESTA LINHA

let progressoAtual = {};
let docIdAtual = '';

// --- NOVA FUNÇÃO PARA RENDERIZAR O ROTEIRO ---
function renderizarRoteiro(dados) {
    roteiroContainer.innerHTML = ''; // Limpa o container
    
    const moduloAtualNome = dados.modulo_atual;
    const topicosConcluidos = dados.topicos_concluidos || [];
    
    const indiceModuloAtual = ROTEIRO_APRENDIZAGEM.findIndex(m => m.nome === moduloAtualNome);

    ROTEIRO_APRENDIZAGEM.forEach((modulo, index) => {
        const moduloElement = document.createElement('div');
        let classeModulo = 'modulo-item';
        let conteudoExtra = '';

        if (index < indiceModuloAtual) {
            classeModulo += ' modulo-concluido';
            conteudoExtra = '<span>✔</span>';
        } else if (index === indiceModuloAtual) {
            classeModulo += ' modulo-atual';
            const topicosDoModulo = modulo.topicos;
            const topicosConcluidosNesteModulo = topicosConcluidos.filter(t => topicosDoModulo.includes(t)).length;
            const percentual = (topicosDoModulo.length > 0) ? (topicosConcluidosNesteModulo / topicosDoModulo.length) * 100 : 0;
            
            conteudoExtra = `
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${percentual}%;"></div>
                </div>
            `;
        } else {
            classeModulo += ' modulo-futuro';
        }
        
        moduloElement.className = classeModulo;
        moduloElement.innerHTML = `<span>${modulo.nome}</span>${conteudoExtra}`;
        roteiroContainer.appendChild(moduloElement);
    });
}


// Função para exibir os dados no painel principal (Nível e XP)
function exibirProgresso(dados) {
    // ... (código existente desta função) ...
}

// Evento do botão Carregar Progresso (ATUALIZADO)
carregarBtn.addEventListener('click', function() {
    docIdAtual = idInput.value;
    if (!docIdAtual) { return; }

    db.collection('progresso_alunos').doc(docIdAtual).get()
        .then(doc => {
            if (doc.exists) {
                const dados = doc.data();
                exibirProgresso(dados); // Função antiga para Nível/XP
                renderizarRoteiro(dados); // <<-- CHAMAMOS A NOVA FUNÇÃO AQUI
                verificarEConcederMedalhas(dados);
            } else { /* ... */ }
        })
        .catch(error => { /* ... */ });
});

// ... (Resto do seu código: actionButtons.forEach, ajudaBtn.addEventListener) ...


// *** NOVA FUNÇÃO PARA VERIFICAR E CONCEDER MEDALHAS ***
function verificarEConcederMedalhas(dados) {
    const moduloAtual = dados.modulo_atual;
    const conquistas = dados.conquistas || []; // Garante que conquistas seja um array
    let novasConquistas = [];

    // Regra da Medalha: 'Primeiros Passos'
    if (moduloAtual !== "1. Fundamentos da Web" && !conquistas.includes('Primeiros Passos')) {
        novasConquistas.push('Primeiros Passos');
    }

    // Se houver novas conquistas para adicionar...
    if (novasConquistas.length > 0) {
        const conquistasAtualizadas = [...conquistas, ...novasConquistas];
        db.collection('progresso_alunos').doc(docIdAtual).update({
            conquistas: conquistasAtualizadas
        })
        .then(() => {
            console.log("Novas medalhas concedidas:", novasConquistas);
            progressoAtual.conquistas = conquistasAtualizadas; // Atualiza nosso estado local
            exibirProgresso(progressoAtual); // Re-renderiza a tela para mostrar a nova medalha
        });
    }
}


// Função para exibir os dados na tela (ATUALIZADA)
function exibirProgresso(dados) {
    progressoAtual = dados;
    displayNivel.innerText = dados.nivel;
    displayXp.innerText = dados.pontos_xp;
    
    badgesContainer.innerHTML = '';
    const conquistas = dados.conquistas || []; // Garante que é um array
    if (conquistas.length > 0) {
        conquistas.forEach(conquistaNome => {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'badge';
            badgeElement.title = conquistaNome;
            // Mostra a primeira letra de cada palavra da conquista
            const iniciais = conquistaNome.split(' ').map(palavra => palavra[0]).join('');
            badgeElement.innerText = iniciais;
            badgesContainer.appendChild(badgeElement);
        });
    } else {
        badgesContainer.innerText = "Nenhuma medalha ainda. Continue assim!";
    }
}

// Evento do botão Carregar Progresso (ATUALIZADO)
carregarBtn.addEventListener('click', function() {
    docIdAtual = idInput.value; // Salva o ID atual para uso global
    if (!docIdAtual) {
        alert('Por favor, insira seu ID do Documento.');
        return;
    }

    db.collection('progresso_alunos').doc(docIdAtual).get()
        .then(doc => {
            if (doc.exists) {
                const dados = doc.data();
                exibirProgresso(dados);
                verificarEConcederMedalhas(dados); // <<-- CHAMAMOS A NOVA FUNÇÃO AQUI
            } else {
                alert("Nenhum progresso encontrado com o ID fornecido.");
            }
        })
        .catch(error => {
            console.error("Erro ao buscar documento: ", error);
            alert("Ocorreu um erro ao buscar os dados.");
        });
});

// Adicionar evento para CADA botão de ação
actionButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (!docIdAtual) {
            alert('Primeiro carregue seu progresso inserindo o ID.');
            return;
        }
        const xpGanhos = parseInt(button.dataset.xp);
        const novoXp = progressoAtual.pontos_xp + xpGanhos;
        
        db.collection('progresso_alunos').doc(docIdAtual).update({
            pontos_xp: novoXp
        })
        .then(() => {
            console.log("XP atualizado com sucesso!");
            progressoAtual.pontos_xp = novoXp;
            exibirProgresso(progressoAtual);
        })
        .catch(error => {
            console.error("Erro ao atualizar XP: ", error);
        });
        
    });

 });

// --- Lógica para o novo botão de ajuda ---
ajudaBtn.addEventListener('click', function() {
    alert(
          'Bem-vindo ao Painel de Progresso!\n\n' +
          '1. Cole o ID do seu documento do Firestore e clique em "Carregar Progresso".\n' +
          '2. Use os botões de ação para registrar as tarefas concluídas e ganhar XP.\n' +
          '3. Seu progresso é salvo automaticamente no Firestore a cada ação.'
          );
});
