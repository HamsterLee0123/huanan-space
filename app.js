(function startApp() {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const dialog = $("#dialog");
  const content = $("#dialog-content");
  const iconPaths = {
    lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.6 1.6m10.8 10.8L19 19M5 19l1.6-1.6M17.4 6.6 19 5"/>',
    pause: '<circle cx="12" cy="12" r="9"/><path d="M10 9v6m4-6v6"/>',
    heart: '<path d="M20.5 5.8a5.2 5.2 0 0 0-7.4 0L12 7l-1.1-1.2a5.2 5.2 0 0 0-7.4 7.3L12 21l8.5-7.9a5.2 5.2 0 0 0 0-7.3Z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-13 5 2 2 4-4"/>',
    anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M8 10h8M3 14c1 5 5 7 9 7s8-2 9-7M3 14l.2 4m-.2-4 3 2m15-2-.2 4m.2-4-3 2"/>',
    map: '<path d="m3 5 6-2 6 3 6-2v15l-6 2-6-3-6 2zM9 3v15m6-12v15"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m2-15a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 4v2"/>',
    book: '<path d="M4 4h13a2 2 0 0 1 2 2v15H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm-.5 14h15M8 8h7m-7 4h5"/>',
    pencil: '<path d="m4 16-1 5 5-1L20 8l-4-4Zm9-9 4 4"/>',
    chat: '<path d="M21 12a8.5 8.5 0 0 1-9 8.5 10 10 0 0 1-4-.8L3 21l1.3-4.7A9 9 0 1 1 21 12Z"/><path d="M8 12h.1m3.9 0h.1m3.9 0h.1"/>',
    shield: '<path d="m12 2 8 4v6c0 5-5 9-8 10-3-1-8-5-8-10V6Zm-4 10 3 3 5-6"/>',
    headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="12" width="4.5" height="8" rx="2"/><rect x="16.5" y="12" width="4.5" height="8" rx="2"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>'
  };
  const tile = (icon, color) => `<span class="icon-tile ${color}"><i data-icon="${icon}"></i></span>`;
  function drawIcons(root) {
    root.querySelectorAll("i[data-icon]:empty").forEach(node => {
      node.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[node.dataset.icon] || ""}</svg>`;
      node.setAttribute("aria-hidden", "true");
    });
  }
  const moods = [
    {label:"很难受",bg:"#f7e9e3",ink:"#8a5142",mouth:"M8 17q4-6 8 0"},
    {label:"有点低落",bg:"#f7eedf",ink:"#856331",mouth:"M8 16q4-3.8 8 0"},
    {label:"一般",bg:"#f3f0dd",ink:"#766a30",mouth:"M8.5 15h7"},
    {label:"还不错",bg:"#e9f0df",ink:"#546d3b",mouth:"M8 14q4 5 8 0"},
    {label:"很平静",bg:"#e0eee8",ink:"#3c6b55",mouth:"M7.5 14q4.5 7 9 0"}
  ];
  function moodButtons(selected) {
    return moods.map((m,i) => `<button type="button" class="mood" style="--mood-bg:${m.bg};--mood-ink:${m.ink}" data-action="mood" data-mood="${i}" aria-pressed="${selected === i}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9.2"/><circle cx="8.6" cy="10" r=".9" fill="currentColor" stroke="none"/><circle cx="15.4" cy="10" r=".9" fill="currentColor" stroke="none"/><path d="${m.mouth}"/></svg><span>${m.label}</span></button>`).join("");
  }
  const prefix = "huanan:v1:";
  const dayPrefix = prefix + "day:";
  const planKey = prefix + "plan";
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  function dateKey(d = new Date()) {
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  }
  function prettyDate(key) {
    return new Date(key + "T12:00:00").toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
  }
  function read(key) {
    try {return JSON.parse(localStorage.getItem(key));} catch {return null;}
  }
  function entry(key) {
    const data = read(dayPrefix + key);
    return Number.isInteger(data?.mood) && moods[data.mood] ? data : null;
  }
  function listDates() {
    try {
      return Object.keys(localStorage).filter(k => k.startsWith(dayPrefix))
        .map(k => k.slice(dayPrefix.length)).filter(k => datePattern.test(k) && entry(k)).sort().reverse();
    } catch {return [];}
  }
  function save(key, value) {
    try {
      if(value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      $("#form-error").textContent = "浏览器无法保存这次更改。请检查是否允许网站存储，以及设备的可用空间。";
      return false;
    }
  }
  let toastTimer;
  function notify(message) {
    clearTimeout(toastTimer);
    $("#toast").textContent = message;
    toastTimer = setTimeout(() => $("#toast").textContent = "", 3200);
  }
  function updateDashboard() {
    const now = new Date();
    const today = dateKey(now);
    $("#today-date").textContent = now.toLocaleDateString("zh-CN",{month:"long",day:"numeric",weekday:"long"});
    $("#today-date").dateTime = today;
    const current = entry(today);
    $("#home-moods").innerHTML = moodButtons(current?.mood);
    $("#mood-hint").textContent = current ? `今天记录的心情是「${moods[current.mood].label}」。点选感受可以更新。` : "选一个最接近的感受，给今天留个记录。";
    const start = new Date(now.getFullYear(),now.getMonth(),now.getDate()-(now.getDay()+6)%7,12);
    let count = 0;
    const days = [];
    for(let i=0;i<7;i++) {
      const d=new Date(start);
      d.setDate(start.getDate()+i);
      const key=dateKey(d);
      const filled=Boolean(entry(key));
      if(filled) count++;
      const dayLabel = key===today ? "今天" : "周"+"一二三四五六日"[i];
      days.push(`<div class="week-day ${key===today?"today":""} ${filled?"filled":""}" aria-label="${key} ${dayLabel}，${filled?"已记录":"未记录"}"><span class="day-number">${d.getDate()}</span><span>${dayLabel}</span></div>`);
    }
    $("#week").innerHTML = days.join("");
    $("#week-count").textContent = count ? `这周已留下 ${count} 天的记录。` : "本周还没有记录，今天可以是第一天。";
    updateScreenHistory();
    const dates = listDates();
    $("#history-count").textContent = dates.length + " 天";
    const history = $("#history");
    history.replaceChildren();
    if(!dates.length) {
      history.innerHTML=`<div class="panel empty">${tile("book","green")}<h3>从今天的一句记录开始</h3><p>你保存的心情、触发情境和笔记会出现在这里。</p></div>`;
      drawIcons(history);
    }
    for(const key of dates) {
      const item = entry(key);
      if(!item) continue;
      const article = document.createElement("article");
      article.className = "history-item";
      article.innerHTML = `<div class="history-top"><h3>${prettyDate(key)} · ${moods[item.mood].label}</h3><button class="minor-link" data-action="edit" data-date="${key}">编辑记录</button></div>`;
      for(const [field,cls,label] of [["trigger","history-context","触发情境 · "],["note","history-note",""]]) {
        if(typeof item[field] !== "string" || !item[field]) continue;
        const p = document.createElement("p");
        p.className = cls;
        p.textContent = label + item[field];
        article.append(p);
      }
      history.append(article);
    }
  }
  function showPage(scroll = false) {
    const wanted = location.hash.slice(1);
    const page = ["today","meditation","assessment","journal","support"].includes(wanted) ? wanted : "today";
    document.querySelectorAll(".page").forEach(el => el.hidden = el.id !== page);
    document.querySelectorAll("nav a").forEach(a => {
      if(a.dataset.page === page) a.setAttribute("aria-current","page");
      else a.removeAttribute("aria-current");
    });
    updateDashboard();
    if(scroll) {$("#main").focus({preventScroll:true}); window.scrollTo(0,0);}
  }
  let ticker;
  function showDialog(markup) {
    clearInterval(ticker);
    content.querySelector("audio")?.pause();
    content.innerHTML = markup + '<div id="form-error" role="alert"></div>';
    drawIcons(content);
    if(!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    const heading = $("#dlg-title");
    heading.tabIndex = -1;
    heading.focus({preventScroll:true});
  }
  const heading = (icon,color,title) => tile(icon,color) + `<h2 id="dlg-title">${title}</h2>`;
  function finish(message) {
    dialog.close();
    updateDashboard();
    notify(message);
  }
  let draftDate;
  let draftMood;
  function checkin(key = dateKey(), mood) {
    draftDate = key;
    const data = entry(key);
    draftMood = mood ?? data?.mood;
    showDialog(heading("heart","peach",key===dateKey()?"今日记录":"编辑记录") + `<p>${prettyDate(key)}</p><form id="checkin-form"><div class="field-label" id="field-mood">此刻的心情</div><div id="form-moods" class="moods" role="group" aria-labelledby="field-mood">${moodButtons(draftMood)}</div><label for="trigger">触发情境 <small>（选填）</small></label><input id="trigger" type="text" maxlength="120" placeholder="例如：独处时收到一条投注推送"><label for="note">留给自己的一句话 <small>（选填）</small></label><textarea id="note" maxlength="1500" placeholder="刚才发生了什么？什么帮到了你？"></textarea><div class="actions"><button class="primary" type="submit">保存记录</button>${data?'<button class="minor-link" type="button" data-action="delete-entry">删除这条记录</button>':""}</div></form>`);
    $("#trigger").value = data?.trigger || "";
    $("#note").value = data?.note || "";
  }
  function plan() {
    const data = read(planKey);
    showDialog(heading("map","peach","我的应对计划") + `<p>挑一个常见的触发情境，给未来的自己留下一步具体行动。</p><form id="plan-form"><label for="situation">当我遇到……</label><input id="situation" type="text" required maxlength="200" placeholder="例如：发薪后想打开投注网站"><label for="response">我会先……</label><textarea id="response" required maxlength="500" placeholder="例如：关掉网页，下楼走一圈，再给朋友打电话"></textarea><div class="actions"><button type="submit" class="primary">保存计划</button></div></form>`);
    $("#situation").value = data?.situation || "";
    $("#response").value = data?.response || "";
  }
  const pauseSeconds = 180;
  let finishAt, remaining, running;
  const soundFiles = {
    noise: "assets/white-noise.mp3",
    music: "assets/quiet-piano.mp3"
  };

  function soundFailed(player) {
    if (!dialog.open || player !== $("#timer-audio") || !running) return;
    const selected = content.querySelector('input[name="timer-sound"]:checked');
    if (!soundFiles[selected?.value] || player.getAttribute("src") !== soundFiles[selected.value]) return;
    player.pause();
    $("#sound-off").checked = true;
    $("#sound-status").textContent = "声音暂时无法播放，计时仍在继续。可以重新选择声音再试一次。";
  }

  function updateTimerSound() {
    const player = $("#timer-audio");
    if (!player) return;
    const choice = content.querySelector('input[name="timer-sound"]:checked').value;
    const file = soundFiles[choice];
    $("#sound-status").textContent = "";
    if (!running || !file) {
      player.pause();
      return;
    }
    if (player.getAttribute("src") !== file || player.error) player.src = file;
    player.play().catch(error => {
      if (error.name !== "AbortError" && player.getAttribute("src") === file) soundFailed(player);
    });
  }

  function timer() {
    remaining = pauseSeconds;
    running = true;
    finishAt = Date.now()+remaining*1000;
    showDialog(heading("pause","green","三分钟缓冲") + `
      <p>先把投注、游戏或购物页面关上。现在只需要做眼前这一步。</p>
      <div class="timer-digits" id="time-left" role="timer" aria-label="剩余时间">03:00</div>
      <div class="timer-track" aria-hidden="true"><span id="time-progress"></span></div>
      <div id="timer-prompt" aria-live="polite"></div>
      <fieldset class="timer-sounds">
        <legend>背景声音</legend>
        <div class="sound-choices">
          <label><input type="radio" name="timer-sound" value="off" id="sound-off" checked>静音</label>
          <label><input type="radio" name="timer-sound" value="noise">白噪音</label>
          <label><input type="radio" name="timer-sound" value="music">轻音乐</label>
        </div>
      </fieldset>
      <audio id="timer-audio" preload="none" loop></audio>
      <div id="sound-status" role="status"></div>
      <div class="actions">
        <button class="primary" data-action="pause" id="pause-button">暂停计时</button>
        <button class="secondary" data-action="close">结束练习</button>
      </div>`);
    const player = $("#timer-audio");
    player.addEventListener("error", () => soundFailed(player));
    $(".timer-sounds").addEventListener("change", updateTimerSound);
    tick();
    ticker = setInterval(tick,250);
  }
  function tick() {
    if(!running) return;
    remaining = Math.max(0,Math.ceil((finishAt-Date.now())/1000));
    if(remaining===0) {
      running=false;
      showDialog(heading("pause","green","三分钟到了") + `<p>再留意一下身体的感觉。你可以把刚才的经历记下来，或者去做一件远离触发源的小事。</p><div class="actions"><button class="primary" data-action="checkin">记下此刻</button><button class="secondary" data-action="close">完成</button></div>`);
      return;
    }
    $("#time-left").textContent = `${String(Math.floor(remaining/60)).padStart(2,"0")}:${String(remaining%60).padStart(2,"0")}`;
    $("#time-progress").style.width = (1-remaining/pauseSeconds)*100+"%";
    const prompt = remaining>120 ? "双脚踩在地面上，按舒服的节奏呼吸。" : remaining>60 ? "留意冲动在身体里的位置，看看它有没有变化。" : "选一个接下来可以做的小动作，例如倒杯水或走到窗边。";
    if($("#timer-prompt").textContent!==prompt) $("#timer-prompt").textContent = prompt;
  }
  const steps = [
    ["看见五样东西","慢慢环顾四周，说出五样东西的名字和颜色。"],
    ["触摸四样东西","感受身边四种安全的触感，例如衣袖、桌面、椅背和地板。"],
    ["听见三种声音","听听近处和远处的声音，也可以留意自己的呼吸声。"],
    ["留意两种气味","如果周围气味很淡，可以回想两种熟悉的气味。"],
    ["留意一种味道","喝一小口水，或回想一种熟悉的味道，留意此刻的身体感受。"]
  ];
  let step;
  function ground(index=0) {
    step=index;
    showDialog(heading("anchor","blue","感官着陆") + `<div class="step-count">第 ${index+1} 步，共 5 步</div><div class="ground-task">${steps[index][0]}</div><p>${steps[index][1]}</p><div class="actions"><button class="primary" data-action="${index===4?"ground-done":"ground-next"}">${index===4?"完成练习":"下一步"}</button>${index?'<button class="secondary" data-action="ground-prev">上一步</button>':""}</div>`);
  }

  const screenPrefix = prefix + "screen:";
  const validRecordId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  function renderLibraries() {
    $("#guide-library").innerHTML = Object.entries(mindfulnessGuides).map(([id, guide]) => `
      <article class="panel practice-card">
        ${tile("headphones", "blue")}
        <h3>${guide.title}</h3><p>${guide.description}</p>
        <button class="secondary" data-action="guide" data-guide="${id}">播放${guide.title} · ${guide.duration}</button>
      </article>`).join("");
    for (const [id, screen] of Object.entries(behaviorScreens)) {
      const library = screen.pageSize ? $("#screen-library") : $("#quick-screen-library");
      library.insertAdjacentHTML("beforeend", `
      <article class="panel practice-card">
        <span class="count">${screen.short} · ${screen.items.length} 题</span>
        <h3>${screen.title}</h3><p>${screen.description}</p>
        <button class="secondary" data-action="screen" data-scale="${id}">开始${screen.short}问卷</button>
      </article>`);
    }
  }

  function openGuide(id) {
    const guide = mindfulnessGuides[id];
    showDialog(heading("headphones", "blue", guide.title) + `
      <p>普通话合成语音 · ${guide.duration}。引导之间留有安静的练习时间。</p>
      <audio id="guide-player" controls preload="metadata" aria-label="${guide.title}语音引导"></audio>
      <div id="guide-status" role="status"></div>
      <details class="transcript"><summary>阅读引导词</summary>${guide.transcript.map(line => `<p>${line}</p>`).join("")}</details>
      <div class="actions"><button class="secondary" data-action="close">结束练习</button></div>`);
    const player = $("#guide-player");
    const status = $("#guide-status");
    player.addEventListener("error", () => {status.textContent = "音频暂时无法加载。你可以展开引导词，或稍后重新打开练习。";});
    player.addEventListener("playing", () => {status.textContent = "";});
    player.addEventListener("ended", () => {status.textContent = "这段练习已完成。你可以再听一次，或结束练习。";});
    player.src = `assets/guide-${id}.mp3`;
    player.play().catch(error => {
      if (error.name === "NotAllowedError") status.textContent = "点播放器中的播放按钮开始。";
    });
  }

  function screenSources(screen) {
    return `<details class="screen-sources"><summary>问卷来源与评分依据</summary><p>${screen.credit}</p>
      <a class="text-link" href="${screen.source}" target="_blank" rel="noopener noreferrer">中文问卷</a> ·
      <a class="text-link" href="${screen.paper}" target="_blank" rel="noopener noreferrer">${screen.referenceLabel || "原始研究"}</a>
      ${screen.license ? ` · <a class="text-link" href="${screen.license}" target="_blank" rel="noopener noreferrer">CC BY-NC 4.0</a>` : ""}
      ${screen.scoring ? `<p>${screen.scoring}</p>` : ""}
      ${screen.short === "GDT" ? ' · <a class="text-link" href="https://www.halleypontes.com/tests/" target="_blank" rel="noopener noreferrer">作者的使用说明</a>' : ""}</details>`;
  }

  function openScreen(scale) {
    const screen = behaviorScreens[scale];
    const answers = Array(screen.items.length).fill(null);
    const size = screen.pageSize || screen.items.length;
    const pages = Math.ceil(answers.length / size);

    function renderPage(page) {
      const first = page * size;
      const last = Math.min(first + size, answers.length);
      const fields = screen.items.slice(first, last).map((question, i) => {
        const q = first + i;
        return `<fieldset class="screen-question"><legend>${q + 1}. ${question}</legend>
          <div class="answer-choices">${screen.options.map((label, index) => `
            <label><input type="radio" name="item-${q}" value="${index}" ${answers[q] === index ? "checked" : ""} required> ${label}</label>`).join("")}</div>
        </fieldset>`;
      }).join("");
      const progress = pages > 1 ? `<div class="quiz-progress"><span>第 ${page + 1} 页，共 ${pages} 页</span>
        <span>第 ${first + 1}–${last} 题 / 共 ${answers.length} 题</span></div>
        <progress class="quiz-meter" value="${answers.filter(Number.isInteger).length}" max="${answers.length}" aria-label="已答题数"></progress>` : "";
      showDialog(heading("book", "green", `${screen.name}（${screen.short}）`) + `
        ${page === 0 ? `<p>${screen.intro}</p>` : '<p>请继续回顾过去 12 个月的情况。</p>'}${progress}
        <form id="screen-form" data-scale="${scale}">${fields}
          ${page === pages - 1 ? '<p class="screen-note">完成后即可查看结果，再选择是否保存。</p>' : ""}
          <div class="actions">${page > 0 ? '<button type="button" id="previous-page" class="secondary">上一页</button>' : ""}
            <button class="primary" type="submit">${page === pages - 1 ? "查看本次结果" : "下一页"}</button></div>
        </form>${screenSources(screen)}`);
      const form = $("#screen-form");
      function rememberPage() {
        const data = new FormData(form);
        for (let i = first; i < last; i++) {
          answers[i] = data.has(`item-${i}`) ? Number(data.get(`item-${i}`)) : null;
        }
      }
      form.addEventListener("change", () => {
        rememberPage();
        const meter = content.querySelector(".quiz-meter");
        if (meter) meter.value = answers.filter(Number.isInteger).length;
      });
      $("#previous-page")?.addEventListener("click", () => {rememberPage(); renderPage(page - 1);});
      form.addEventListener("submit", event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        rememberPage();
        if (page + 1 < pages) renderPage(page + 1);
        else evaluateScreen(scale, answers);
      });
    }
    renderPage(0);
  }

  function scoreLabel(scale, score) {
    if (scale === "bbgs") return score > 0 ? "筛查提示风险" : "本次未检出风险信号";
    const screen = behaviorScreens[scale];
    const band = screen.bands?.find(b => score <= b.max);
    if (band) return `${score} / ${screen.maximum} 分 · ${band.label}`;
    return `${score} 分（范围 ${screen.minimum}–${screen.maximum}）`;
  }

  function describeScores(scale, score, points) {
    const screen = behaviorScreens[scale];
    if (screen.bands) {
      const band = screen.bands.find(b => score <= b.max);
      const ranges = screen.bands.map((b,i) => {
        const min = i ? screen.bands[i - 1].max + 1 : 0;
        return `<li${band === b ? ' class="current-band"' : ''}><span>${min === b.max ? min : `${min}–${b.max}`} 分</span>
          ${b.label}${band === b ? "（本次）" : ""}</li>`;
      }).join("");
      const reported = points.flatMap((value, i) => value > 0
        ? [`<li>${screen.topics[i]} · ${screen.options[value]}</li>`] : []);
      const impacts = reported.length ? `<h3>你在回答中提到的情况</h3><ul class="reported-impacts">${reported.join("")}</ul>` : "";
      return `<p>${band.guidance}</p><h3>分数怎么读</h3><ul class="band-list">${ranges}</ul>
        ${impacts}<p class="screen-note">区间反映过去一年的自报情况。临床诊断还需要了解具体经历和生活影响。</p>`;
    }
    if (screen.domains) {
      const rows = screen.domains.map(domain => {
        const sum = domain.items.reduce((total, n) => total + points[n - 1], 0);
        const mean = (sum / domain.items.length).toFixed(1);
        return `<div class="domain-row"><dt>${domain.name}<span>均分 ${mean} / 5</span></dt><dd>${domain.detail}</dd></div>`;
      }).join("");
      return `<p>${screen.scoring}</p><h3>五个维度的表现</h3>
        <p class="screen-note">各维度题数不同，以下列出每题平均分（1–5）。可以挑一个与你近况最相关的方面，回想一件具体的事。</p>
        <dl class="domain-list">${rows}</dl>
        <p>如果睡眠、学习、工作或关系持续受到影响，可以带着这些具体经历与心理健康专业人员讨论。</p>`;
    }
    if (scale === "gdt") return "<p>四题各计 1 到 5 分。总分越高，表示你报告的游戏相关困扰越多。如果游戏已影响生活或关系，可以带着结果找专业人员讨论。</p>";
    return score > 0
      ? `<p>你有 ${score} 项回答「是」。任一项回答「是」就提示值得进一步评估。可以把近期困扰你的赌博经历告诉心理、精神卫生或成瘾专科人员。</p>`
      : "<p>你对三题都回答了「否」。如果赌博仍让你担心，或已经影响财务和生活，仍然可以寻求支持。</p>";
  }

  function evaluateScreen(scale, answers) {
    const screen = behaviorScreens[scale];
    if (answers.length !== screen.items.length || !answers.every(n => Number.isInteger(n) && n >= 0 && n < screen.options.length)) return;
    const lowestItemScore = screen.minimum / screen.items.length;
    const points = answers.map((index, i) => {
      const adjusted = screen.reverse?.includes(i + 1) ? screen.options.length - 1 - index : index;
      return lowestItemScore + adjusted;
    });
    const score = points.reduce((total, n) => total + n, 0);
    const time = Date.now();
    const previous = getScreenRecords().find(item => item.scale === scale);
    const comparison = previous ? `<p class="screen-note">上次同量表结果 · ${recordDate(previous.time)} · ${scoreLabel(scale, previous.score)}。两次结果可能涵盖相同的经历。</p>` : "";
    showDialog(heading("book", "green", `${screen.short} 自评结果`) + `
      <div class="screen-score">${scoreLabel(scale, score)}</div>${describeScores(scale, score, points)}${comparison}
      <p class="screen-note">回顾期为过去 12 个月。你可以只查看结果，也可以把日期、量表名称和总结果保存在本机。逐题答案${screen.domains ? "和维度均分" : ""}不会写入记录。</p>
      <div class="actions"><button id="save-screen" class="primary">保存到我的记录</button>
        <button class="secondary" data-action="close">不保存并关闭</button></div>
      <a class="text-link result-support" href="#support">查看支持资源</a>${screenSources(screen)}`);
    const id = crypto.randomUUID();
    $("#save-screen").addEventListener("click", () => {
      if (save(screenPrefix + id, {scale, score, time})) finish("自评结果已保存在本机。");
    });
  }

  function getScreenRecords() {
    try {
      const records = [];
      for (const key of Object.keys(localStorage)) {
        if (!key.startsWith(screenPrefix)) continue;
        const id = key.slice(screenPrefix.length);
        const item = read(key);
        if (!validRecordId.test(id) || !item || !Object.hasOwn(behaviorScreens, item.scale)) continue;
        const screen = behaviorScreens[item.scale];
        if (!Number.isInteger(item.score) || item.score < screen.minimum || item.score > screen.maximum) continue;
        if (!Number.isSafeInteger(item.time) || Number.isNaN(new Date(item.time).getTime())) continue;
        records.push({id, scale:item.scale, score:item.score, time:item.time});
      }
      return records.sort((a,b) => b.time - a.time);
    } catch {return [];}
  }

  function recordDate(time) {
    return new Date(time).toLocaleString("zh-CN", {year:"numeric", month:"long", day:"numeric", hour:"2-digit", minute:"2-digit", hour12:false});
  }

  function updateScreenHistory() {
    const records = getScreenRecords();
    const summary = $("#screen-summary");
    if (!records.length) {
      summary.textContent = "还没有保存的自评结果。";
      $("#screen-history").innerHTML = '<div class="panel">还没有保存的自评结果。完成问卷后，点「保存到我的记录」，下次就能在这里回看。</div>';
      return;
    }
    const latest = records[0];
    summary.textContent = `最近一次 · ${recordDate(latest.time)} · ${behaviorScreens[latest.scale].short} · ${scoreLabel(latest.scale, latest.score)}`;
    const groups = [];
    for (const [scale, screen] of Object.entries(behaviorScreens)) {
      const matching = records.filter(item => item.scale === scale);
      if (!matching.length) continue;
      const rows = matching.map(item => `<li class="screen-row">
        <span><time datetime="${new Date(item.time).toISOString()}">${recordDate(item.time)}</time>
        <strong>${scoreLabel(scale, item.score)}</strong></span>
        <button class="minor-link" data-action="screen-remove" data-record="${item.id}" aria-label="删除 ${recordDate(item.time)} 的 ${screen.short} 结果">删除</button></li>`).join("");
      groups.push(`<section class="panel screen-group"><h3>${screen.title} · ${screen.short}</h3><ol>${rows}</ol></section>`);
    }
    $("#screen-history").innerHTML = groups.join("");
  }

  function confirmScreenRemoval(id) {
    const item = getScreenRecords().find(record => record.id === id);
    if (!item) return;
    showDialog(heading("book", "peach", "删除这次自评？") + `
      <p>将从本机删除 ${recordDate(item.time)} 的 ${behaviorScreens[item.scale].short} 结果。</p>
      <div class="actions"><button class="primary" data-action="close">保留结果</button>
      <button id="remove-screen" class="secondary danger">确认删除</button></div>`);
    $("#remove-screen").addEventListener("click", () => {
      if (save(screenPrefix + id, null)) finish("已删除这次自评结果。");
    });
  }

  function privacy() {
    showDialog(heading("lock","green","本地隐私") + `<p>你选择保存的自评结果、心情、笔记和应对计划仅保存在当前浏览器中，网站不会将这些内容上传。清理浏览器数据或离开无痕窗口时，记录可能会消失。</p><p>共用设备上的其他人可通过同一个浏览器查看记录。访问外部支持网站时，适用对方的隐私政策。</p><div class="actions"><button class="secondary danger" data-action="clear-prompt">清除本机缓岸数据</button></div>`);
  }
  document.addEventListener("submit", event => {
    event.preventDefault();
    if(event.target.id === "checkin-form") {
      if(!Number.isInteger(draftMood)) {
        $("#form-error").textContent = "请先选择一个心情。";
        $("#form-moods button").focus();
        return;
      }
      if(save(dayPrefix + draftDate,{mood:draftMood,trigger:$("#trigger").value.trim(),note:$("#note").value.trim()})) finish("这一天的记录已保存。");
    }
    if(event.target.id === "plan-form") {
      const situation = $("#situation").value.trim(), response = $("#response").value.trim();
      if(!situation || !response) {$("#form-error").textContent = "请写下触发情境和应对行动。";return;}
      if(save(planKey,{situation,response})) finish("应对计划已保存在本机。");
    }
  });
  document.addEventListener("click", async event => {
    const button = event.target.closest("[data-action]");
    if(!button) return;
    const action = button.dataset.action;
    switch(action) {
      case "close": dialog.close(); break;
      case "timer": timer(); break;
      case "guide": openGuide(button.dataset.guide); break;
      case "screen": openScreen(button.dataset.scale); break;
      case "screen-remove": confirmScreenRemoval(button.dataset.record); break;
      case "pause":
        if(running) {tick(); if(!remaining) break; running=false;}
        else {finishAt=Date.now()+remaining*1000; running=true;tick();}
        updateTimerSound();
        button.textContent = running ? "暂停计时" : "继续计时";
        break;
      case "mood":
        if(button.closest("#form-moods")) {
          draftMood = Number(button.dataset.mood);
          $("#form-moods").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed",String(b===button)));
          $("#form-error").textContent = "";
        } else checkin(dateKey(),Number(button.dataset.mood));
        break;
      case "checkin": checkin(); break;
      case "edit": checkin(button.dataset.date); break;
      case "plan": plan(); break;
      case "ground": ground(); break;
      case "ground-next": ground(step+1); break;
      case "ground-prev": ground(step-1); break;
      case "ground-done": finish("感官练习已完成。"); break;
      case "privacy": privacy(); break;
      case "delete-entry":
        showDialog(heading("book","peach","删除这条记录？")+`<p>${prettyDate(draftDate)}的记录将从这台设备删除，删除后无法恢复。</p><div class="actions"><button class="secondary" data-action="keep-entry">保留记录</button><button class="secondary danger" data-action="delete-confirm">确认删除</button></div>`);
        break;
      case "keep-entry": checkin(draftDate); break;
      case "delete-confirm": if(save(dayPrefix+draftDate,null)) finish("已删除这条记录。"); break;
      case "clear-prompt":
        showDialog(heading("lock","peach","清除缓岸数据？")+`<p>这会删除当前浏览器中的全部缓岸记录、自评结果和应对计划。清除后无法恢复。</p><div class="actions"><button class="primary" data-action="privacy">保留数据</button><button class="secondary danger" data-action="clear-confirm">确认清除</button></div>`);
        break;
      case "clear-confirm":
        try {
          Object.keys(localStorage).filter(k=>k.startsWith(prefix)).forEach(k=>localStorage.removeItem(k));
          finish("本机缓岸数据已清除。");
        } catch {$("#form-error").textContent="浏览器无法清除数据。请在浏览器的网站数据设置中检查。";}
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(document.querySelector("blockquote").textContent);
          notify("已复制，可以发给信任的人。");
        } catch {notify("请选中上面的文字并复制。");}
        break;
    }
  });
  dialog.addEventListener("close",()=>{
    if (dialog.open) return;
    clearInterval(ticker);
    running = false;
    content.querySelector("audio")?.pause();
    content.replaceChildren();
  });
  window.addEventListener("pagehide", () => {
    if (dialog.open && content.querySelector("audio")) {
      content.querySelector("audio").pause();
      dialog.close();
    }
  });
  window.addEventListener("hashchange",()=>{if(dialog.open) dialog.close();showPage(true);});
  window.addEventListener("storage",updateDashboard);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden) updateDashboard();});
  renderLibraries();
  drawIcons(document);
  showPage();
})();
