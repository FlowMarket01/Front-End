const caixasRanking = [
  { identificacao: "Caixa 1", minutosEmCheio: 96 },
  { identificacao: "Caixa 2", minutosEmCheio: 141 },
  { identificacao: "Caixa 3", minutosEmCheio: 48 },
  { identificacao: "Caixa 4", minutosEmCheio: 24 },
  { identificacao: "Caixa 5", minutosEmCheio: 12 },
];

const caixaSeries = {
  "Caixa 1": [
    0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0,
  ],
  "Caixa 2": [
    0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1,
  ],
  "Caixa 3": [
    0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 0,
  ],
  "Caixa 4": [
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 0,
  ],
  "Caixa 5": [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0,
  ],
};

const estadosFila = ["Vazio", "Moderado", "Cheio"];
const horas = Array.from({ length: 24 }, (_, hora) =>
  String(hora).padStart(2, "0") + "h",
);
const sltPeriodo = document.getElementById("sltPeriodo");
const sltCaixas = document.getElementById("sltCaixas");
const tooltipMarca = {
  backgroundColor: "#0F4C3A",
  titleFont: { family: "'Poppins', sans-serif", weight: 600, size: 12 },
  bodyFont: { family: "'Poppins', sans-serif", weight: 400, size: 12 },
  padding: 10,
  cornerRadius: 8,
  displayColors: false,
};
const escalaContagem = {
  beginAtZero: true,
  ticks: { precision: 0 },
  grid: { color: "rgba(15, 76, 58, 0.08)" },
  border: { display: false },
};
const escalaCategorica = {
  grid: { display: false },
  border: { display: false },
};

function gerarRotulosPeriodo(dias) {
  if (dias === 1) return horas;

  const data = new Date();
  data.setHours(0, 0, 0, 0);
  data.setDate(data.getDate() - dias + 1);

  const rotulos = [];
  for (let dia = 0; dia < dias; dia++) {
    for (let hora = 0; hora < 24; hora++) {
      rotulos.push(
        String(data.getDate()).padStart(2, "0") +
          "/" +
          String(data.getMonth() + 1).padStart(2, "0") +
          " " +
          String(hora).padStart(2, "0") +
          "h",
      );
    }
    data.setDate(data.getDate() + 1);
  }
  return rotulos;
}

function repetirSerieDiaria(serie, dias) {
  return Array.from({ length: dias }, () => serie).flat();
}

caixasRanking.forEach((caixa) => {
  sltCaixas.add(new Option(caixa.identificacao, caixa.identificacao));
});

const graficoBarraCaixa = new Chart(
  document.getElementById("graficoBarraCaixaMaiorTempo"),
  {
    type: "bar",
    data: {
      labels: caixasRanking.map((caixa) => caixa.identificacao),
      datasets: [
        {
          data: caixasRanking.map((caixa) => caixa.minutosEmCheio),
          backgroundColor: "#0F4C3A",
          borderRadius: { topLeft: 6, topRight: 6 },
          maxBarThickness: 42,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: tooltipMarca,
      },
      scales: { x: escalaCategorica, y: escalaContagem },
    },
  },
);

const graficoLinhaCaixa = new Chart(
  document.getElementById("graficoLinhaCaixaPicoOcupacao"),
  {
    type: "line",
    data: {
      labels: horas,
      datasets: [
        {
          data: caixaSeries["Caixa 1"],
          borderColor: "#6AAE48",
          backgroundColor: "rgba(106, 174, 72, 0.10)",
          borderWidth: 2,
          fill: true,
          stepped: true,
          pointRadius: 0,
          pointHitRadius: 12,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: Object.assign({}, tooltipMarca, {
          callbacks: {
            label: (contexto) => " Estado: " + estadosFila[contexto.parsed.y],
          },
        }),
      },
      scales: {
        x: escalaCategorica,
        y: {
          min: 0,
          max: 2,
          ticks: {
            callback: (valor) => estadosFila[valor],
          },
          border: { display: false },
        },
      },
    },
  },
);

sltCaixas.addEventListener("change", () => {
  const dias = Number(sltPeriodo.value);
  graficoLinhaCaixa.data.datasets[0].data = repetirSerieDiaria(
    caixaSeries[sltCaixas.value],
    dias,
  );
  graficoLinhaCaixa.update();
});

function atualizarPeriodo() {
  const dias = Number(sltPeriodo.value);
  const periodoComPreposicao =
    dias === 1 ? "nas últimas 24 horas" : "nos últimos " + dias + " dias";

  document.getElementById("tituloPeriodo").textContent =
    "Filas dos caixas - " +
    (dias === 1 ? "últimas 24 horas" : "últimos " + dias + " dias");
  document.getElementById("descricaoCaixaTempo").textContent =
    'Minutos acumulados no estado "cheio" ' + periodoComPreposicao + ".";
  document.getElementById("descricaoCaixaOcupacao").textContent =
    "Estado da fila por hora - vazio, moderado ou cheio, " +
    periodoComPreposicao +
    ". Escolha o caixa para atualizar.";
  document.getElementById("h3_tempoTotalFilaCheia").textContent =
    "Tempo total em fila cheia " + periodoComPreposicao;

  graficoBarraCaixa.data.datasets[0].data = caixasRanking.map(
    (caixa) => caixa.minutosEmCheio * dias,
  );
  graficoLinhaCaixa.data.labels = gerarRotulosPeriodo(dias);
  graficoLinhaCaixa.data.datasets[0].data = repetirSerieDiaria(
    caixaSeries[sltCaixas.value],
    dias,
  );
  graficoBarraCaixa.update();
  graficoLinhaCaixa.update();
}

sltPeriodo.addEventListener("change", atualizarPeriodo);

function redirecionar() {
  sltCaixas.value = "Caixa 3"
  atualizarPeriodo()
}