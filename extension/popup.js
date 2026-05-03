const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');

btnStart.addEventListener('click', () => {
    chrome.windows.create({
        url: 'http://localhost:8080/widget.html',
        type: 'popup',
        width: 400,
        height: 600,
        focused: false
    });
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