(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const ids=['studioHtml','studioCss','studioJs'];
 const inputs=ids.map($), defaults=inputs.map(el=>el.value);
 const key='ethan-code-studio-v1';
 try {const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&Array.isArray(saved)&&saved.length===3)saved.forEach((value,i)=>{if(typeof value==='string')inputs[i].value=value;});}catch(e){}
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(inputs.map(el=>el.value)));$('studioStatus').textContent='Saved on this device';}catch(e){$('studioStatus').textContent='Local save unavailable';}};
 inputs.forEach(el=>el.addEventListener('input',save));
 const build=()=>{
   const [html,css,js]=inputs.map(el=>el.value);
   // Script tags inside learner code cannot terminate the generated script element.
   const safeJs=js.replace(/<\/script/gi,'<\\/script');
   const safeCss=css.replace(/<\/style/gi,'<\\/style');
   const content=/<html[\s>]/i.test(html)?html:('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+html+'</body></html>');
   const style='<style>'+safeCss+'</style>';
   const script='<script>'+safeJs+'<\\/script>'.replace('<\\/script>','</script>');
   let result=content.replace(/<\/head\s*>/i,style+'</head>');
   if(result===content)result=style+result;
   if(/<\/body\s*>/i.test(result))result=result.replace(/<\/body\s*>/i,()=>script+'</body>');else result+=script;
   return result;
 };
 const run=()=>{$('studioFrame').srcdoc=build();$('studioStatus').textContent='Page running';};
 document.querySelectorAll('[data-studio-tab]').forEach(btn=>btn.addEventListener('click',()=>{
   const name=btn.dataset.studioTab;
   document.querySelectorAll('[data-studio-tab]').forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
   document.querySelectorAll('[data-studio-panel]').forEach(panel=>panel.classList.toggle('active',panel.dataset.studioPanel===name));
 }));
 $('studioRun').addEventListener('click',run);
 $('studioRefresh').addEventListener('click',run);
 $('studioShow').addEventListener('click',()=>{run();$('studioOutput').scrollIntoView({behavior:'smooth',block:'start'});});
 $('studioDownload').addEventListener('click',()=>{const blob=new Blob([build()],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='my-ethan-code-page.html';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);$('studioStatus').textContent='Page downloaded';});
 $('studioReset').addEventListener('click',()=>{if(!confirm('Replace your current code with the starting example?'))return;inputs.forEach((el,i)=>el.value=defaults[i]);save();run();});
 run();
})();
