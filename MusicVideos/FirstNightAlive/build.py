import os
src='src'; order=['data.js','core.js','city.js','gl.js','draw2d.js','giant.js','engine.js','scenes1.js','scenes2.js','app.js']
js='\n'.join(open(os.path.join(src,f)).read() for f in order)
page=open(os.path.join(src,'page.html')).read()
out=page.replace('<!--SCRIPTS-->','<script>\n"use strict";\n'+js+'\n</script>')
os.makedirs('dist',exist_ok=True)
open('dist/first-night-alive.html','w').write(out)
print('bytes',len(out))
