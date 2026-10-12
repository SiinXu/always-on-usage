import json,os,re,sys,opencc
import argostranslate.translate as t
cc=opencc.OpenCC('s2twp')
j=json.load(open('content-inbox/x-cases.json'));j=j.get('items',j) if isinstance(j,dict) else j
files=os.listdir('content-inbox/x-articles')
L=['ja','ko','ms','vi','fr','es','de']
def zh2en(s): return t.translate(s,'zh','en') if s and s.strip() else s
def tr(s,l): return t.translate(s,'en',l) if s and s.strip() else s
def blocks(txt,f):
  out=[]
  for b in re.split(r'\n{2,}',txt):
    m=re.match(r'^(#+ |> |[-*] |\d+\. )?',b); 
    lines=b.split('\n'); res=[]
    for ln in lines:
      mm=re.match(r'^(\s*(?:#+ |> ?|[-*] |\d+\. )?)(.*)$',ln); pre,body=mm.group(1),mm.group(2)
      body=body.replace('**','')
      res.append(pre+(f(body) if re.search(r'\w',body) else body))
    out.append('\n'.join(res))
  return '\n\n'.join(out)
for x in j:
  sid=x.get('slug'); out=f'content-inbox/x-i18n/{sid}.json'
  if os.path.exists(out) or x.get('needs_review'): continue
  f=next((n for n in files if n.startswith(str(x['post_id'])+'-') or sid in n),None)
  body=open('content-inbox/x-articles/'+f).read() if f else (x.get('soft_article_md') or '')
  body=re.sub(r'^---[\s\S]*?---\s*','',body); body=re.sub(r'^# .*\n+','',body)
  zh={'title':x['title'],'body':body,'how':x.get('how_to_copy') or [],'res':x.get('result_or_conversion') or '','what':x.get('what_they_built') or ''}
  en={'title':zh2en(zh['title']),'body':blocks(body,zh2en),'how':[zh2en(s) for s in zh['how']],'res':zh2en(zh['res']),'what':zh2en(zh['what'])}
  R={'zh-TW':{k:(cc.convert(v) if isinstance(v,str) else [cc.convert(s) for s in v]) for k,v in zh.items()},'en':en}
  for l in L:
    R[l]={'title':tr(en['title'],l),'body':blocks(en['body'],lambda s:tr(s,l)),'how':[tr(s,l) for s in en['how']],'res':tr(en['res'],l),'what':tr(en['what'],l)}
  json.dump(R,open(out,'w'),ensure_ascii=False); print('done',sid,flush=True)
