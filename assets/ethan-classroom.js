(function(){
'use strict';
const $=id=>document.getElementById(id);
const KEYS={assignments:'ethan-code-class-assignments-v1',submissions:'ethan-code-class-submissions-v1'};
const read=(key)=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch(_){return[]}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}};
let assignments=read(KEYS.assignments),submissions=read(KEYS.submissions),selectedAssignment='';
const stamp=()=>new Date().toLocaleString();
function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n}
function setFeedback(id,msg,kind){const n=$(id);if(!n)return;n.className='classroom-feedback'+(kind?' '+kind:'');n.textContent=msg}
function switchTab(name){
 document.querySelectorAll('[data-classroom-tab]').forEach(b=>{const active=b.dataset.classroomTab===name;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});
 document.querySelectorAll('[data-classroom-panel]').forEach(p=>{const active=p.dataset.classroomPanel===name;p.classList.toggle('active',active);p.hidden=!active});
 if(name==='reports')renderReports();
}
document.querySelectorAll('[data-classroom-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.classroomTab)));
function renderAssignments(){
 const list=$('classAssignmentList');list.replaceChildren();
 if(!assignments.length){list.append(el('p','classroom-empty','No assignments yet. Create your first task using the builder.'))}
 assignments.forEach(a=>{
  const card=el('article','class-assignment-card'),head=el('div','class-assignment-head');
  head.append(el('strong','',a.title),el('span','class-level',a.level));card.append(head);
  card.append(el('p','',a.language+' · '+a.checks.length+' automatic checks'));
  card.append(el('p','class-assignment-description',a.brief));
  const del=el('button','class-remove','Delete assignment');del.type='button';del.addEventListener('click',()=>{
   if(!confirm('Delete this assignment? Existing submissions and report records for it will also be removed.'))return;
   assignments=assignments.filter(x=>x.id!==a.id);submissions=submissions.filter(x=>x.assignmentId!==a.id);
   write(KEYS.assignments,assignments);write(KEYS.submissions,submissions);renderAll();
  });card.append(del);list.append(card);
 });
 const select=$('classChooseAssignment'),previous=select.value;select.replaceChildren();
 if(!assignments.length){const o=el('option','', 'No assignments available');o.value='';select.append(o);$('classStudentBrief').textContent='Your teacher has not created an assignment yet.';}
 else{
  assignments.forEach(a=>{const o=el('option','',a.title);o.value=a.id;select.append(o)});
  select.value=assignments.some(a=>a.id===previous)?previous:assignments[0].id;showStudentBrief();
 }
}
function showStudentBrief(){
 const a=assignments.find(x=>x.id===$('classChooseAssignment').value),box=$('classStudentBrief');
 box.textContent=a?a.brief+'\n\nLevel: '+a.level+' · Language: '+a.language+'\nChecks: '+a.checks.join(', '):'Choose an assignment to see its instructions.';
}
$('classChooseAssignment')?.addEventListener('change',showStudentBrief);
$('classCreateAssignment')?.addEventListener('click',()=>{
 const title=$('classAssignmentTitle').value.trim(),brief=$('classAssignmentBrief').value.trim();
 const checks=$('classAssignmentChecks').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,12);
 if(!title||!brief||!checks.length){setFeedback('classTeacherFeedback','Please add a title, student instructions and at least one automatic check.','error');return}
 const a={id:'a-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),title,brief,level:$('classAssignmentLevel').value,language:$('classAssignmentLanguage').value,checks,createdAt:new Date().toISOString()};
 assignments.unshift(a);
 if(!write(KEYS.assignments,assignments)){assignments.shift();setFeedback('classTeacherFeedback','Could not save. Browser storage may be full or unavailable.','error');return}
 $('classAssignmentTitle').value='';$('classAssignmentBrief').value='';$('classAssignmentChecks').value='';
 setFeedback('classTeacherFeedback','Assignment published in this browser. Students using this same browser can now select it.','success');renderAll();
});
function renderHistory(){
 const list=$('classStudentHistory'),name=$('classStudentName').value.trim().toLowerCase();list.replaceChildren();
 const rows=submissions.filter(s=>!name||s.student.toLowerCase()===name).slice(0,8);
 if(!rows.length){list.append(el('p','classroom-empty','No submissions found for this display name.'));return}
 rows.forEach(s=>{const a=assignments.find(x=>x.id===s.assignmentId),card=el('article','class-assignment-card');card.append(el('strong','',a?.title||'Deleted assignment'));card.append(el('p','',s.student+' · '+s.score+'% · '+s.matched+'/'+s.total+' checks'));card.append(el('small','',new Date(s.createdAt).toLocaleString()));list.append(card)});
}
$('classStudentName')?.addEventListener('input',renderHistory);
$('classSubmitWork')?.addEventListener('click',()=>{
 const student=$('classStudentName').value.trim(),a=assignments.find(x=>x.id===$('classChooseAssignment').value),code=$('classStudentCode').value;
 if(!student){$('classStudentName').focus();$('classGradeResult').textContent='Enter your display name before submitting.';return}
 if(!a){$('classGradeResult').textContent='There is no assignment to submit yet.';return}
 if(!code.trim()){$('classStudentCode').focus();$('classGradeResult').textContent='Write or paste your solution first.';return}
 const normalized=code.toLowerCase(),passed=a.checks.filter(check=>normalized.includes(check.toLowerCase()));
 const score=Math.round(passed.length/a.checks.length*100),missing=a.checks.filter(check=>!passed.includes(check));
 const record={id:'s-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),student,assignmentId:a.id,score,matched:passed.length,total:a.checks.length,missing,code,createdAt:new Date().toISOString()};
 submissions.unshift(record);
 if(!write(KEYS.submissions,submissions)){submissions.shift();$('classGradeResult').textContent='Could not save your submission. Browser storage may be full.';return}
 const result=$('classGradeResult');result.replaceChildren();result.className='class-grade-result '+(score===100?'grade-perfect':'');
 result.append(el('strong','grade-score','Your automatic check score: '+score+'%'));
 result.append(el('p','',passed.length+' of '+a.checks.length+' required phrases found.'));
 if(missing.length){result.append(el('p','grade-missing','Review these missing requirements: '+missing.join(', ')+'.'));result.append(el('p','', 'Use the assignment instructions to improve your code, then submit again.'))}
 else result.append(el('p','', 'Excellent! All phrase checks were found. Ask your teacher to review how well the solution works.'));
 renderHistory();renderReports();
});
function renderReports(){
 $('classMetricAssignments').textContent=assignments.length;$('classMetricSubmissions').textContent=submissions.length;
 const avg=submissions.length?Math.round(submissions.reduce((n,s)=>n+s.score,0)/submissions.length):null;
 $('classMetricAverage').textContent=avg===null?'—':avg+'%';
 $('classMetricPass').textContent=submissions.filter(s=>s.score===100).length;
 const body=$('classReportRows');body.replaceChildren();
 if(!submissions.length){const tr=el('tr');const td=el('td','','No submissions yet.');td.colSpan=5;tr.append(td);body.append(tr);return}
 submissions.slice(0,100).forEach(s=>{const tr=el('tr'),a=assignments.find(x=>x.id===s.assignmentId);[s.student,a?.title||'Deleted assignment',s.score+'%',s.matched+'/'+s.total+' checks',new Date(s.createdAt).toLocaleString()].forEach(value=>tr.append(el('td','',value)));body.append(tr)});
}
$('classExportReport')?.addEventListener('click',()=>{
 const rows=[['Student','Assignment','Score percent','Matched checks','Total checks','Missing checks','Submitted at']];
 submissions.forEach(s=>rows.push([s.student,assignments.find(a=>a.id===s.assignmentId)?.title||'Deleted assignment',s.score,s.matched,s.total,s.missing.join('; '),s.createdAt]));
 const csv=rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='ethan-code-class-report.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
function renderAll(){renderAssignments();renderHistory();renderReports()}
renderAll();
})();