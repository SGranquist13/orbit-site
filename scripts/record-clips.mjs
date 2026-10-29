// Real browser-UI clips. Start the Orbit mock on :1420 first.
// node scripts/record-clips.mjs ide|voice|review
// FFMPEG may name a full ffmpeg binary. Without one, Playwright's VP9 encoder
// creates WebM and Chromium transcodes those same frames to H.264 MP4.
// Voice requires usable Windows System.Speech voices; failure never creates a fake clip.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import sharp from 'sharp';

const clip = process.argv[2];
if (!['voice', 'ide', 'review'].includes(clip)) throw new Error('Usage: node scripts/record-clips.mjs voice|ide|review');
const duration = clip === 'voice' ? 16 : clip === 'review' ? 18 : 22;
const work = path.resolve('media/clips-work', `${clip}-${Date.now()}`);
fs.mkdirSync(work, {recursive:true});
const base = path.resolve('media', `${clip}-trim`);
const candidates = [process.env.FFMPEG, 'ffmpeg'].filter(Boolean);
let fullFfmpeg;
for (const candidate of candidates) {
  try {
    const encoders = execFileSync(candidate, ['-hide_banner', '-encoders'], {encoding:'utf8',stdio:['ignore','pipe','ignore'],timeout:4000});
    if (encoders.includes('libx264') && encoders.includes('libvpx-vp9')) { fullFfmpeg = candidate; break; }
  } catch { /* Try the bundled, limited encoder below. */ }
}
const pwRoot = path.join(process.env.LOCALAPPDATA, 'ms-playwright');
const bundled = fs.readdirSync(pwRoot).filter(n=>n.startsWith('ffmpeg-')).sort().reverse()
  .map(n=>path.join(pwRoot,n,'ffmpeg-win64.exe')).find(p=>fs.existsSync(p));
const ffmpeg = fullFfmpeg ?? bundled;
console.log('Encoder:',ffmpeg);
if (!ffmpeg) throw new Error('Set FFMPEG to a usable ffmpeg executable.');

let wav;
if (clip === 'voice') {
  wav = path.join(work,'speech.wav');
  const ps = path.join(work,'speech.ps1');
  fs.writeFileSync(ps, `$ErrorActionPreference = 'Stop'\nAdd-Type -AssemblyName System.Speech\n$s = New-Object System.Speech.Synthesis.SpeechSynthesizer\ntry {\n$s.Rate = 2\n$s.SetOutputToWaveFile('${wav.replaceAll("'", "''")}')\n$s.SpeakSsml('<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><break time="1500ms"/>Add a loading spinner to the sidebar while workspaces load.<break time="10000ms"/><break time="10000ms"/><break time="10000ms"/></speak>')\n} finally { $s.Dispose() }\n`);
  try { execFileSync('powershell.exe',['-NoProfile','-File',ps],{stdio:'inherit'}); }
  catch { throw new Error('Voice capture blocked: Windows System.Speech could not generate speech. No simulated voice states or output clips were created.'); }
  if (fs.statSync(wav).size < 1000) throw new Error('SAPI produced no speech samples.');
}

