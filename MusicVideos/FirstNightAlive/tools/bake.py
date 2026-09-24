import librosa, numpy as np, json, base64
sr=22050; fps=30; hop=sr//fps  # 735
def load(p): return librosa.load(p, sr=sr, mono=True)[0]
mix=load('fna.mp3'); dr=load('stem_drums.wav'); ba=load('stem_bass.wav'); vo=load('stem_vocals.wav'); ot=load('stem_other.wav')
n=int(np.ceil(len(mix)/hop))
def rmsdb(x):
    r=librosa.feature.rms(y=x,frame_length=2048,hop_length=hop,center=True)[0][:n]
    return 20*np.log10(r+1e-7)
def banddb(x,lo,hi):
    S=np.abs(librosa.stft(x,n_fft=2048,hop_length=hop,center=True))[:, :n]
    f=librosa.fft_frequencies(sr=sr,n_fft=2048)
    e=(S[(f>=lo)&(f<hi)]**2).mean(0)
    return 10*np.log10(e+1e-12)
chs=[rmsdb(mix), rmsdb(ba), rmsdb(dr), banddb(dr,2000,11000), rmsdb(vo), rmsdb(ot), banddb(mix,5000,11000), banddb(mix,20,150)]
floors=[None,None,None,None,-50,None,None,None]
out=np.zeros((n,len(chs)),dtype=np.uint8)
for i,c in enumerate(chs):
    c=np.pad(c,(0,max(0,n-len(c))),mode='edge')[:n]
    lo=np.percentile(c,3) if floors[i] is None else floors[i]
    hi=np.percentile(c,99.7)
    v=np.clip((c-lo)/(hi-lo),0,1)
    out[:,i]=np.round(v*255)
    print(i, 'lo',round(lo,1),'hi',round(hi,1),'mean',v.mean().round(3))
b64=base64.b64encode(out.tobytes()).decode()
ev=json.load(open('events.json'))
def enc(ts): # delta-encode in ms
    ms=[int(round(x*1000)) for x in ts]; d=[ms[0]]+[ms[i]-ms[i-1] for i in range(1,len(ms))]; return d
js = "const ENV_FPS=%d, ENV_CH=%d, ENV_N=%d;\nconst ENV_B64=\"%s\";\nconst KICK_D=%s;\nconst SNARE_D=%s;\n" % (fps,len(chs),n,b64,json.dumps(enc(ev['kick'])),json.dumps(enc(ev['snare'])))
open('data.js','w').write(js)
print('frames',n,'bytes',len(js))
