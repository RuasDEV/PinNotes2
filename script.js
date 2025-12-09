const addNoteBtn = document.getElementById("addNoteBtn");
const container = document.getElementById("notesContainer");
const colorPickerModal = document.getElementById("colorPickerModal");
const closeColorPicker = document.getElementById("closeColorPicker");
const themeToggle = document.getElementById("themeToggle");
const textColorToggle = document.getElementById("textColorToggle");

let currentNoteForColor = null;
let lastColorIndex = -1;

const colors = [
  "#FFE5E5", "#FFD4E5", "#E5D4FF", "#D4E5FF",
  "#D4F5FF", "#D4FFE5", "#FFFFE5", "#FFEBE5",
  "#FFD9D9", "#FFB3D9", "#E5B3FF", "#B3D9FF",
  "#B3F0FF", "#B3FFD9", "#FFFDB3", "#FFD4B3"
];

// Carregar tema e cor de texto
function carregarConfiguracoes() {
  const temaSalvo = localStorage.getItem("pinnote-theme") || "light";
  const textColorSalva = localStorage.getItem("pinnote-text-color") || "black";
  
  if (temaSalvo === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("dark-mode");
    themeToggle.textContent = "🌙";
  }

  if (textColorSalva === "white") {
    document.body.classList.add("text-white");
    atualizarIconeTexto();
  }
}

// Toggle tema
function toggleTema() {
  document.body.classList.toggle("dark-mode");
  const temaCurrent = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("pinnote-theme", temaCurrent);
  
  // Atualizar ícone
  themeToggle.textContent = temaCurrent === "dark" ? "☀️" : "🌙";
}

// Toggle cor da fonte
function toggleTextColor() {
  document.body.classList.toggle("text-white");
  const textColorCurrent = document.body.classList.contains("text-white") ? "white" : "black";
  localStorage.setItem("pinnote-text-color", textColorCurrent);
  atualizarIconeTexto();
}

// Atualizar ícone de texto
function atualizarIconeTexto() {
  const isWhite = document.body.classList.contains("text-white");
  const icon = textColorToggle.querySelector(".text-color-icon");
  
  if (isWhite) {
    icon.style.color = "white";
    icon.textContent = "A";
    textColorToggle.title = "Mudar para preto";
  } else {
    icon.style.color = "#1d1d1f";
    icon.textContent = "A";
    textColorToggle.title = "Mudar para branco";
  }
}

// Gerar cor aleatória diferente da anterior
function gerarCorAleatoria() {
  let novoIndex;
  
  do {
    novoIndex = Math.floor(Math.random() * colors.length);
  } while (novoIndex === lastColorIndex && colors.length > 1);
  
  lastColorIndex = novoIndex;
  return novoIndex;
}

// Carregar notas salvas
function carregarNotas() {
  const notas = JSON.parse(localStorage.getItem("pinnote")) || [];
  notas.forEach(nota => criarNota(
    nota.texto || "", 
    nota.colorIndex || 6, 
    nota.width, 
    nota.height,
    nota.fontSize || 15,
    nota.posX,
    nota.posY
  ));
}

