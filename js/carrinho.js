const botoesAdicionarAoCarrinho = document.querySelectorAll(".adicionar-ao-carrinho");

botoesAdicionarAoCarrinho.forEach(botao => {
    botao.addEventListener("click", (evento) => {
        
        const elementoProduto = evento.target.closest(".produto");
        const produtoId = elementoProduto.dataset.id;
        const produtoNome = elementoProduto.querySelector(".nome").textContent;
        const produtoImagem = elementoProduto.querySelector("img").getAttribute("src");
        const produtoPreco = parseFloat(elementoProduto.querySelector(".preco").textContent.replace("R$ ", "").replace(".", "").replace(",", "."));

        console.log(produtoPreco);
    });
});
