const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');

btnStart.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "INICIAR_CAPTURA" });
    btnStart.innerText = "Ouvindo...";
    btnStart.disabled = true;
    btnStop.disabled = false;
});

btnStop.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "PARAR_CAPTURA" });
    btnStart.innerText = "Ouvir Vídeo";
    btnStart.disabled = false;
    btnStop.disabled = true;
});