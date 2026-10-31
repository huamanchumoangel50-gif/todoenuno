const $ = (s,root=document)=>root.querySelector(s);
$('#year').textContent = new Date().getFullYear();
const workspace=$('#workspace'), content=$('#tool-content'), title=$('#tool-title');
const templates={
calc:`<div class="panel"><label for="calc-input">Operación matemática</label><input id="calc-input" placeholder="Ej. (25 + 15) * 2" inputmode="decimal"><p class="muted-note">Puedes usar +, -, *, / y paréntesis. No escribas funciones ni código.</p><button class="action-btn" id="calc-go">Calcular</button><div id="calc-result" aria-live="polite"></div></div>`,
percent:`<div class="panel"><div class="field-row"><div><label for="pct-value">Cantidad</label><input id="pct-value" type="number" placeholder="Ej. 250"></div><div><label for="pct-rate">Porcentaje (%)</label><input id="pct-rate" type="number" placeholder="Ej. 15"></div></div><button class="action-btn" id="pct-go">Calcular porcentaje</button><div id="pct-result" aria-live="polite"></div><p class="muted-note">Calcula cuánto representa un porcentaje de una cantidad.</p></div>`,
password:`<div class="panel"><label for="pass-length">Longitud: <strong id="pass-length-label">16</strong> caracteres</label><input id="pass-length" type="range" min="8" max="40" value="16"><label><input id="pass-numbers" type="checkbox" checked style="width:auto"> Incluir números</label><label><input id="pass-symbols" type="checkbox" checked style="width:auto"> Incluir símbolos</label><button class="action-btn" id="pass-go">Generar contraseña</button><div id="pass-result" class="result" hidden></div><button class="action-btn" id="pass-copy" hidden style="background:#202a40">Copiar contraseña</button><p class="muted-note">La contraseña se genera en tu navegador; no se envía a ningún servidor.</p></div>`,
words:`<div class="panel"><label for="words-text">Escribe o pega tu texto</label><textarea id="words-text" placeholder="Empieza a escribir aquí..."></textarea><div class="field-row"><div class="result" id="word-count">0 palabras</div><div class="result" id="char-count">0 caracteres</div></div><p class="muted-note" id="space-count">0 caracteres sin espacios</p></div>`,
convert:`<div class="panel"><div class="field-row"><div><label for="convert-type">Tipo de conversión</label><select id="convert-type"><option value="length">Longitud</option><option value="weight">Peso</option><option value="temp">Temperatura</option></select></div><div><label for="convert-value">Valor</label><input id="convert-value" type="number" value="1"></div></div><div class="field-row"><div><label for="convert-from">De</label><select id="convert-from"></select></div><div><label for="convert-to">A</label><select id="convert-to"></select></div></div><button class="action-btn" id="convert-go">Convertir</button><div id="convert-result" aria-live="polite"></div></div>`
};
const names={calc:'Calculadora',percent:'Calculadora de porcentajes',password:'Generador de contraseñas',words:'Contador de palabras',convert:'Conversor de unidades'};
function openTool(key){title.textContent=names[key];content.innerHTML=templates[key];workspace.hidden=false;workspace.scrollIntoView({behavior:'smooth',block:'start'});wire(key)}
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.open)));
$('#close-tool').addEventListener('click',()=>{workspace.hidden=true;document.querySelector('#herramientas').scrollIntoView({behavior:'smooth'})});
function show(id,text){const el=$('#'+id);el.className='result';el.textContent=text}
function wire(key){
 if(key==='calc'){
  const run=()=>{const raw=$('#calc-input').value.trim();if(!raw){show('calc-result','Escribe una operación.');return}
   if(!/^[0-9+\-*/().\s]+$/.test(raw)){show('calc-result','Usa solo números y los operadores permitidos.');return}
   try{const result=Function('"use strict";return ('+raw+')')();show('calc-result',Number.isFinite(result)?'Resultado: '+result:'La operación no tiene un resultado válido.')}catch(e){show('calc-result','Revisa la operación e inténtalo de nuevo.')}
  };$('#calc-go').addEventListener('click',run);$('#calc-input').addEventListener('keydown',e=>{if(e.key==='Enter')run()});
 }
 if(key==='percent')$('#pct-go').addEventListener('click',()=>{const v=Number($('#pct-value').value),p=Number($('#pct-rate').value);if($('#pct-value').value===''||$('#pct-rate').value===''){show('pct-result','Completa ambos campos.');return}show('pct-result',p+'% de '+v+' = '+(v*p/100))});
 if(key==='password'){
  const length=$('#pass-length');length.addEventListener('input',()=>$('#pass-length-label').textContent=length.value);
  $('#pass-go').addEventListener('click',()=>{let chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';if($('#pass-numbers').checked)chars+='0123456789';if($('#pass-symbols').checked)chars+='!@#$%&*_-+=';let out='';const arr=new Uint32Array(Number(length.value));crypto.getRandomValues(arr);for(let n of arr)out+=chars[n%chars.length];$('#pass-result').hidden=false;$('#pass-result').textContent=out;$('#pass-copy').hidden=false});
  $('#pass-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#pass-result').textContent);$('#pass-copy').textContent='Copiada ✓'}catch(e){$('#pass-copy').textContent='No se pudo copiar'}});
 }
 if(key==='words')$('#words-text').addEventListener('input',e=>{const t=e.target.value;$('#word-count').textContent=(t.trim()?t.trim().split(/\s+/).length:0)+' palabras';$('#char-count').textContent=t.length+' caracteres';$('#space-count').textContent=(t.replace(/\s/g,'').length)+' caracteres sin espacios'});
 if(key==='convert'){
  const sets={length:{'Metros':1,'Kilómetros':1000,'Centímetros':.01,'Milímetros':.001,'Pies':.3048,'Pulgadas':.0254},weight:{'Kilogramos':1,'Gramos':.001,'Libras':.45359237,'Onzas':.0283495,'Toneladas':1000},temp:{'Celsius':1,'Fahrenheit':1,'Kelvin':1}};
  const type=$('#convert-type'),from=$('#convert-from'),to=$('#convert-to');
  function fill(){let opts=Object.keys(sets[type.value]);from.innerHTML=to.innerHTML=opts.map(x=>`<option>${x}</option>`).join('');if(type.value==='length')to.value='Kilómetros';if(type.value==='weight')to.value='Gramos';if(type.value==='temp')to.value='Fahrenheit'}
  fill();type.addEventListener('change',fill);
  $('#convert-go').addEventListener('click',()=>{let v=Number($('#convert-value').value);if($('#convert-value').value===''){show('convert-result','Ingresa un valor.');return}let a=from.value,b=to.value,res;
   if(type.value==='temp'){let c=a==='Celsius'?v:a==='Fahrenheit'?(v-32)*5/9:v-273.15;res=b==='Celsius'?c:b==='Fahrenheit'?c*9/5+32:c+273.15}
   else res=v*sets[type.value][a]/sets[type.value][b];
   show('convert-result',v+' '+a+' = '+Number(res.toFixed(6))+' '+b);
  });
 }
}
