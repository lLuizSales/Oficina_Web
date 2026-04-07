import os
import sys
import json
import vosk

class VoskProcessor:
    def __init__(self, model_path, sample_rate=16000):
        """
        Inicializa o modelo Vosk.
        :param model_path: Caminho para a pasta do modelo pt-BR
        :param sample_rate: Taxa de amostragem (padrão 16000Hz)
        """
        if not os.path.exists(model_path):
            print(f"ERRO: Modelo não encontrado em '{model_path}'")
            print("Baixe em: https://alphacephei.com/vosk/models")
            sys.exit(1)

        vosk.SetLogLevel(-1)
        
        self.model = vosk.Model(model_path)
        self.rec = vosk.KaldiRecognizer(self.model, sample_rate)
        self.rec.SetWords(True)

    def process_chunk(self, byte_data):
        """
        Recebe um chunk de áudio e retorna (texto, eh_final)
        """
        if self.rec.AcceptWaveform(byte_data):
            result = json.loads(self.rec.Result())
            return result.get("text", ""), True
        else:
            partial = json.loads(self.rec.PartialResult())
            return partial.get("partial", ""), False

    def get_final(self):
        """
        Retorna o último pedaço de texto processado ao fechar o stream
        """
        result = json.loads(self.rec.FinalResult())
        return result.get("text", "")