// Criar nova nota
function criarNota(texto = "", colorIndex = null, width = null, height = null, fontSize = 15, posX = null, posY = null) {
  // Se não especificar cor, gera uma aleatória
  if (colorIndex === null) {
    colorIndex = gerarCorAleatoria();
  } else {
    lastColorIndex = colorIndex;
  }

  const noteWrapper = document.createElement("div");
  noteWrapper.className = "note";
  noteWrapper.contentEditable = false;
  noteWrapper.setAttribute("data-bg", colorIndex);
  noteWrapper.setAttribute("data-font-size", fontSize);
  
  if (width) noteWrapper.style.width = width;
  if (height) noteWrapper.style.height = height;
  
  // Posicionamento absoluto
  noteWrapper.style.position = "absolute";
  
  if (posX !== null && posY !== null) {
    noteWrapper.style.left = posX;
    noteWrapper.style.top = posY;
  } else {
    // Posição inicial aleatória se não salva
    const randomLeft = Math.random() * 30 + 10;
    const randomTop = Math.random() * 20 + 5;
    noteWrapper.style.left = randomLeft + "%";
    noteWrapper.style.top = randomTop + "%";
  }

  // Header com botões
  const header = document.createElement("div");
  header.className = "note-header";
  header.style.cursor = "grab";

  // Botão de cor
  const btnCor = document.createElement("button");
  btnCor.className = "note-btn btn-color";
  btnCor.innerHTML = "🎨";
  btnCor.contentEditable = false;
  btnCor.title = "Alterar cor";

  btnCor.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    abrirColorPicker(noteWrapper, colorIndex);
  };

  // Botões de tamanho de fonte
  const fontControls = document.createElement("div");
  fontControls.className = "btn-font-controls";
  fontControls.contentEditable = false;

  const btnDecrease = document.createElement("button");
  btnDecrease.className = "font-btn";
  btnDecrease.innerHTML = "A−";
  btnDecrease.title = "Diminuir fonte";
  btnDecrease.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    alterarTamanhoFonte(noteWrapper, textContent, -1);
  };

  const btnIncrease = document.createElement("button");
  btnIncrease.className = "font-btn";
  btnIncrease.innerHTML = "A+";
  btnIncrease.title = "Aumentar fonte";
  btnIncrease.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    alterarTamanhoFonte(noteWrapper, textContent, 1);
  };

  fontControls.appendChild(btnDecrease);
  fontControls.appendChild(btnIncrease);

  // Botão de delete
  const btnDelete = document.createElement("button");
  btnDelete.className = "note-btn btn-delete";
  btnDelete.innerHTML = "✕";
  btnDelete.contentEditable = false;
  btnDelete.title = "Deletar nota";

  btnDelete.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Tem certeza que deseja deletar esta nota?")) {
      noteWrapper.remove();
      salvarNotas();
    }
  };

  const toolbar = document.createElement("div");
  toolbar.className = "note-toolbar";
  toolbar.contentEditable = false;
  toolbar.appendChild(btnCor);
  toolbar.appendChild(fontControls);
  toolbar.appendChild(btnDelete);

  header.appendChild(toolbar);

  // Conteúdo editável
  const textContent = document.createElement("div");
  textContent.className = "note-content";
  textContent.contentEditable = true;
  textContent.spellcheck = "true";
  textContent.innerText = texto;
  textContent.style.fontSize = fontSize + "px";

  // Handle de redimensionamento
  const resizeHandle = document.createElement("div");
  resizeHandle.className = "resize-handle";
  resizeHandle.contentEditable = false;

  // Funcionalidades
  textContent.oninput = () => salvarNotas();

  textContent.onpaste = (e) => {
    e.preventDefault();
    const texto = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, texto);
  };

  noteWrapper.appendChild(header);
  noteWrapper.appendChild(textContent);
  noteWrapper.appendChild(resizeHandle);

  // Redimensionamento
  implementarRedimensionamento(noteWrapper, resizeHandle);
  
  // Arrastagem
  implementarArrastagem(noteWrapper, header);

  container.appendChild(noteWrapper);
}

function implementarArrastagem(noteWrapper, header) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  header.addEventListener("mousedown", (e) => {
    // Não arrastaria se clicar em um botão
    if (e.target.tagName === "BUTTON") return;
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = noteWrapper.offsetLeft;
    startTop = noteWrapper.offsetTop;
    
    noteWrapper.style.zIndex = 1000;
    header.style.cursor = "grabbing";

    const onMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      noteWrapper.style.left = (startLeft + deltaX) + "px";
      noteWrapper.style.top = (startTop + deltaY) + "px";
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      header.style.cursor = "grab";
      noteWrapper.style.zIndex = "auto";
      salvarNotas();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    e.preventDefault();
  });

  // Touch support para mobile
  header.addEventListener("touchstart", (e) => {
    // Não arrastaria se clicar em um botão
    if (e.target.tagName === "BUTTON") return;
    
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startLeft = noteWrapper.offsetLeft;
    startTop = noteWrapper.offsetTop;
    
    noteWrapper.style.zIndex = 1000;

    const onTouchMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;
      
      noteWrapper.style.left = (startLeft + deltaX) + "px";
      noteWrapper.style.top = (startTop + deltaY) + "px";
    };

    const onTouchEnd = () => {
      isDragging = false;
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      noteWrapper.style.zIndex = "auto";
      salvarNotas();
    };

    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    e.preventDefault();
  });
}

