(function(){
'use strict';
const $=id=>document.getElementById(id);
const safeRead=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch(_){return fallback}};
const safeWrite=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}};
const cases=[
 {title:'The missing message',prompt:'The page loads, but the greeting never appears. Which line contains the mistake?',code:['const greeting = "Hello, Ethan!";','console.log(greetng);','document.body.textContent = greeting;'],answer:1,why:'The variable is named greeting, but the console line says greetng. JavaScript needs the exact same spelling.'},
 {title:'The button that does nothing',prompt:'A button should show an alert when clicked. Which line is wrong?',code:['const button = document.querySelector("#start");','button.addEventListener("click", showWelcome);','function showWelcome() { alert("Welcome!"); }','button.addEventListener("hover", showWelcome);'],answer:3,why:'The standard event name for a mouse click is click, not hover. Use the correct event for the action.'},
 {title:'The hidden heading',prompt:'The heading should be blue. Which CSS declaration has the problem?',code:['h1 {','  font-size: 32px;','  colour: blue;','}'],answer:2,why:'CSS uses the American spelling color. The property colour is not recognised by browsers.'},
 {title:'The loop that never ends',prompt:'The loop should count from 1 to 5. Which line needs fixing?',code:['let count = 1;','while (count <= 5) {','  console.log(count);','}'],answer:3,why:'The loop never changes count, so count stays 1 forever. Add count++ inside the loop to move toward the stopping condition.'}
];
let caseIndex=0,solved=new Set(safeRead('ethan-code-detective-v1',[]));
function renderCase(){
 const c=cases[caseIndex];$('detectiveLevel').textContent='CASE '+(caseIndex+1)+' OF '+cases.length;
 $('detectiveScore').textContent=solved.size+' solved';$('detectiveTitle').textContent=c.title;$('detectivePrompt').textContent=c.prompt;
 $('detectiveCode').textContent=c.code.map((line,i)=>(i+1)+'.  '+line).join('\n');
 $('detectiveChoices').replaceChildren();
 c.code.forEach((line,i)=>{const b=document.createElement('button');b.type='button';b.textContent='Line '+(i+1)+': '+line;b.addEventListener('click',()=>{
  const feedback=$('detectiveFeedback');if(i===c.answer){solved.add(caseIndex);safeWrite('ethan-code-detective-v1',[...solved]);feedback.className='detective-feedback good';feedback.textContent='✓ Correct. '+c.why;$('detectiveScore').textContent=solved.size+' solved';}
  else{feedback.className='detective-feedback try';feedback.textContent='Not quite. Read the code again and compare names, spelling and the expected action.';}
 });$('detectiveChoices').append(b)});
 $('detectiveFeedback').className='detective-feedback';$('detectiveFeedback').textContent=solved.has(caseIndex)?'✓ You solved this case. '+c.why:'Choose the line that contains the bug.';
 $('detectiveNext').textContent=caseIndex===cases.length-1?'Restart cases ↻':'Next case →';
}
$('detectiveNext')?.addEventListener('click',()=>{caseIndex=(caseIndex+1)%cases.length;renderCase()});renderCase();
let latestBlueprint='';
const templates={
 website:{goal:'Create a clear, mobile-friendly website that explains one useful topic.',tools:'HTML for page structure, CSS for design, JavaScript for simple interactions.',steps:['Sketch the page sections on paper.','Create the HTML headings, text and links.','Style colours, spacing and layout with CSS.','Add one useful interaction with JavaScript.','Test on a phone-sized screen and fix errors.'],features:['Welcome section','About or information section','Contact or useful links','Responsive layout']},
 game:{goal:'Create a small game with a clear goal, rules and a way to win.',tools:'HTML, CSS and JavaScript; use keyboard or button controls.',steps:['Write down the game goal and rules.','Design the player, objects and play area.','Add controls and movement.','Add score, win and restart conditions.','Test several times and balance the difficulty.'],features:['Start and restart','Player controls','Score counter','Win or game-over message']},
 app:{goal:'Plan a simple mobile app that solves one everyday problem.',tools:'MIT App Inventor for a beginner visual build; HTML and JavaScript for a browser prototype.',steps:['Describe the problem and target users.','Draw the main screens.','Choose buttons, text fields and other components.','Connect actions to each component.','Test with a few users and improve the flow.'],features:['Home screen','One core task','Clear navigation','Helpful feedback']},
 robot:{goal:'Design a safe beginner robotics project that senses something and responds.',tools:'micro:bit or Arduino, supported sensors and LEDs; simulate first where possible.',steps:['Choose a simple task, such as detecting light.','List the components and check compatibility.','Draw a connection diagram before wiring.','Write the program and test one component at a time.','Record what worked and what you changed.'],features:['Sensor input','Programmed response','Safe power setup','Test log']},
 data:{goal:'Turn a small, non-sensitive dataset into a useful dashboard.',tools:'Spreadsheet formulas and charts first; then HTML/JavaScript or Python concepts.',steps:['Choose a sample dataset without personal information.','Identify the questions the dashboard should answer.','Clean and organise the data.','Calculate totals, averages or comparisons.','Build charts and explain what they show.'],features:['Summary figures','At least one chart','Filter or category view','Short insight summary']}
};
$('makeBlueprint')?.addEventListener('click',()=>{
 const type=$('blueprintType').value,t=templates[type],name=$('blueprintIdea').value.trim()||'My first '+type+' project',aud=$('blueprintAudience').value.trim()||'people who need this solution';
 latestBlueprint='# '+name+'\n\nAudience: '+aud+'\n\n## Project goal\n'+t.goal+'\n\n## Suggested tools\n'+t.tools+'\n\n## Core features\n'+t.features.map(x=>'- [ ] '+x).join('\n')+'\n\n## Build steps\n'+t.steps.map((x,i)=>(i+1)+'. '+x).join('\n')+'\n\n## Definition of done\n- [ ] The main feature works\n- [ ] I tested it and fixed at least one issue\n- [ ] I can explain how it works\n- [ ] I saved a copy of my work\n';
 const out=$('blueprintOutput');out.textContent=latestBlueprint;$('downloadBlueprint').disabled=false;
});
$('downloadBlueprint')?.addEventListener('click',()=>download('ethan-project-blueprint.md',latestBlueprint,'text/markdown;charset=utf-8'));
function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
let portfolio=safeRead('ethan-code-portfolio-v1',[]);
function renderPortfolio(){
 const list=$('portfolioList');list.replaceChildren();
 if(!portfolio.length){const p=document.createElement('p');p.className='portfolio-empty';p.textContent='Your showcase is empty. Add your first project above.';list.append(p);return}
 portfolio.forEach((item,index)=>{const card=document.createElement('article');card.className='portfolio-item';const h=document.createElement('strong');h.textContent=item.name;const p=document.createElement('p');p.textContent=item.description;card.append(h,p);
 if(item.link){try{const u=new URL(item.link);if(['http:','https:'].includes(u.protocol)){const a=document.createElement('a');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open project ↗';card.append(a)}}catch(_){}}
 const remove=document.createElement('button');remove.type='button';remove.className='portfolio-remove';remove.textContent='Remove';remove.addEventListener('click',()=>{portfolio.splice(index,1);safeWrite('ethan-code-portfolio-v1',portfolio);renderPortfolio()});card.append(remove);list.append(card)});
}
$('savePortfolio')?.addEventListener('click',()=>{
 const name=$('portfolioName').value.trim(),description=$('portfolioDescription').value.trim(),raw=$('portfolioLink').value.trim();
 if(!name||!description){$('portfolioName').focus();return}
 let link='';if(raw){try{const u=new URL(raw);if(!['http:','https:'].includes(u.protocol))throw Error();link=u.href}catch(_){$('portfolioLink').setCustomValidity('Enter a valid http or https link, or leave it blank.');$('portfolioLink').reportValidity();return}}
 $('portfolioLink').setCustomValidity('');
 portfolio.unshift({name,description,link,createdAt:new Date().toISOString()});portfolio=portfolio.slice(0,30);
 if(!safeWrite('ethan-code-portfolio-v1',portfolio)){$('portfolioList').textContent='Browser storage is full. Export your existing work and remove an old entry.';return}
 $('portfolioName').value='';$('portfolioDescription').value='';$('portfolioLink').value='';renderPortfolio();
});
$('exportPortfolio')?.addEventListener('click',()=>download('my-ethan-code-portfolio.json',JSON.stringify({app:'Ethan Code',exportedAt:new Date().toISOString(),projects:portfolio},null,2),'application/json'));
renderPortfolio();
})();