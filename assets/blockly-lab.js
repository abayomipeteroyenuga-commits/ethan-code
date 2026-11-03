(() => {
  'use strict';
  const byId = (id) => document.getElementById(id);
  const status = byId('blocklyStatus');
  const fallback = byId('blocklyFallback');
  const workspaceHost = byId('blocklyDiv');
  const codePanel = byId('blocklyCode');
  const preview = byId('blocklyPreview');
  if (!workspaceHost || !status) return;

  const BlocklyLib = window.Blockly;
  const jsGenerator = window.javascript && window.javascript.javascriptGenerator;
  if (!BlocklyLib || !jsGenerator || typeof BlocklyLib.inject !== 'function') {
    status.textContent = 'Visual editor unavailable';
    if (fallback) fallback.classList.remove('hidden');
    if (workspaceHost) workspaceHost.classList.add('hidden');
    return;
  }

  let workspace;
  const storageKey = 'ethan-code-blocklab-v1';
  const safeText = (value) => String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  try {
    workspace = BlocklyLib.inject('blocklyDiv', {
      toolbox: byId('blocklyToolbox'),
      media: 'https://unpkg.com/blockly@13.4.0/media/',
      renderer: 'zelos',
      trashcan: true,
      sounds: false,
      oneBasedIndex: true,
      grid: { spacing: 20, length: 3, colour: '#d7e2f2', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 1.35, minScale: 0.55 },
      move: { scrollbars: true, drag: true, wheel: true }
    });
  } catch (error) {
    status.textContent = 'Could not start the visual editor';
    if (fallback) fallback.classList.remove('hidden');
    workspaceHost.classList.add('hidden');
    return;
  }

  function finishBlocks(blocks) {
    const validBlocks = blocks.filter(Boolean);
    validBlocks.forEach((block) => block.initSvg());
    validBlocks.slice().reverse().forEach((block) => block.render());
    if (typeof workspace.scrollCenter === 'function') workspace.scrollCenter();
    updateCode();
  }

  function makeTextPrint(message, x, y) {
    const print = workspace.newBlock('text_print');
    const text = workspace.newBlock('text');
    text.setFieldValue(message, 'TEXT');
    print.getInput('TEXT').connection.connect(text.outputConnection);
    if (Number.isFinite(x) && Number.isFinite(y)) print.moveBy(x, y);
    return [print, text];
  }

  function loadPreset(name) {
    workspace.clear();
    const created = [];

    if (name === 'hello') {
      created.push(...makeTextPrint('Hello, Ethan Code!', 30, 30));
      created.push(...makeTextPrint('I can build programs with blocks.', 30, 145));
    } else if (name === 'repeat') {
      const repeat = workspace.newBlock('controls_repeat_ext');
      const times = workspace.newBlock('math_number');
      times.setFieldValue('5', 'NUM');
      repeat.getInput('TIMES').connection.connect(times.outputConnection);
      const [print, text] = makeTextPrint('Keep learning!', 0, 0);
      repeat.getInput('DO').connection.connect(print.previousConnection);
      repeat.moveBy(30, 30);
      created.push(repeat, times, print, text);
    } else if (name === 'decision') {
      const conditional = workspace.newBlock('controls_if');
      const test = workspace.newBlock('logic_boolean');
      test.setFieldValue('TRUE', 'BOOL');
      conditional.getInput('IF0').connection.connect(test.outputConnection);
      const [print, text] = makeTextPrint('The condition is true!', 0, 0);
      conditional.getInput('DO0').connection.connect(print.previousConnection);
      conditional.moveBy(30, 30);
      created.push(conditional, test, print, text);
    } else if (name === 'score') {
      const variable = workspace.getVariable('score') || workspace.createVariable('score');
      const setScore = workspace.newBlock('variables_set');
      setScore.setFieldValue(variable.getId(), 'VAR');
      const initial = workspace.newBlock('math_number');
      initial.setFieldValue('10', 'NUM');
      setScore.getInput('VALUE').connection.connect(initial.outputConnection);

      const conditional = workspace.newBlock('controls_if');
      const compare = workspace.newBlock('logic_compare');
      compare.setFieldValue('GTE', 'OP');
      const currentScore = workspace.newBlock('variables_get');
      currentScore.setFieldValue(variable.getId(), 'VAR');
      const threshold = workspace.newBlock('math_number');
      threshold.setFieldValue('10', 'NUM');
      compare.getInput('A').connection.connect(currentScore.outputConnection);
      compare.getInput('B').connection.connect(threshold.outputConnection);
      conditional.getInput('IF0').connection.connect(compare.outputConnection);
      const [print, text] = makeTextPrint('You reached the target score!', 0, 0);
      conditional.getInput('DO0').connection.connect(print.previousConnection);
      setScore.nextConnection.connect(conditional.previousConnection);
      setScore.moveBy(30, 30);
      created.push(setScore, initial, conditional, compare, currentScore, threshold, print, text);
    } else {
      created.push(...makeTextPrint('Hello, Ethan Code!', 30, 30));
    }

    finishBlocks(created);
    status.textContent = 'Starter program loaded';
    saveWorkspace();
  }

  function getCode() {
    try {
      return jsGenerator.workspaceToCode(workspace);
    } catch (error) {
      status.textContent = 'Could not generate JavaScript';
      return '// Fix the block connection and try again.\n';
    }
  }

  function updateCode() {
    const code = getCode();
    if (codePanel) codePanel.textContent = code || '// Add blocks from the toolbox to begin.\n';
    return code;
  }

  function saveWorkspace() {
    try {
      const state = BlocklyLib.serialization.workspaces.save(workspace);
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      // Local saving is optional; the editor remains usable without storage.
    }
  }

  function runProgram() {
    const code = updateCode();
    if (!code.trim()) {
      status.textContent = 'Add a few blocks before running';
      return;
    }
    const safeCode = code.replace(/<\/script/gi, '<\\/script');
    const srcdoc = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; form-action 'none'; base-uri 'none'"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:15px/1.6 system-ui,sans-serif;color:#14213d;background:#f8fbff;padding:18px;margin:0}h2{margin:0 0 12px;font-size:18px}#output{display:grid;gap:8px}.line{background:#fff;border:1px solid #dbe5f3;border-radius:10px;padding:10px 12px;white-space:pre-wrap;overflow-wrap:anywhere}.error{color:#9b2c2c;background:#fff1f1;border-color:#ffd0d0}.muted{color:#65748b;font-size:12px}</style></head><body><h2>My Block Program</h2><div id="output"><p class="muted">Program output will appear here.</p></div><script>const output=document.getElementById('output');output.innerHTML='';console.log=(...args)=>{const p=document.createElement('div');p.className='line';p.textContent=args.map(v=>typeof v==='object'?JSON.stringify(v):String(v)).join(' ');output.appendChild(p)};console.warn=console.log;console.error=(...args)=>{const p=document.createElement('div');p.className='line error';p.textContent=args.map(String).join(' ');output.appendChild(p)};try{${safeCode}\n}catch(error){console.error(error&&error.message?error.message:String(error))}</script></body></html>`;
    preview.srcdoc = srcdoc;
    status.textContent = 'Program ran in the sandbox';
  }

  function downloadCode() {
    const code = updateCode();
    const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ethan-code-block-program.js';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    status.textContent = 'JavaScript download prepared';
  }

  byId('blocklyRun').addEventListener('click', runProgram);
  byId('blocklyShowCode').addEventListener('click', () => {
    updateCode();
    status.textContent = 'JavaScript generated from your blocks';
    codePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  byId('blocklyDownload').addEventListener('click', downloadCode);
  byId('blocklyReset').addEventListener('click', () => loadPreset('hello'));
  document.querySelectorAll('[data-block-preset]').forEach((button) => {
    button.addEventListener('click', () => loadPreset(button.dataset.blockPreset));
  });

  workspace.addChangeListener((event) => {
    if (event && event.isUiEvent) return;
    updateCode();
    saveWorkspace();
  });

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object') {
      BlocklyLib.serialization.workspaces.load(saved, workspace);
      updateCode();
      status.textContent = 'Your saved blocks are ready';
    } else {
      loadPreset('hello');
    }
  } catch (error) {
    loadPreset('hello');
  }

  window.addEventListener('resize', () => {
    try { BlocklyLib.svgResize(workspace); } catch (error) {}
  });
  if (fallback) fallback.classList.add('hidden');
  status.textContent = 'Ready — connect your blocks';
})();
