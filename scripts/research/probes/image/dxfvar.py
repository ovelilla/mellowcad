# dxfvar.py src dst key=value...: rewrite the first IMAGE / IMAGEDEF of an ASCII DXF
#   path=...  w=.. h=.. (pixels; the clip boundary follows)  u=x,y v=x,y (pixel vectors) ins=x,y
#   clip=x,y;x,y;... (polygonal boundary in pixel coordinates)  frame=0|1|2 (RASTERVARIABLES 70)
import sys
src,dst=sys.argv[1],sys.argv[2]
opts=dict(a.split('=',1) for a in sys.argv[3:])
L=open(src,encoding='utf-8').read().replace('\r','').split('\n')
pairs=[[L[i].strip(),L[i+1]] for i in range(0,len(L)-1,2)]
def ent(name):
    for i,(c,v) in enumerate(pairs):
        if c=='0' and v==name and pairs[i+1][0]=='5':
            j=i+1
            while pairs[j][0]!='0': j+=1
            return i,j
i,j=ent('IMAGE')
body=[p for p in pairs[i:j] if p[0] not in ('160','310','92')]
def setv(code,val,nth=0):
    k=0
    for p in body:
        if p[0]==code:
            if k==nth: p[1]=val; return
            k+=1
if 'w' in opts:
    w,h=float(opts['w']),float(opts['h'])
    setv('13',str(w)); setv('23',str(h))
    setv('14','-0.5',0); setv('24','-0.5',0); setv('14',str(w-0.5),1); setv('24',str(h-0.5),1)
if 'u' in opts:
    x,y=opts['u'].split(','); setv('11',x); setv('21',y)
if 'v' in opts:
    x,y=opts['v'].split(','); setv('12',x); setv('22',y)
if 'ins' in opts:
    x,y=opts['ins'].split(','); setv('10',x); setv('20',y)
if 'clip' in opts:
    pts=[p.split(',') for p in opts['clip'].split(';')]
    k=next(n for n,p in enumerate(body) if p[0]=='71')
    body[k][1]='     2'
    body=body[:k+1]+[['91',str(len(pts))]]+[q for x,y in pts for q in (['14',x],['24',y])]
pairs[i:j]=body
if 'path' in opts:
    a,b=ent('IMAGEDEF')
    for p in pairs[a:b]:
        if p[0]=='1': p[1]=opts['path']
if 'defsize' in opts:
    a,b=ent('IMAGEDEF')
    x,y=opts['defsize'].split(',')
    for p in pairs[a:b]:
        if p[0]=='10': p[1]=x
        if p[0]=='20': p[1]=y
if 'frame' in opts:
    a,b=ent('RASTERVARIABLES')
    for p in pairs[a:b]:
        if p[0]=='70': p[1]='     '+opts['frame']
open(dst,'w',encoding='utf-8',newline='\r\n').write('\n'.join(f'{c:>3}\n{v}' for c,v in pairs)+'\n')
