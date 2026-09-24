import librosa, numpy as np, json, base64
from scipy.signal import find_peaks
sr=22050; hop=256
d,_ = librosa.load('stem_drums.wav', sr=sr, mono=True)
S=np.abs(librosa.stft(d,n_fft=1024,hop_length=hop)); f=librosa.fft_frequencies(sr=sr,n_fft=1024)
t=librosa.times_like(S[0],sr=sr,hop_length=hop)
def flux(band):
    x=np.log1p(10*S[band].sum(0)); fl=np.maximum(0,np.diff(x,prepend=x[0])); return fl
kick=flux((f>30)&(f<130)); snare=flux((f>1500)&(f<5000)); hat=flux(f>7000)
def pick(fl, pct, dist):
    thr=np.percentile(fl,pct)
    pk,_=find_peaks(fl,height=thr,distance=int(dist*sr/hop))
    return t[pk], fl[pk]
kt,kv=pick(kick,97.5,0.18); st,sv=pick(snare,97.5,0.18)
# keep strong ones relative to local max
def rel(ts,vs,win=4):
    keep=[]
    for i,(a,v) in enumerate(zip(ts,vs)):
        m=(ts>a-win)&(ts<a+win)
        if v>=0.45*vs[m].max(): keep.append(round(float(a),3))
    return keep
K=rel(kt,kv); Sn=rel(st,sv)
print('kicks',len(K),'snares',len(Sn))
# density per 10s
for s in range(0,605,20):
    print(s, sum(1 for x in K if s<=x<s+20), sum(1 for x in Sn if s<=x<s+20))
json.dump({'kick':K,'snare':Sn}, open('events.json','w'))
