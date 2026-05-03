let widgetTabId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "INICIAR_CAPTURA") {
        iniciarCapturaDaAba();  // removeu o abrirWidget() daqui
    } else if (request.action === "PARAR_CAPTURA") {
        pararCaptura();
    }
});
async function iniciarCapturaDaAba() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const offscreenUrl = chrome.runtime.getURL('offscreen.html');
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl]
    });

    if (existingContexts.length === 0) {
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['USER_MEDIA'],
            justification: 'Capturar áudio do YouTube para transcrição via Vosk'
        });
    }

    chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, (streamId) => {
        chrome.runtime.sendMessage({
            target: 'offscreen',
            type: 'PROCESSAR_AUDIO',
            streamId: streamId
        });
    });
}

async function pararCaptura() {
    chrome.runtime.sendMessage({
        target: 'offscreen',
        type: 'PARAR_AUDIO'
    });

    setTimeout(async () => {
        const existingContexts = await chrome.runtime.getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT']
        });
        if (existingContexts.length > 0) {
            await chrome.offscreen.closeDocument();
        }
    }, 500);
}
