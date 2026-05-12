let audioContext;
let ws;
let mediaStream;
let processor;
let source;

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.target === 'offscreen') {
        if (message.type === 'PROCESSAR_AUDIO') {
            conectarVosk();
            capturarEProcessar(message.streamId);
        } else if (message.type === 'PARAR_AUDIO') {
            pararTudo();
        }
    }
});

function conectarVosk() {
    ws = new WebSocket('ws://localhost:8765');
    ws.onopen = () => console.log("Conectado ao Vosk!");
    ws.onmessage = (event) => {
        const resultado = JSON.parse(event.data);
        if (resultado.text) {
            if (resultado.final) {
                console.log("%c FINAL: " + resultado.text, "color: green; font-weight: bold; font-size: 14px;");
                 chrome.runtime.sendMessage({
                action: 'TEXTO_TRANSCRITO',
                text: resultado.text });
            } else {
                console.log("Parcial:", resultado.text);
            }
        }
    };
}

async function capturarEProcessar(streamId) {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } },
            video: false
        });

        audioContext = new AudioContext({ sampleRate: 16000 });
        audioContext.onstatechange = () => {
        if (audioContext.state === 'suspended') audioContext.resume();
        };
        source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(audioContext.destination);

        processor = audioContext.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                const inputData = e.inputBuffer.getChannelData(0);
                ws.send(convertFloat32ToInt16(inputData));
            }
        };
    } catch (error) {
        console.error('Erro na captura:', error);
    }
}

function pararTudo() {
    console.log("Parando captura e encerrando conexões...");

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
    }
    if (processor) {
        processor.disconnect();
        processor.onaudioprocess = null;
    }
    if (source) {
        source.disconnect();
    }
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
}

function convertFloat32ToInt16(buffer) {
    let l = buffer.length;
    let buf = new Int16Array(l);
    while (l--) {
        let s = Math.max(-1, Math.min(1, buffer[l]));
        buf[l] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return buf.buffer;
}