// Headless Chromium has no speechSynthesis voices, so the voice clip runs headed to show read-aloud.
// One prompt, then silence: the fake mic loops the file and must not start a second turn mid-clip.
const browser = await chromium.launch({headless: clip !== 'voice', args: clip === 'voice' ? [
  '--force-device-scale-factor=2','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream',
  `--use-file-for-fake-audio-capture=${wav}`,
] : []});
const frames = [], evidence = [];
let origin = 0;
try {
  const context = await browser.newContext({viewport:{width:1200,height:750},deviceScaleFactor:clip==='voice'?1:2,colorScheme:'dark'});
  const page = await context.newPage();
  await page.addInitScript(()=>{const original=window.setInterval.bind(window);window.setInterval=(f,t,...a)=>t===12000?0:original(f,t,...a);});
  page.on('pageerror',e=>evidence.push({at:(Date.now()-origin)/1000,error:e.message}));
  page.on('console',m=>{if(m.text().startsWith('[voice]')) evidence.push({at:(Date.now()-origin)/1000,voice:m.text()});});
  const wait=ms=>page.waitForTimeout(ms);
  await page.goto(`http://localhost:1420/${clip==='voice'?'?seed=launch&ws=w1':''}`);
  await wait(2000);
  if (clip==='review') {
    // Review view with the Orbit sidebar collapsed, so the diff gets the width.
    await page.keyboard.press('Control+b'); await wait(300);
    await page.keyboard.press('Alt+6'); await wait(800);
    await page.locator('[data-testid="review-pr-842"]').waitFor();
    await page.evaluate(async()=>{const {api}=await import('/src/lib/ipc.ts');await api.updateSettings({reviewDiffLayout:'unified'});});
  } else if (clip==='ide') {
    await page.keyboard.press('Control+b'); await wait(300); await page.keyboard.press('Alt+2'); await wait(500);
    if(await page.getByText('Open a folder or a workspace').count()) await page.getByText('Fix onboarding crash',{exact:true}).last().click();
    await page.locator('.cm-editor').first().waitFor({state:'attached'}); await wait(1000);
  } else {
    await page.evaluate(async()=>{
      const {api,voiceApi}=await import('/src/lib/ipc.ts');
      await voiceApi.download('base.en');
      await api.updateSettings({voiceTtsEngine:'system',voiceReadAloud:'handsfree',voiceSilenceMs:1000,voiceMinSpeechMs:400,voiceBargeIn:true});
      await window.__orbitVoice.getState().refreshModels();
      localStorage.setItem('orbit.voice.setupDismissed','1');
    });
    await page.getByRole('button',{name:'Hands-free',exact:true}).waitFor();
    await page.locator('button:text-is("Goal") + button:text-is("Collapse")').first().click().catch(()=>{});await wait(300);
    await page.keyboard.press('Control+b');await wait(400);
    evidence.push({voices:await page.evaluate(()=>speechSynthesis.getVoices().map(v=>v.name))});
  }
  const cdp=await context.newCDPSession(page);
  cdp.on('Page.screencastFrame',f=>{
    const file=path.join(work,`${String(frames.length).padStart(5,'0')}.jpg`);
    fs.writeFileSync(file,Buffer.from(f.data,'base64'));
    frames.push({file,t:f.metadata.timestamp});
    void cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});
  });
  origin=Date.now();
  const mark=action=>{const event={at:+((Date.now()-origin)/1000).toFixed(2),action};evidence.push(event);console.log(event);};
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:2560,maxHeight:1600,everyNthFrame:1});
  if(clip==='review') {
    const num=(kind,n)=>page.locator(`[data-review-diff] .rv-row.rv-${kind}`).filter({has:page.locator('.rv-num',{hasText:new RegExp(`^${n}$`)})}).first().locator('.rv-num').nth(kind==='del'?0:1);
    await wait(500);mark('Open a pull request from the queue');
    await page.locator('[data-testid="review-pr-842"]').click();
    await page.locator('[data-review-diff="src/auth/session.ts"]').waitFor();await wait(1300);
    await page.locator('[data-review-diff]').locator('xpath=..').evaluate(el=>el.scrollTo({top:240,behavior:'smooth'}));await wait(900);
    mark('Select lines 16-19');
    await num('add',16).dispatchEvent('mousedown');await wait(350);
    await num('add',19).dispatchEvent('mousedown',{shiftKey:true});await wait(600);
    mark('Suggest a change');
    await page.getByRole('button',{name:'± Suggest change'}).click();await wait(400);
    const box=page.locator('[data-composer] textarea');
    await box.press('Control+Home');
    await page.keyboard.type('Refresh here too, so a session that expires mid-request is renewed.\n',{delay:22});
    await wait(400);mark('Add it to the review');
    await page.getByRole('button',{name:'Add review comment'}).click();await wait(1400);
    mark('Finish the review');
    await page.locator('[data-testid="review-submit-open"]').click();await wait(500);
    await page.keyboard.type('Nice work. One suggestion inline.',{delay:24});await wait(300);
    await page.getByText('Approve',{exact:true}).click();await wait(600);
    await page.locator('[data-testid="review-submit"]').click();
    mark('Submitted');await wait(1600);
    await page.locator('button[title="Split"]').click();mark('Split view');
  } else if(clip==='ide') {
    await wait(650);mark('Agent starts editing in Watch mode');
    await page.evaluate(()=>window.dispatchEvent(new CustomEvent('orbit-simulate-agent-edit')));
    await wait(14000);
    mark('Edit complete; gutter and timeline remain visible');
    await wait(350);await page.keyboard.press('Control+`');await wait(500);
    mark('Terminal opens');
    await page.locator('.xterm-helper-textarea').last().focus();
    await page.keyboard.type('ls',{delay:110});await page.keyboard.press('Enter');mark('Run ls in the mock shell');
  } else {
    mark('Enable hands-free');await page.getByRole('button',{name:'Hands-free',exact:true}).click();
  }
  await wait(Math.max(0,duration*1000-(Date.now()-origin)));
  if(clip==='voice') {
    const state=await page.evaluate(()=>({error:window.__orbitVoice.getState().error,heard:window.__orbitVoice.getState().handsFree.heard}));
    evidence.push(state);
    if(state.error || !evidence.some(e=>e.voice?.includes('hands-free: heard'))) throw new Error('No real VAD/transcription cycle completed; refusing to publish a voice clip.');
  }
  mark('Loop ends');
  await cdp.send('Page.stopScreencast');
  fs.writeFileSync(path.join(work,'evidence.json'),JSON.stringify(evidence,null,2));
  if(!frames.length) throw new Error('No screencast frames received.');

  // CDP only emits changed frames. Repeat frames at 30 fps using their real timestamps.
  // Voice frames are 2560x1600 (headed at 2x); crop to the chat column, hands-free bar and composer.
  const crop='scale=1920:1200';
  // Screencast frames are full-range JPEG; browsers need TV-range yuv420p or they fail to decode.
  const vf=`${crop}:out_range=tv,format=yuv420p`;
  async function encode(out,args){
    const proc=spawn(ffmpeg,['-y','-loglevel','error','-f','image2pipe','-r','30','-vcodec','mjpeg','-i','pipe:0','-vf',vf,...args,'-an',out],{stdio:['pipe','ignore','pipe']});
    let errors='';proc.stderr.on('data',d=>errors+=d);const done=new Promise((resolve,reject)=>{proc.on('error',reject);proc.on('close',code=>code===0?resolve():reject(new Error(errors)));});
    let at=0;
    for(let i=0;i<duration*30;i++){
      const time=frames[0].t+i/30;
      while(at+1<frames.length && frames[at+1].t<=time) at++;
      if(!proc.stdin.write(fs.readFileSync(frames[at].file))) await once(proc.stdin,'drain');
    }
    proc.stdin.end();await done;
  }
  await encode(`${base}.webm`,['-c:v','libvpx-vp9','-crf','34','-b:v','0']);
  if(fullFfmpeg) await encode(`${base}.mp4`,['-c:v','libx264','-crf','23','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart']);
  else {
    // Transcode the already-recorded WebM, never the app DOM. No audio track is added.
    const transcode=await browser.newPage({viewport:{width:1920,height:1200}});
    await transcode.route('http://clip.local/input.webm',r=>r.fulfill({contentType:'video/webm',body:fs.readFileSync(`${base}.webm`)}));
    await transcode.route('http://clip.local/',r=>r.fulfill({contentType:'text/html',body:'<video muted playsinline src="/input.webm"></video>'}));
    await transcode.goto('http://clip.local/');
    const bytes=await transcode.evaluate(async()=>{
      const v=document.querySelector('video');await new Promise(r=>{if(v.readyState>=2)r();else v.onloadeddata=r;});
      const mime='video/mp4;codecs=avc1.42001f';
      if(!MediaRecorder.isTypeSupported(mime)) throw new Error('Set FFMPEG to a full build: H.264 is unavailable.');
      const stream=v.captureStream();const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:1800000});
      const chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);
      const result=new Promise(resolve=>recorder.onstop=async()=>resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()))));
      recorder.start();v.onended=()=>recorder.stop();await v.play();return result;
    });
    fs.writeFileSync(`${base}.mp4`,Buffer.from(bytes));await transcode.close();
  }
  let poster=sharp(frames[Math.min(frames.length-1,Math.floor(frames.length*0.4))].file);
  await poster.resize(1920,1200).jpeg({quality:85}).toFile(`media/${clip}-poster.jpg`);
  console.log('Evidence:',path.join(work,'evidence.json'));
  for(const file of [`${base}.mp4`,`${base}.webm`,path.resolve(`media/${clip}-poster.jpg`)]) console.log(file,fs.statSync(file).size,'bytes');
} finally {await browser.close();}
