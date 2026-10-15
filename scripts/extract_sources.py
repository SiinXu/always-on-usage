#!/usr/bin/env python3
"""Fetch verbatim source excerpts + media for existing public cases.
Writes content-inbox/source-extract.json keyed by source_url.
Only public endpoints: Discourse topic JSON, raw README on GitHub, YouTube watch page.
Nothing is generated: text is a verbatim excerpt; absent data stays absent."""
import json, re, sys, time, html, urllib.request, os, concurrent.futures as cf
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'content-inbox','source-extract.json')
UA={'User-Agent':'Mozilla/5.0 (usage.incidental.site source extractor)'}
def get(u,t=20):
    r=urllib.request.Request(u,headers=UA)
    with urllib.request.urlopen(r,timeout=t) as f: return f.read().decode('utf-8','replace')
def strip(h):
    h=re.sub(r'<(script|style)[^>]*>.*?</\1>','',h,flags=re.S)
    h=re.sub(r'<br\s*/?>|</p>|</li>|</h\d>','\n',h)
    h=re.sub(r'<li[^>]*>','• ',h)
    h=re.sub(r'<[^>]+>','',h)
    h=html.unescape(h)
    return re.sub(r'\n{3,}','\n\n',re.sub(r'[ \t]+',' ',h)).strip()
def cut(s,n=900):
    s=s.strip()
    if len(s)<=n: return s
    c=s[:n]; k=max(c.rfind('\n'),c.rfind('. '),c.rfind('。'))
    return (c[:k+1] if k>n*0.5 else c).rstrip()+' …'
def forum(u):
    base=u.split('?')[0].rstrip('/')
    j=json.loads(get(base+'.json'))
    p=j['post_stream']['posts'][0]
    cooked=p.get('cooked','')
    imgs=[m for m in re.findall(r'<img[^>]+src="([^"]+)"',cooked) if 'emoji' not in m and 'avatar' not in m][:2]
    imgs=['https:'+m if m.startswith('//') else m for m in imgs]
    return {'text':cut(strip(cooked)),'media':[{'type':'photo','url':m} for m in imgs],
            'author':p.get('username'),'date':p.get('created_at','')[:10],'kind':'forum',
            'replies':j.get('posts_count',1)-1,'likes':j.get('like_count')}
BADGE=re.compile(r'shields\.io|badge|img\.shields|travis|codecov|\.svg(\?|$)|star-history|contrib\.rocks|logo',re.I)
def gh(u):
    m=re.match(r'https?://github\.com/([^/]+)/([^/#?]+)',u)
    if not m: return None
    o,r=m.group(1),m.group(2).removesuffix('.git')
    md=None
    for name in ('README.md','readme.md','README.MD','Readme.md','README'):
        try: md=get(f'https://raw.githubusercontent.com/{o}/{r}/HEAD/{name}'); break
        except Exception: pass
    if md is None: return {'kind':'github','missing':'readme'}
    imgs=re.findall(r'!\[[^\]]*\]\(([^)\s]+)',md)+re.findall(r'<img[^>]+src="([^"]+)"',md)
    out=[]
    for i in imgs:
        if BADGE.search(i): continue
        if not i.startswith('http'): i=f'https://raw.githubusercontent.com/{o}/{r}/HEAD/'+i.lstrip('./')
        i=re.sub(r'https://github\.com/([^/]+)/([^/]+)/blob/',r'https://raw.githubusercontent.com/\1/\2/',i)
        out.append(i)
        if len(out)>=2: break
    body=re.sub(r'```.*?```','',md,flags=re.S)
    body=re.sub(r'<[^>]+>','',body); body=re.sub(r'!\[[^\]]*\]\([^)]*\)','',body)
    body=re.sub(r'\[([^\]]+)\]\([^)]*\)',r'\1',body)
    lines=[l.rstrip() for l in body.splitlines()]
    outline=[re.sub(r'^\s*([-*]|\d+\.)\s+','',l).strip('* ') for l in lines if re.match(r'^\s*([-*]|\d+\.)\s+\S',l)][:8]
    outline=[re.sub(r'\*\*|__|`','',x) for x in outline]
    outline=[(x[:157]+'…' if len(x)>160 else x) for x in outline if len(x)>8]
    para=[]
    for l in lines:
        if l.startswith('#') or not l.strip() or l.strip().startswith('|'): 
            if para and not l.strip(): break
            continue
        if re.match(r'^\s*([-*]|\d+\.)\s',l): continue
        para.append(l.strip())
    return {'text':cut(' '.join(para),700),'media':[{'type':'photo','url':m} for m in out],'outline':outline,'kind':'github'}
def yt(u):
    m=re.search(r'(?:v=|youtu\.be/)([\w-]{11})',u)
    if not m: return None
    vid=m.group(1)
    h=get(f'https://www.youtube.com/watch?v={vid}&hl=en')
    d=re.search(r'"shortDescription":"((?:[^"\\]|\\.)*)"',h)
    desc=json.loads('"'+d.group(1)+'"') if d else ''
    ch=re.findall(r'^\s*\(?(\d{1,2}:\d{2}(?::\d{2})?)\)?\s*[-–—]?\s*(.+)$',desc,re.M)
    return {'text':cut(re.sub(r'\n?\s*\(?\d{1,2}:\d{2}.*','',desc,flags=re.S) or desc,700),
            'media':[{'type':'photo','url':f'https://i.ytimg.com/vi/{vid}/hqdefault.jpg'}],
            'outline':[f'{a} {b.strip()}' for a,b in ch][:14],'kind':'youtube'}
def one(u):
    try:
        if 'forum.cursor.com/t/' in u: return u,forum(u)
        if 'github.com/' in u: return u,gh(u)
        if 'youtube.com' in u or 'youtu.be' in u: return u,yt(u)
    except Exception as e: return u,{'error':str(e)[:120]}
    return u,None
if __name__=='__main__':
    pc=json.load(open(os.path.join(ROOT,'content-inbox','public-cases.json')))['items']
    old=json.load(open(OUT)) if os.path.exists(OUT) else {}
    # public cases + ingested items (GitHub/YouTube/forum) that arrived without an outline or media
    ing=json.load(open(os.path.join(ROOT,'content-inbox','ingest.json'))).get('items',[]) if os.path.exists(os.path.join(ROOT,'content-inbox','ingest.json')) else []
    cand=[x['source_url'] for x in pc if x.get('source_url')]+[x['url'] for x in ing if x.get('url') and not (x.get('outline') and x.get('media'))]
    urls=list(dict.fromkeys(u for u in cand if u not in old or 'error' in old[u]))
    if '--dry' in sys.argv: print('would fetch',len(urls)); sys.exit(0)
    with cf.ThreadPoolExecutor(6) as ex:
        for i,(u,r) in enumerate(ex.map(one,urls)):
            if r is not None: r['fetched_at']=time.strftime('%Y-%m-%d'); old[u]=r
            if i%50==0: print(i,len(urls),flush=True)
    json.dump(old,open(OUT,'w'),ensure_ascii=False,indent=1)
    print('done',len(old),sum(1 for v in old.values() if 'error' in v))
