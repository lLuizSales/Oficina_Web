import asyncio
import websockets
import json
import time
from processor import VoskProcessor

MODEL_PATH = "./models/vosk-model-small-pt-0.3"
SAMPLE_RATE = 16000

def timestamp():
    return time.strftime("%H:%M:%S")

print(f"[{timestamp()}] Carregando modelo Vosk...")
engine = VoskProcessor(MODEL_PATH, SAMPLE_RATE)

async def handler(websocket):
    print(f"[{timestamp()}] Cliente conectado")

    try:
        async for message in websocket:
            # message = áudio em bytes vindo do navegador
            text, is_final = engine.process_chunk(message)

            if text:
                await websocket.send(json.dumps({
                    "text": text,
                    "final": is_final
                }))

    except websockets.exceptions.ConnectionClosed:
        print(f"[{timestamp()}] Cliente desconectado")

async def main():
    print(f"[{timestamp()}] Servidor rodando em ws://localhost:8765")

    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())