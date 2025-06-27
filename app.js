// Configuração do Firebase (a sua deve estar aqui)
const firebaseConfig = {
    apiKey: "AIzaSyCKlzyEbhEWVKLAD-c_DUwMr5yt3RusgxI",
    authDomain: "meu-progresso-dev.firebaseapp.com",
    projectId: "meu-progresso-dev",
    storageBucket: "meu-progresso-dev.firebasestorage.app",
    messagingSenderId: "1057983047883",
    appId: "1:1057983047883:web:4336da0fc1539685b4134e"
};

// Inicialização e referências
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("Firebase conectado e pronto para usar!");

// Seleção de Elementos
const idInput = document.querySelector('#firestore-id');
const carregarBtn = document.querySelector('#carregar-progresso-btn');
const displayNivel = document.querySelector('#display-nivel');
const displayXp = document.querySelector('#display-xp');
const badgesContainer = document.querySelector('#badges-container');
const actionButtons = document.querySelectorAll('.action-btn');

let progressoAtual = {};
let docIdAtual = '';

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