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
    const page = ["today","journal","support"].includes(wanted) ? wanted : "today";
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
    $("#timer-audio")?.pause();
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
  function privacy() {
    showDialog(heading("lock","green","本地隐私") + `<p>心情、笔记和应对计划仅保存在当前浏览器中，网站不会将这些内容上传。清理浏览器数据或离开无痕窗口时，记录可能会消失。</p><p>共用设备上的其他人可通过同一个浏览器查看记录。访问外部支持网站时，适用对方的隐私政策。</p><div class="actions"><button class="secondary danger" data-action="clear-prompt">清除本机缓岸数据</button></div>`);
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
        showDialog(heading("lock","peach","清除缓岸数据？")+`<p>这会删除当前浏览器中的全部缓岸记录和应对计划。清除后无法恢复。</p><div class="actions"><button class="primary" data-action="privacy">保留数据</button><button class="secondary danger" data-action="clear-confirm">确认清除</button></div>`);
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
    $("#timer-audio")?.pause();
  });
  window.addEventListener("pagehide", () => {
    if (dialog.open && $("#timer-audio")) {
      $("#timer-audio").pause();
      dialog.close();
    }
  });
  window.addEventListener("hashchange",()=>{if(dialog.open) dialog.close();showPage(true);});
  window.addEventListener("storage",updateDashboard);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden) updateDashboard();});
  drawIcons(document);
  showPage();
})();
