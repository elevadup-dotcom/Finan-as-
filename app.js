// Palavras-chave por categoria
const categorias = [
  { nome: "Alimentação", chaves: ["mercado", "super", "almoço", "janta", "restaurante"] },
  { nome: "Transporte", chaves: ["uber", "gasolina", "ônibus", "taxi"] },
  { nome: "Lazer", chaves: ["cinema", "bar", "show", "diversão"] },
  { nome: "Saúde", chaves: ["farmácia", "médico", "remédio", "hospital"] },
  { nome: "Despesas Fixas", chaves: ["aluguel", "luz", "água", "internet", "condomínio"] },
  { nome: "Receita", chaves: ["salário", "pagamento", "bônus"] },
];

const cores = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
  "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"
];

let dados = JSON.parse(localStorage.getItem("gastos")) || [];

function adicionar() {
  const texto = document.getElementById("entrada").value.trim().toLowerCase();
  
  if (!texto) {
    alert("Por favor, digite algo!");
    return;
  }

  const match = texto.match(/(\d+([.,]\d+)?)/);
  if (!match) {
    alert("Por favor, inclua um valor numérico!");
    return;
  }

  const valor = parseFloat(match[0].replace(",", "."));
  
  if (isNaN(valor) || valor <= 0) {
    alert("Valor inválido!");
    return;
  }

  const pessoa = texto.includes("nina") ? "Nina" : "Bruno";

  let categoria = "Outros";
  let tipo = "despesa";

  categorias.forEach(c => {
    c.chaves.forEach(p => {
      if (texto.includes(p)) {
        categoria = c.nome;
        if (c.nome === "Receita") tipo = "receita";
      }
    });
  });

  dados.push({
    texto: texto.charAt(0).toUpperCase() + texto.slice(1),
    valor,
    pessoa,
    categoria,
    tipo,
    data: new Date().toLocaleDateString("pt-BR")
  });

  salvar();
}

function salvar() {
  localStorage.setItem("gastos", JSON.stringify(dados));
  document.getElementById("entrada").value = "";
  renderizar();
}

function remover(i) {
  if (confirm("Tem certeza que deseja remover?")) {
    dados.splice(i, 1);
    salvar();
  }
}

function renderizar() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  let receitas = 0;
  let despesas = 0;
  const categoriasTotais = {};

  dados.forEach((d, i) => {
    if (d.tipo === "receita") receitas += d.valor;
    else despesas += d.valor;

    categoriasTotais[d.categoria] =
      (categoriasTotais[d.categoria] || 0) + d.valor;

    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${d.texto}</strong> - R$ ${d.valor.toFixed(2)}
        <small>${d.categoria} | ${d.pessoa} | ${d.data}</small>
      </div>
      <button onclick="remover(${i})">❌</button>
    `;
    lista.appendChild(li);
  });

  document.getElementById("totalReceitas").innerText = receitas.toFixed(2);
  document.getElementById("totalDespesas").innerText = despesas.toFixed(2);
  document.getElementById("saldo").innerText = (receitas - despesas).toFixed(2);

  desenharGrafico(categoriasTotais);
}

function desenharGrafico(dados) {
  const canvas = document.getElementById("grafico");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const valores = Object.values(dados);
  const total = valores.reduce((a, b) => a + b, 0);

  if (total === 0) return;

  let inicio = 0;
  const chaves = Object.keys(dados);
  
  chaves.forEach((cat, idx) => {
    const angulo = (dados[cat] / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(160, 100);
    ctx.arc(160, 100, 80, inicio, inicio + angulo);
    ctx.fillStyle = cores[idx % cores.length];
    ctx.fill();
    inicio += angulo;
  });
}

// Enter key support
document.addEventListener("DOMContentLoaded", () => {
  const entrada = document.getElementById("entrada");
  if (entrada) {
    entrada.addEventListener("keypress", (e) => {
      if (e.key === "Enter") adicionar();
    });
  }
  renderizar();
});
