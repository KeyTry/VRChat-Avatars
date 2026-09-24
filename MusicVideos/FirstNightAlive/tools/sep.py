import torch, soundfile as sf, numpy as np, librosa, time
from demucs.pretrained import get_model
from demucs.apply import apply_model
torch.set_num_threads(4)
m = get_model('htdemucs'); m.eval()
y, sr = librosa.load('fna.mp3', sr=m.samplerate, mono=False)
wav = torch.tensor(y, dtype=torch.float32)
ref = wav.mean(0); wav = (wav - ref.mean())/ref.std()
t=time.time()
with torch.no_grad():
    out = apply_model(m, wav[None], device='cpu', split=True, overlap=0.1, progress=False)[0]
out = out*ref.std()+ref.mean()
print('sources', m.sources, time.time()-t)
for i,name in enumerate(m.sources):
    sf.write(f'stem_{name}.wav', out[i].numpy().T, m.samplerate, subtype='PCM_16')