function alterarTamanhoFonte(noteWrapper, textContent, delta) {
  let currentSize = parseInt(noteWrapper.getAttribute("data-font-size")) || 15;
  let newSize = Math.max(10, Math.min(32, currentSize + delta * 2));
  
  textContent.style.fontSize = newSize + "px";
  noteWrapper.setAttribute("data-font-size", newSize);
  salvarNotas();
}

function implementarRedimensionamento(noteWrapper, resizeHandle) {
  let isResizing = false;

  resizeHandle.addEventListener("mousedown", (e) => {
    isResizing = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = noteWrapper.offsetWidth;
    const startHeight = noteWrapper.offsetHeight;

    const onMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(280, startWidth + (e.clientX - startX));
      const newHeight = Math.max(300, startHeight + (e.clientY - startY));
      
      noteWrapper.style.width = newWidth + "px";
      noteWrapper.style.height = newHeight + "px";
    };

    const onMouseUp = () => {
      isResizing = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      salvarNotas();
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    e.preventDefault();
  });

  resizeHandle.addEventListener("touchstart", (e) => {
    isResizing = true;
    const startX = e.touches[0].clientX;
    const startY = e.touches[0].clientY;
    const startWidth = noteWrapper.offsetWidth;
    const startHeight = noteWrapper.offsetHeight;

    const onTouchMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(280, startWidth + (e.touches[0].clientX - startX));
      const newHeight = Math.max(300, startHeight + (e.touches[0].clientY - startY));
      
      noteWrapper.style.width = newWidth + "px";
      noteWrapper.style.height = newHeight + "px";
    };

    const onTouchEnd = () => {
      isResizing = false;
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      salvarNotas();
    };

    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
  });
}

function abrirColorPicker(noteWrapper, colorIndex) {
  currentNoteForColor = noteWrapper;
  colorPickerModal.classList.add("active");
  
  // Remover seleção anterior
  document.querySelectorAll(".color-option").forEach(el => {
    el.classList.remove("selected");
  });
  
  // Marcar cor atual
  document.querySelectorAll(".color-option").forEach((el, idx) => {
    if (idx === parseInt(noteWrapper.getAttribute("data-bg"))) {
      el.classList.add("selected");
    }
  });
}

function fecharColorPicker() {
  colorPickerModal.classList.remove("active");
  currentNoteForColor = null;
}

// Event listeners para color picker
document.querySelectorAll(".color-option").forEach((el, idx) => {
  el.onclick = () => {
    if (currentNoteForColor) {
      currentNoteForColor.setAttribute("data-bg", idx);
      lastColorIndex = idx;
      salvarNotas();
      fecharColorPicker();
    }
  };
});

closeColorPicker.onclick = fecharColorPicker;

colorPickerModal.onclick = (e) => {
  if (e.target === colorPickerModal) {
    fecharColorPicker();
  }
};

// Fechar com ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    fecharColorPicker();
  }
});

// Salvar notas
function salvarNotas() {
  const notas = [...document.querySelectorAll(".note")].map(n => {
    const texto = n.querySelector(".note-content").innerText.trim();
    const colorIndex = parseInt(n.getAttribute("data-bg")) || 6;
    const fontSize = parseInt(n.getAttribute("data-font-size")) || 15;
    const width = n.style.width || null;
    const height = n.style.height || null;
    const posX = n.style.left;
    const posY = n.style.top;
    
    return {
      texto,
      colorIndex,
      fontSize,
      width,
      height,
      posX,
      posY
    };
  }).filter(nota => nota.texto.length > 0);
  
  localStorage.setItem("pinnote", JSON.stringify(notas));
}

// Theme toggle
themeToggle.onclick = toggleTema;

// Text color toggle
textColorToggle.onclick = toggleTextColor;

// Botão adicionar
addNoteBtn.onclick = () => criarNota();

// Carregar ao iniciar
carregarConfiguracoes();
carregarNotas();
atualizarIconeTexto();