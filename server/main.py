import queue
import sys
import time
import sounddevice as sd
from processor import VoskProcessor

MODEL_PATH   = "./models/vosk-model-small-pt-0.3"
SAMPLE_RATE  = 16000
CHANNELS     = 1

def timestamp():
    return time.strftime("%H:%M:%S")

##TODO No momento o main.py é apenas para capturar o audio do microfone e mandar pra a IA. Eventualmente precisa ser um websocket que receba o audio do navegador e mande o texto de volta para o navegador

def main():
    print(f"[{timestamp()}] Carregando modelo Vosk...")
    engine = VoskProcessor(MODEL_PATH, SAMPLE_RATE)
    
    audio_queue = queue.Queue()

    def callback(indata, frames, time_info, status):
        """Callback chamada a cada novo bloco de áudio do microfone"""
        if status:
            print(status, file=sys.stderr)
        audio_queue.put(bytes(indata))

    print(f"[{timestamp()}] Microfone ativo. Pode falar (pt-BR)...")
    print("-" * 50)

    try:
        with sd.RawInputStream(samplerate=SAMPLE_RATE, 
                               blocksize=4000, 
                               device=None,    
                               dtype='int16',
                               channels=CHANNELS, 
                               callback=callback):
            
            while True:
                data = audio_queue.get()
                
                text, is_final = engine.process_chunk(data)
                
                if text:
                    if is_final:
                        print(f"\r\033[K[{timestamp()}] ✔ {text}")
                    else:
                        print(f"\r\033[K\033[2m[{timestamp()}] … {text}\033[0m", end="", flush=True)

    except KeyboardInterrupt:
        final_text = engine.get_final()
        if final_text:
            print(f"\r\033[K[{timestamp()}] ✔ {final_text}")
        print(f"\n[{timestamp()}] Encerrado pelo usuário.")
    except Exception as e:
        print(f"\nErro inesperado: {e}")

if __name__ == "__main__":
    main()