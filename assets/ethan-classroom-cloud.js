import { createAuthClient } from "https://esm.sh/@neondatabase/auth";

const AUTH_URL = "https://ep-autumn-firefly-ba3rs5vd.neonauth.c-8.eu-central-1.aws.neon.tech/ethancode/auth";
const DATA_URL = "https://ep-autumn-firefly-ba3rs5vd.apirest.c-8.eu-central-1.aws.neon.tech/ethancode/rest/v1";
const auth = createAuthClient(AUTH_URL);
const $ = (id) => document.getElementById(id);
let currentUser = null, selectedClass = null, selectedRole = null, classAssignments = [], latestReport = [];

function feedback(id, message, kind="") {
  const node=$(id); if(!node) return;
  node.textContent=message; node.className="classroom-feedback"+(kind?" "+kind:"");
}
function errorText(err) {
  return err?.message || err?.error?.message || err?.statusText || "Something went wrong. Please try again.";
}
async function accessToken() {
  const result=await auth.getJWTToken();
  const token=result?.data?.token || result?.token || result;
  if(typeof token!=="string" || !token) throw new Error("Your session has expired. Please sign in again.");
  return token;
}
async function api(path, options={}) {
  const token=await accessToken();
  const response=await fetch(DATA_URL+path,{
    ...options,
    headers:{
      "Authorization":"Bearer "+token,
      "Content-Type":"application/json",
      "Accept":"application/json",
      ...(options.headers||{})
    }
  });
  const body=await response.text();
  let data=null; try{data=body?JSON.parse(body):null}catch(_){data=body}
  if(!response.ok) throw new Error(data?.message || data?.details || data?.hint || ("Database request failed ("+response.status+")"));
  return data;
}
function escapeCsv(v){return '"'+String(v??"").replace(/"/g,'""')+'"'}
function makeCode(){
  const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes=new Uint8Array(8); crypto.getRandomValues(bytes);
  return Array.from(bytes,b=>alphabet[b%alphabet.length]).join("");
}
function make(tag, cls, text){
  const node=document.createElement(tag); if(cls)node.className=cls;
  if(text!==undefined)node.textContent=text; return node;
}
function setSignedIn(user){
  currentUser=user; $("classAuthPanel").hidden=true; $("classCloudApp").hidden=false;
  $("cloudUserLabel").textContent=user.name||"Ethan Code learner";
  $("cloudUserEmail").textContent=user.email||"";
}
function setSignedOut(){
  currentUser=null; selectedClass=null; $("classAuthPanel").hidden=false; $("classCloudApp").hidden=true;
  $("classSelectedClass")?.setAttribute("hidden","");
}
function showAuthError(error){feedback("cloudAuthFeedback",errorText(error),"error")}
async function signUp(){
  const name=$("cloudAuthName").value.trim(),email=$("cloudAuthEmail").value.trim(),password=$("cloudAuthPassword").value;
  if(!name||!email||password.length<8){feedback("cloudAuthFeedback","Enter your name, a valid email and a password of at least 8 characters.","error");return}
  try{
    $("cloudSignUp").disabled=true;
    const result=await auth.signUp.email({name,email,password});
    if(result?.error)throw result.error;
    $("cloudOtpPanel").hidden=false;
    feedback("cloudAuthFeedback","Account created. Enter the verification code sent to "+email+".");
  }catch(e){showAuthError(e)}finally{$("cloudSignUp").disabled=false}
}
async function verifyEmail(){
  const email=$("cloudAuthEmail").value.trim(),otp=$("cloudOtp").value.trim();
  if(!email||!otp){feedback("cloudAuthFeedback","Enter the email address and verification code.","error");return}
  try{
    $("cloudVerifyOtp").disabled=true;
    const result=await auth.emailOtp.verifyEmail({email,otp});
    if(result?.error)throw result.error;
    const login=await auth.signIn.email({email,password:$("cloudAuthPassword").value});
    if(login?.error)throw login.error;
    await refreshSession();
    feedback("cloudAuthFeedback","Email verified. Welcome to Ethan Code.","success");
  }catch(e){showAuthError(e)}finally{$("cloudVerifyOtp").disabled=false}
}
async function signIn(){
  const email=$("cloudAuthEmail").value.trim(),password=$("cloudAuthPassword").value;
  if(!email||!password){feedback("cloudAuthFeedback","Enter your email and password.","error");return}
  try{
    $("cloudSignIn").disabled=true;
    const result=await auth.signIn.email({email,password});
    if(result?.error)throw result.error;
    await refreshSession();
  }catch(e){showAuthError(e)}finally{$("cloudSignIn").disabled=false}
}
async function refreshSession(){
  const result=await auth.getSession();
  if(result?.error)throw result.error;
  const user=result?.data?.user||result?.data?.session?.user||result?.user||null;
  if(!user){setSignedOut();return}
  await accessToken();
  setSignedIn(user);
  await loadClasses();
}
async function signOut(){
  try{await auth.signOut()}catch(e){console.warn("Sign out:",e)}
  setSignedOut();
}
async function loadClasses(){
  const box=$("cloudClasses"); box.replaceChildren(make("p","classroom-empty","Loading your classrooms…"));
  try{
    const memberships=await api("/class_members?select=classroom_id,role,display_name&user_id=eq."+encodeURIComponent(currentUser.id)+"&order=joined_at.desc");
    box.replaceChildren();
    if(!memberships?.length){box.append(make("p","classroom-empty","You have not joined or created a class yet. Create one as a teacher or enter your teacher's invitation code."));return}
    const classes=await Promise.all(memberships.map(async m=>{
      const rows=await api("/classrooms?select=id,name,join_code,teacher_user_id,created_at&id=eq."+encodeURIComponent(m.classroom_id));
      return rows?.[0]?{...rows[0],role:m.role,displayName:m.display_name}:null;
    }));
    classes.filter(Boolean).forEach(c=>{
      const card=make("article","class-assignment-card"),head=make("div","class-assignment-head");
      head.append(make("strong","",c.name),make("span","class-level",c.role==="teacher"?"TEACHER":"STUDENT"));
      card.append(head,make("p","","Invitation code: "+c.join_code));
      const open=make("button","secondary","Open classroom");open.type="button";open.addEventListener("click",()=>openClass(c));
      card.append(open);box.append(card);
    });
  }catch(e){box.replaceChildren(make("p","classroom-feedback error",errorText(e)))}
}
async function createClass(){
  const name=$("cloudClassName").value.trim();
  if(name.length<2){feedback("cloudCreatedCode","Enter a classroom name of at least two characters.","error");return}
  try{
    $("cloudCreateClass").disabled=true;
    let created=null,lastError=null;
    for(let attempt=0;attempt<3&&!created;attempt++){
      const code=makeCode();
      try{
        const rows=await api("/classrooms",{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify({name,join_code:code,teacher_user_id:currentUser.id})});
        created=rows?.[0]||{id:null,name,join_code:code,teacher_user_id:currentUser.id};
      }catch(e){lastError=e}
    }
    if(!created)throw lastError||new Error("Could not create classroom.");
    const membership=await api("/class_members",{method:"POST",body:JSON.stringify({classroom_id:created.id,user_id:currentUser.id,display_name:currentUser.name||"Teacher",role:"teacher"})});
    $("cloudCreatedCode").textContent="Class created. Share this invitation code with your learners: "+created.join_code;
    feedback("cloudTeacherFeedback","Classroom created successfully.","success");
    await loadClasses();
  }catch(e){feedback("cloudCreatedCode",errorText(e),"error")}finally{$("cloudCreateClass").disabled=false}
}
async function joinClass(){
  const code=$("cloudJoinCode").value.trim().toUpperCase(),display=$("cloudDisplayName").value.trim()||currentUser.name||"Student";
  if(!code){feedback("cloudJoinFeedback","Enter your teacher's invitation code.","error");return}
  try{
    $("cloudJoinClass").disabled=true;
    await api("/rpc/join_classroom",{method:"POST",body:JSON.stringify({p_join_code:code,p_display_name:display})});
    $("cloudJoinCode").value="";
    feedback("cloudJoinFeedback","You have joined the classroom. It is now available in Your Online Classes.","success");
    await loadClasses();
  }catch(e){feedback("cloudJoinFeedback",errorText(e),"error")}finally{$("cloudJoinClass").disabled=false}
}
async function openClass(c){
  selectedClass=c; selectedRole=c.role;
  $("cloudSelectedClass").hidden=false;
  $("cloudSelectedClassName").textContent=c.name;
  $("cloudClassRole").textContent=c.role==="teacher"?"You manage this classroom. Publish assignments and review every learner's submission.":"You are enrolled in this classroom. Complete the assignments set by your teacher.";
  $("cloudSelectedCode").textContent=c.role==="teacher"?"CODE: "+c.join_code:"STUDENT";
  $("cloudTeacherTools").hidden=c.role!=="teacher";
  $("cloudStudentTools").hidden=c.role!=="student";
  await loadAssignments();
  $("cloudSelectedClass").scrollIntoView({behavior:"smooth",block:"start"});
}
async function loadAssignments(){
  const list=$("cloudAssignments");list.replaceChildren(make("p","classroom-empty","Loading assignments…"));
  try{
    classAssignments=await api("/class_assignments?select=*&classroom_id=eq."+encodeURIComponent(selectedClass.id)+"&order=created_at.desc");
    list.replaceChildren();
    const select=$("cloudSubmissionAssignment");select?.replaceChildren();
    if(!classAssignments.length){list.append(make("p","classroom-empty","No assignments have been published to this class yet."));}
    classAssignments.forEach(a=>{
      const card=make("article","class-assignment-card"),head=make("div","class-assignment-head");
      head.append(make("strong","",a.title),make("span","class-level",a.level));
      card.append(head,make("p","",a.language+" · "+(Array.isArray(a.checks)?a.checks.length:0)+" automatic checks"),make("p","class-assignment-description",a.instructions));
      if(selectedRole==="teacher"){
        const del=make("button","class-remove","Delete assignment");del.type="button";del.addEventListener("click",()=>deleteAssignment(a.id));card.append(del);
      }else{
        const opt=make("option","",a.title);opt.value=a.id;select.append(opt);
      }
      list.append(card);
    });
    if(selectedRole==="teacher")await loadReport();else await loadStudentHistory();
  }catch(e){list.replaceChildren(make("p","classroom-feedback error",errorText(e)))}
}
async function publishAssignment(){
  const title=$("cloudAssignmentTitle").value.trim(),instructions=$("cloudAssignmentInstructions").value.trim();
  const checks=$("cloudAssignmentChecks").value.split(",").map(x=>x.trim()).filter(Boolean).slice(0,30);
  if(title.length<2||!instructions||!checks.length){feedback("cloudTeacherFeedback","Add a title, instructions and at least one marking phrase.","error");return}
  try{
    $("cloudPublishAssignment").disabled=true;
    await api("/class_assignments",{method:"POST",body:JSON.stringify({
      classroom_id:selectedClass.id,title,level:$("cloudAssignmentLevel").value,
      language:$("cloudAssignmentLanguage").value,instructions,checks,created_by:currentUser.id
    })});
    $("cloudAssignmentTitle").value="";$("cloudAssignmentInstructions").value="";$("cloudAssignmentChecks").value="";
    feedback("cloudTeacherFeedback","Assignment published to every learner in this classroom.","success");
    await loadAssignments();
  }catch(e){feedback("cloudTeacherFeedback",errorText(e),"error")}finally{$("cloudPublishAssignment").disabled=false}
}
async function deleteAssignment(id){
  if(!confirm("Delete this assignment and its submissions? This cannot be undone."))return;
  try{await api("/class_assignments?id=eq."+encodeURIComponent(id),{method:"DELETE"});await loadAssignments()}
  catch(e){feedback("cloudTeacherFeedback",errorText(e),"error")}
}
async function submitWork(){
  const assignmentId=$("cloudSubmissionAssignment").value,solution=$("cloudStudentSolution").value;
  if(!assignmentId||!solution.trim()){feedback("cloudStudentFeedback","Choose an assignment and paste your solution before submitting.","error");return}
  try{
    $("cloudSubmitWork").disabled=true;
    const rows=await api("/class_members?select=display_name&classroom_id=eq."+encodeURIComponent(selectedClass.id)+"&user_id=eq."+encodeURIComponent(currentUser.id));
    const studentName=rows?.[0]?.display_name||currentUser.name||currentUser.email;
    const result=await api("/class_submissions",{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify({
      assignment_id:assignmentId,classroom_id:selectedClass.id,student_user_id:currentUser.id,
      student_name:studentName,solution,score:0,feedback:[]
    })});
    const score=result?.[0]?.score;
    feedback("cloudStudentFeedback",score===undefined?"Your work was submitted. Your teacher can review it.":"Submitted successfully. Database marking score: "+score+"%.","success");
    await loadStudentHistory();
  }catch(e){feedback("cloudStudentFeedback",errorText(e),"error")}finally{$("cloudSubmitWork").disabled=false}
}
async function loadStudentHistory(){
  const box=$("cloudStudentHistory");box.replaceChildren(make("p","classroom-empty","Loading your submissions…"));
  try{
    const rows=await api("/class_submissions?select=id,assignment_id,score,feedback,submitted_at&classroom_id=eq."+encodeURIComponent(selectedClass.id)+"&student_user_id=eq."+encodeURIComponent(currentUser.id)+"&order=submitted_at.desc");
    box.replaceChildren();
    if(!rows.length){box.append(make("p","classroom-empty","You have not submitted work in this class yet."));return}
    rows.forEach(s=>{
      const a=classAssignments.find(x=>x.id===s.assignment_id),card=make("article","class-assignment-card");
      card.append(make("strong","",a?.title||"Assignment"),make("p","", "Score: "+s.score+"% · "+new Date(s.submitted_at).toLocaleString()));
      if(s.feedback?.missing?.length)card.append(make("p","grade-missing","Review: "+s.feedback.missing.join(", ")));
      box.append(card);
    });
  }catch(e){box.replaceChildren(make("p","classroom-feedback error",errorText(e)))}
}
async function loadReport(){
  const body=$("cloudReportRows");body.replaceChildren(make("tr","",""));
  try{
    const rows=await api("/class_submissions?select=id,student_name,assignment_id,score,feedback,submitted_at&classroom_id=eq."+encodeURIComponent(selectedClass.id)+"&order=submitted_at.desc");
    latestReport=rows||[];body.replaceChildren();
    if(!latestReport.length){const tr=make("tr"),td=make("td","","No submissions yet.");td.colSpan=5;tr.append(td);body.append(tr);return}
    latestReport.forEach(s=>{
      const tr=make("tr"),a=classAssignments.find(x=>x.id===s.assignment_id);
      [s.student_name,a?.title||"Assignment",s.score+"%",(s.feedback?.matched??0)+"/"+(s.feedback?.total??0)+" checks",new Date(s.submitted_at).toLocaleString()].forEach(v=>tr.append(make("td","",String(v))));
      body.append(tr);
    });
  }catch(e){body.replaceChildren();const tr=make("tr"),td=make("td","",errorText(e));td.colSpan=5;tr.append(td);body.append(tr)}
}
function exportReport(){
  const rows=[["Student","Assignment","Score","Matched checks","Total checks","Missing checks","Submitted"]];
  latestReport.forEach(s=>rows.push([s.student_name,classAssignments.find(a=>a.id===s.assignment_id)?.title||"Assignment",s.score,s.feedback?.matched??0,s.feedback?.total??0,(s.feedback?.missing||[]).join("; "),s.submitted_at]));
  const csv=rows.map(r=>r.map(escapeCsv).join(",")).join("\r\n"),url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
  const a=make("a");a.href=url;a.download="ethan-code-class-report.csv";document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
}

$("cloudSignUp").addEventListener("click",signUp);
$("cloudSignIn").addEventListener("click",signIn);
$("cloudVerifyOtp").addEventListener("click",verifyEmail);
$("cloudSignOut").addEventListener("click",signOut);
$("cloudCreateClass").addEventListener("click",createClass);
$("cloudJoinClass").addEventListener("click",joinClass);
$("cloudPublishAssignment").addEventListener("click",publishAssignment);
$("cloudSubmitWork").addEventListener("click",submitWork);
$("cloudExportReport").addEventListener("click",exportReport);

(async()=>{
  try{await refreshSession()}catch(e){console.error(e);feedback("cloudAuthFeedback","Classroom connection is ready, but your session could not be restored. Please sign in.","error")}
})();
