let tipoVeiculo = "carros";
const getBaseUrl = () => `https://parallelum.com.br/fipe/api/v1/${tipoVeiculo}`;

const marcaInput = document.getElementById("marcaInput");
const modeloInput = document.getElementById("modeloInput");
const marcaSugestoes = document.getElementById("marcaSugestoes");
const modeloSugestoes = document.getElementById("modeloSugestoes");
const anoSelect = document.getElementById("ano");
const buscarBtn = document.getElementById("buscar");
const resultadoDiv = document.getElementById("resultado");

let marcas = [], marcasDict = {};
let modelos = [], modelosDict = {};

function carregarMarcas() {
  fetch(`${getBaseUrl()}/marcas`)
    .then(res => res.json())
    .then(data => {
      marcas = data.map(m => m.nome);
      marcasDict = {};
      data.forEach(m => marcasDict[m.nome] = m.codigo);
    });
}
carregarMarcas();

document.querySelectorAll('input[name="tipoVeiculo"]').forEach(input => {
  input.addEventListener("change", () => {
    tipoVeiculo = input.value;
    marcaInput.value = "";
    modeloInput.value = "";
    modeloInput.disabled = true;
    anoSelect.disabled = true;
    buscarBtn.disabled = true;
    resultadoDiv.innerHTML = "";
    carregarMarcas();
  });
});

marcaInput.addEventListener("input", () => {
  const valor = marcaInput.value.toLowerCase();
  marcaSugestoes.innerHTML = "";
  modeloInput.value = "";
  modeloInput.disabled = true;
  anoSelect.disabled = true;
  buscarBtn.disabled = true;
  resultadoDiv.innerHTML = "";

  if (!valor) {
    marcaSugestoes.style.display = "none";
    return;
  }

  const resultados = marcas.filter(m => m.toLowerCase().includes(valor)).slice(0, 10);
  resultados.forEach(m => {
    const li = document.createElement("li");
    li.textContent = m;
    li.addEventListener("click", () => {
      marcaInput.value = m;
      marcaSugestoes.innerHTML = "";
      marcaSugestoes.style.display = "none";
      buscarModelos(marcasDict[m]);
    });
    marcaSugestoes.appendChild(li);
  });
  marcaSugestoes.style.display = resultados.length ? "block" : "none";
});

marcaInput.addEventListener("focus", () => {
  marcaSugestoes.innerHTML = "";
  const resultados = marcas.slice(0, 10);
  resultados.forEach(m => {
    const li = document.createElement("li");
    li.textContent = m;
    li.addEventListener("click", () => {
      marcaInput.value = m;
      marcaSugestoes.innerHTML = "";
      marcaSugestoes.style.display = "none";
      buscarModelos(marcasDict[m]);
    });
    marcaSugestoes.appendChild(li);
  });
  marcaSugestoes.style.display = resultados.length ? "block" : "none";
});

document.addEventListener("click", e => {
  if (!marcaInput.contains(e.target)) marcaSugestoes.style.display = "none";
  if (!modeloInput.contains(e.target)) modeloSugestoes.style.display = "none";
});

function buscarModelos(marcaCodigo) {
  fetch(`${getBaseUrl()}/marcas/${marcaCodigo}/modelos`)
    .then(res => res.json())
    .then(data => {
      modelos = data.modelos.map(m => m.nome);
      modelosDict = {};
      data.modelos.forEach(m => modelosDict[m.nome] = m.codigo);
      modeloInput.disabled = false;
    });
}

modeloInput.addEventListener("input", () => {
  const valor = modeloInput.value.toLowerCase();
  modeloSugestoes.innerHTML = "";
  anoSelect.disabled = true;
  buscarBtn.disabled = true;
  resultadoDiv.innerHTML = "";

  if (!valor) {
    modeloSugestoes.style.display = "none";
    return;
  }

  const resultados = modelos.filter(m => m.toLowerCase().includes(valor)).slice(0, 10);
  resultados.forEach(m => {
    const li = document.createElement("li");
    li.textContent = m;
    li.addEventListener("click", () => {
      modeloInput.value = m;
      modeloSugestoes.innerHTML = "";
      modeloSugestoes.style.display = "none";
      buscarAnos(marcasDict[marcaInput.value], modelosDict[m]);
    });
    modeloSugestoes.appendChild(li);
  });
  modeloSugestoes.style.display = resultados.length ? "block" : "none";
});

modeloInput.addEventListener("focus", () => {
  if (modeloInput.disabled || modelos.length === 0) return;

  modeloSugestoes.innerHTML = "";
  const resultados = modelos.slice(0, 10);
  resultados.forEach(m => {
    const li = document.createElement("li");
    li.textContent = m;
    li.addEventListener("click", () => {
      modeloInput.value = m;
      modeloSugestoes.innerHTML = "";
      modeloSugestoes.style.display = "none";
      buscarAnos(marcasDict[marcaInput.value], modelosDict[m]);
    });
    modeloSugestoes.appendChild(li);
  });
  modeloSugestoes.style.display = resultados.length ? "block" : "none";
});

function buscarAnos(marcaCodigo, modeloCodigo) {
  fetch(`${getBaseUrl()}/marcas/${marcaCodigo}/modelos/${modeloCodigo}/anos`)
    .then(res => res.json())
    .then(anos => {
      anoSelect.innerHTML = `<option value="">Selecione</option>`;
      anos.forEach(ano => {
        const opt = document.createElement("option");
        opt.value = ano.codigo;
        opt.textContent = ano.nome.includes("32000") ? "Zero KM (ano atual de referência)" : ano.nome.split(" ")[0];
        anoSelect.appendChild(opt);
      });
      anoSelect.disabled = false;
    });
}

anoSelect.addEventListener("change", () => {
  buscarBtn.disabled = !anoSelect.value;
});

buscarBtn.addEventListener("click", () => {
  const marcaCodigo = marcasDict[marcaInput.value];
  const modeloCodigo = modelosDict[modeloInput.value];
  const anoCodigo = anoSelect.value;

  fetch(`${getBaseUrl()}/marcas/${marcaCodigo}/modelos/${modeloCodigo}/anos/${anoCodigo}`)
    .then(res => res.json())
    .then(dados => {
      if (dados.Valor) {
        resultadoDiv.innerHTML = `
          <strong>📄 Informações da Tabela FIPE:</strong><br><br>
          🛠 Marca: ${dados.Marca}<br>
          🚘 Modelo: ${dados.Modelo}<br>
          📅 Ano Modelo: ${dados.AnoModelo}<br>
          🗓 Mês Referência: ${dados.MesReferencia}<br>
          💰 Valor FIPE: <strong style="color: green;">${dados.Valor}</strong>
        `;
      } else {
        resultadoDiv.innerHTML = `<span style="color:red;">❌ Não foi possível obter os dados da FIPE.</span>`;
      }
    });
});
