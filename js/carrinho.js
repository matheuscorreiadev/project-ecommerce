// --- SELETORES ---
const botoesAdicionarAoCarrinho = document.querySelectorAll(".adicionar-ao-carrinho");
const corpoTabela = document.querySelector("#modal-1-content table tbody");
const btnCalcularFrete = document.getElementById('btn-calcular-frete');
const inputCep = document.getElementById('input-cep');
const valorFreteElemento = document.getElementById('valor-frete');
const totalCarrinhoElemento = document.querySelector("#total-carrinho");
// Novo seletor para o botão de finalizar
const btnFinalizarCompra = document.querySelector(".finalizar-compra");

// Variável para armazenar o valor do frete globalmente
let freteGlobal = 0;

// --- EVENTOS ---

// 1. Adicionar ao Carrinho
botoesAdicionarAoCarrinho.forEach(botao => {
    botao.addEventListener("click", (evento) => {
        const elementoProduto = evento.target.closest(".produto");
        const produtoId = elementoProduto.dataset.id;
        const produtoNome = elementoProduto.querySelector(".nome").textContent;
        const produtoImagem = elementoProduto.querySelector("img").getAttribute("src");
        const produtoPreco = parseFloat(elementoProduto.querySelector(".preco").textContent.replace("R$ ", "").replace(".", "").replace(",", "."));

        const carrinho = obterProdutosDoCarrinho();
        const existeProduto = carrinho.find(p => p.id === produtoId);

        if (existeProduto) {
            existeProduto.quantidade += 1;
        } else {
            carrinho.push({
                id: produtoId,
                nome: produtoNome,
                imagem: produtoImagem,
                preco: produtoPreco,
                quantidade: 1,
            });
        }

        salvarProdutosNoCarrinho(carrinho);
        atualizarCarrinhoETabela();
    });
});

// 2. Calcular Frete
if (btnCalcularFrete) {
    btnCalcularFrete.addEventListener('click', async () => {
        const cep = inputCep.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            alert("CEP inválido!");
            return;
        }

        valorFreteElemento.textContent = 'Calculando...';
        
        const resultado = await buscarFrete(cep);

        if (resultado) {
            freteGlobal = resultado.valor;
            valorFreteElemento.innerHTML = `Frete para ${resultado.cidade}: <strong>R$ ${freteGlobal.toFixed(2).replace(".", ",")}</strong>`;
            atualizarValorTotalCarrinho();
        } else {
            valorFreteElemento.textContent = 'CEP não encontrado.';
            freteGlobal = 0;
            atualizarValorTotalCarrinho();
        }
    });
}

// 3. Finalizar Compra (A lógica que você pediu)
if (btnFinalizarCompra) {
    btnFinalizarCompra.addEventListener("click", () => {
        const carrinho = obterProdutosDoCarrinho();

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio! Adicione produtos antes de finalizar.");
            return;
        }

        // Exibe a mensagem de sucesso
        alert("🎉 Compra finalizada com sucesso! Obrigado pela preferência.");

        // Limpa o carrinho
        localStorage.removeItem("carrinho");
        freteGlobal = 0; // Reseta o frete
        if(inputCep) inputCep.value = ""; // Limpa campo de CEP
        if(valorFreteElemento) valorFreteElemento.textContent = "";

        // Atualiza a interface
        atualizarCarrinhoETabela();
    });
}

// --- FUNÇÕES CORE ---

async function buscarFrete(cep) {
    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await resposta.json();
        if (dados.erro) return null;

        let valor = 0;
        const uf = dados.uf;

        if (uf === 'SP') valor = 12.00;
        else if (['RJ', 'MG', 'ES'].includes(uf)) valor = 20.00;
        else valor = 35.00;

        return { valor, cidade: dados.localidade };
    } catch (e) {
        return null;
    }
}

function atualizarValorTotalCarrinho() {
    const produtos = obterProdutosDoCarrinho();
    const subtotal = produtos.reduce((acc, p) => acc + (p.preco * p.quantidade), 0);
    const totalComFrete = subtotal + freteGlobal;

    if (totalCarrinhoElemento) {
        totalCarrinhoElemento.innerHTML = `
            <div class="resumo-total">
                <p><small>Subtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}</small></p>
                ${freteGlobal > 0 ? `<p><small>Frete: R$ ${freteGlobal.toFixed(2).replace(".", ",")}</small></p>` : ''}
                <h3>Total: R$ ${totalComFrete.toFixed(2).replace(".", ",")}</h3>
            </div>
        `;
    }
}

// --- UTILITÁRIOS ---

function salvarProdutosNoCarrinho(carrinho) {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function obterProdutosDoCarrinho() {
    const produtos = localStorage.getItem("carrinho");
    return produtos ? JSON.parse(produtos) : [];
}

function renderizarTabelaDoCarrinho() {
    if (!corpoTabela) return;
    const produtos = obterProdutosDoCarrinho();
    corpoTabela.innerHTML = "";
    
    produtos.forEach(produto => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${produto.imagem}" width="50" /></td>
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2).replace(".", ",")}</td>
            <td>
                <input type="number" class="input-quantidade" data-id="${produto.id}" value="${produto.quantidade}" min="1" />
            </td>
            <td>R$ ${(produto.preco * produto.quantidade).toFixed(2).replace(".", ",")}</td>
            <td><button class="btn-remover" data-id="${produto.id}"></button></td>`;
        corpoTabela.appendChild(tr);
    });
}

function atualizarContadorCarrinho() {
    const produtos = obterProdutosDoCarrinho();
    const total = produtos.reduce((acc, p) => acc + p.quantidade, 0);
    const contador = document.getElementById("contador-carrinho");
    if(contador) contador.textContent = total;
}

function atualizarCarrinhoETabela() {
    atualizarContadorCarrinho();
    renderizarTabelaDoCarrinho();
    atualizarValorTotalCarrinho();
}

// Delegação de eventos
if (corpoTabela) {
    corpoTabela.addEventListener("click", e => {
        if (e.target.classList.contains("btn-remover")) {
            const produtos = obterProdutosDoCarrinho().filter(p => p.id !== e.target.dataset.id);
            salvarProdutosNoCarrinho(produtos);
            atualizarCarrinhoETabela();
        }
    });

    corpoTabela.addEventListener("input", e => {
        if (e.target.classList.contains("input-quantidade")) {
            const produtos = obterProdutosDoCarrinho();
            const p = produtos.find(item => item.id === e.target.dataset.id);
            if (p) p.quantidade = parseInt(e.target.value) || 1;
            salvarProdutosNoCarrinho(produtos);
            atualizarCarrinhoETabela();
        }
    });
}

// Inicia a página
atualizarCarrinhoETabela();