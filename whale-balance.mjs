import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PLUGIN_DIR = path.dirname(fileURLToPath(import.meta.url))

// Resolve the whale image relative to this plugin's own directory first, so the
// whole bundle works anywhere it is dropped (e.g. the profile dir) with no
// configuration. Legacy absolute paths remain as harmless fallbacks.
const IMAGE_CANDIDATES = [
  path.join(PLUGIN_DIR, 'DSniang02.png'),
  path.join(PLUGIN_DIR, 'whale.png'),
  'D:/TestBox/deepseek/DSniang02.png',
  'D:/TestBox/deepseek/skin/DSniang02.png',
]

// Size memory file: next to this plugin, then legacy fallbacks.
const AUDIO_PATH = path.join(PLUGIN_DIR, 'dagou_loud.mp3')

const SIZE_FILE_CANDIDATES = [
  path.join(PLUGIN_DIR, '.dshw-size.json'),
  'D:/TestBox/deepseek/.dshw-size.json',
  'D:/TestBox/deepseek/skin/.dshw-size.json',
]

const BALANCE_URL = 'https://api.deepseek.com/user/balance'
const BALANCE_TTL_MS = 25000

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store',
}

const WIDGET_JS = `(function () {
if (window.__dshWhaleWidget) return
window.__dshWhaleWidget = true

var MIN_SCALE = 0.6
var MAX_SCALE = 1.4
var STEP = 0.1
var CLICK_SQ = 9
var REFRESH_MS = 60000
var CHANGE_MS = 900
var ANIM_MS = 700
var FETCH_TIMEOUT_MS = 25000
var BALANCE_URL = '/dsh-whale/balance.json'
var SIZE_URL = '/dsh-whale/size.json'
var IMG_URL = '/dsh-whale/image.png'

var css = [
  '.dshwv-root{position:fixed;right:0;bottom:0;--dshw-scale:1;--dshw-base:clamp(96px,calc(min(196px,min(100vw,100vh) * 0.22) * var(--dshw-scale)),292px);width:var(--dshw-base);height:var(--dshw-base);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;z-index:9999;font-family:inherit;transition:left .16s ease,top .16s ease,transform .3s ease}',
  '.dshwv-root.dshwv-left{transform:scaleX(-1)}',
  '.dshwv-root.dshwv-dragging{cursor:grabbing;transition:none}',
  '.dshwv-body{position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:50% 100%;transition:transform .22s cubic-bezier(.34,1.56,.64,1)}',
  '.dshwv-img{width:var(--dshw-base);height:var(--dshw-base);display:block;pointer-events:none;-webkit-user-drag:none;user-select:none}',
  '.dshwv-text{position:absolute;left:44.346%;top:25.5%;transform:translate(-50%,-50%);text-align:center;color:#536ba9;line-height:1.18;white-space:nowrap;--dshw-u:calc(var(--dshw-base) / 1026);pointer-events:none;transition:transform .3s ease}',
  '.dshwv-root.dshwv-left .dshwv-text{transform:translate(-50%,-50%) scaleX(-1)}',
  '.dshwv-label{font-size:calc(var(--dshw-u) * 68);font-weight:600;letter-spacing:.06em}',
  '.dshwv-amount{font-size:calc(var(--dshw-u) * 119);font-weight:800;line-height:1.05}',
  '.dshwv-hint{font-size:calc(var(--dshw-u) * 54);color:#9fb0d9;letter-spacing:.02em}',
  '.dshwv-size{position:absolute;top:4px;right:4px;display:flex;gap:4px;opacity:0;transition:opacity .15s ease;z-index:2}',
  '.dshwv-root:hover .dshwv-size{opacity:1}',
  '.dshwv-size button{width:20px;height:20px;border:none;border-radius:50%;background:rgba(83,107,169,.85);color:#fff;font-size:13px;line-height:1;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;user-select:none}',
  '.dshwv-size button:hover{background:#536ba9}',
  '.dshwv-panel{position:fixed;z-index:10000;width:236px;background:rgba(21,25,38,.97);border:1px solid #536ba9;border-radius:12px;padding:12px;color:#e8ecf5;font-size:12px;line-height:1.55;box-shadow:0 8px 28px rgba(0,0,0,.5);display:none;font-family:inherit;-webkit-user-select:none;user-select:none}',
  '.dshwv-panel hd{display:flex;align-items:center;gap:8px;margin-bottom:8px}',
  '.dshwv-panel hd span{flex:1;font-weight:700;color:#cfe0ff}',
  '.dshwv-panel hd button{background:transparent;border:none;color:#9fb0d9;cursor:pointer;font-size:14px;line-height:1;padding:2px 4px}',
  '.dshwv-panel .row{display:flex;align-items:center;gap:8px;margin-top:8px}',
  '.dshwv-panel .row.gap4{gap:4px}',
  '.dshwv-panel .amt{font-weight:800;color:#fff;font-size:15px}',
  '.dshwv-panel .sub{color:#9fb0d9}',
  '.dshwv-panel .sep{height:1px;background:rgba(83,107,169,.35);margin:10px 0 2px}',
  '.dshwv-panel button{background:transparent;border:1px solid rgba(83,107,169,.8);border-radius:8px;color:#cfe0ff;cursor:pointer;font-size:12px;line-height:1;padding:4px 10px}',
  '.dshwv-panel button.on{background:rgba(83,107,169,.55);color:#fff}',
  '.dshwv-panel button:hover{background:rgba(83,107,169,.35)}',
  '.dshwv-panel input[type=range]{flex:1;accent-color:#536ba9}',
  '.dshwv-panel input[type=text]{width:100%;box-sizing:border-box;margin-top:8px;background:rgba(0,0,0,.35);border:1px solid rgba(83,107,169,.6);border-radius:6px;color:#e8ecf5;font-size:11px;padding:4px 6px}'
].join('\\n')

var styleEl = document.createElement('style')
styleEl.textContent = css
document.head.appendChild(styleEl)

var root = document.createElement('div')
root.className = 'dshwv-root'

var img = document.createElement('img')
img.className = 'dshwv-img'
img.src = IMG_URL
img.alt = 'DeepSeek 余额'
img.draggable = false

var sizeBox = document.createElement('div')
sizeBox.className = 'dshwv-size'
function makeBtn(text, title, delta) {
  var b = document.createElement('button')
  b.type = 'button'
  b.textContent = text
  b.title = title
  b.addEventListener('pointerdown', function (e) { e.stopPropagation() })
  b.addEventListener('click', function (e) { e.stopPropagation(); adjust(delta) })
  return b
}
sizeBox.appendChild(makeBtn('-', '缩小', -STEP))
sizeBox.appendChild(makeBtn('+', '放大', STEP))

var textBox = document.createElement('div')
textBox.className = 'dshwv-text'
var labelEl = document.createElement('div')
labelEl.className = 'dshwv-label'
labelEl.textContent = 'DeepSeek 余额'
var amountEl = document.createElement('div')
amountEl.className = 'dshwv-amount'
var hintEl = document.createElement('div')
hintEl.className = 'dshwv-hint'
textBox.appendChild(labelEl)
textBox.appendChild(amountEl)
textBox.appendChild(hintEl)

var body = document.createElement('div')
body.className = 'dshwv-body'
body.appendChild(img)
body.appendChild(sizeBox)
body.appendChild(textBox)
root.appendChild(body)
document.body.appendChild(root)

// ---------- dashu-notify integration: settings panel ----------
var panel = document.createElement('div')
panel.className = 'dshwv-panel'

// header
var panelHd = document.createElement('hd')
var panelTitle = document.createElement('span')
panelTitle.textContent = '🐋 DeepSeek 小鲸鱼'
var panelClose = document.createElement('button')
panelClose.type = 'button'
panelClose.textContent = '×'
panelClose.title = '关闭'
panelHd.appendChild(panelTitle)
panelHd.appendChild(panelClose)
panel.appendChild(panelHd)

// balance row
var panelBalRow = document.createElement('div')
panelBalRow.className = 'row'
var panelAmount = document.createElement('span')
panelAmount.className = 'amt'
panelAmount.textContent = '--'
var panelRefresh = document.createElement('button')
panelRefresh.type = 'button'
panelRefresh.textContent = '刷新'
panelRefresh.title = '刷新余额'
panelBalRow.appendChild(panelAmount)
panelBalRow.appendChild(panelRefresh)
panel.appendChild(panelBalRow)
var panelHint = document.createElement('div')
panelHint.className = 'sub'
panelHint.textContent = '60 秒自动刷新'
panel.appendChild(panelHint)

// divider
var panelSep = document.createElement('div')
panelSep.className = 'sep'
panel.appendChild(panelSep)

// notify header
var notifyHd = document.createElement('div')
notifyHd.className = 'row'
var notifyTitle = document.createElement('span')
notifyTitle.style.flex = '1'
notifyTitle.textContent = '任务完成提醒'
var notifyToggle = document.createElement('button')
notifyToggle.type = 'button'
notifyHd.appendChild(notifyTitle)
notifyHd.appendChild(notifyToggle)
panel.appendChild(notifyHd)

// volume row
var volRow = document.createElement('div')
volRow.className = 'row gap4'
var volRange = document.createElement('input')
volRange.type = 'range'
volRange.min = '0'
volRange.max = '100'
volRange.value = '100'
var volLabel = document.createElement('span')
volLabel.className = 'sub'
volLabel.style.minWidth = '34px'
volLabel.style.textAlign = 'right'
volLabel.textContent = '100%'
volRow.appendChild(volRange)
volRow.appendChild(volLabel)
panel.appendChild(volRow)

// actions row
var actRow = document.createElement('div')
actRow.className = 'row gap4'
var actPreview = document.createElement('button')
actPreview.type = 'button'
actPreview.textContent = '试听'
var actUrl = document.createElement('button')
actUrl.type = 'button'
actRow.appendChild(actPreview)
actRow.appendChild(actUrl)
panel.appendChild(actRow)

// custom audio url input
var urlInput = document.createElement('input')
urlInput.type = 'text'
urlInput.placeholder = '音频 URL（留空 = 默认）'
panel.appendChild(urlInput)

document.body.appendChild(panel)
panel.style.display = 'none'
panelClose.addEventListener('click', function (e) { e.stopPropagation(); closePanel() })
panelRefresh.addEventListener('click', function (e) { e.stopPropagation(); refresh(true) })


// Position model: the widget is ALWAYS expressed in left/top px (so edge snaps
// animate smoothly via the CSS transition on both sides — switching to
// right/auto cannot transition and flashes). The anchor info (h/v + offsets)
// lives in state and is used by settle() to recompute coordinates on window
// resize and size changes, keeping the widget glued to its anchored edge.
var state = {
  scale: 1,
  h: 'right',
  hOff: 0,
  v: 'bottom',
  vOff: 0,
  left: 0,
  top: 0,
  balance: null,
  currency: null,
  status: 'loading',
  message: ''
}
var busy = false
var settleTimer = null
var drag = null
var shown = null
var animId = null

function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v) }
function viewport() {
  return {
    w: window.innerWidth || document.documentElement.clientWidth || 1280,
    h: window.innerHeight || document.documentElement.clientHeight || 800
  }
}
function fmt(balance, currency) {
  var num = Number(balance)
  var fixed = isFinite(num) ? num.toFixed(2) : '--'
  return currency === 'CNY' ? '¥ ' + fixed : fixed + ' ' + currency
}
function animateAmount(from, to, currency, duration) {
  if (animId) cancelAnimationFrame(animId)
  if (from === null || !isFinite(from)) from = to
  if (from === to) {
    shown = to
    amountEl.textContent = fmt(to, currency)
    return
  }
  var startTime = null
  function step(ts) {
    if (startTime === null) startTime = ts
    var t = Math.min(1, (ts - startTime) / duration)
    var eased = 1 - Math.pow(1 - t, 3)
    var val = from + (to - from) * eased
    amountEl.textContent = fmt(val, currency)
    if (t < 1) {
      animId = requestAnimationFrame(step)
    } else {
      animId = null
      shown = to
      amountEl.textContent = fmt(to, currency)
    }
  }
  animId = requestAnimationFrame(step)
}
function render() {
  var amount, hint
  if (state.status === 'loading') {
    amount = shown !== null ? fmt(shown, state.currency) : '…'
    hint = '加载中…'
  } else if (state.status === 'error') {
    amount = shown !== null ? fmt(shown, state.currency) : '--'
    hint = state.message ? state.message.slice(0, 14) : '获取失败 · 点击重试'
  } else {
    amount = shown !== null ? fmt(shown, state.currency) : (state.balance !== null ? fmt(state.balance, state.currency) : '--')
    hint = state.status === 'changing' ? '加载中…' : '点击刷新'
  }
  amountEl.textContent = amount
  hintEl.textContent = hint
  if (panelAmount) panelAmount.textContent = amount
  if (panelHint) panelHint.textContent = hint
}
function express() {
  root.style.right = 'auto'
  root.style.bottom = 'auto'
  root.style.left = state.left + 'px'
  root.style.top = state.top + 'px'
  root.classList.toggle('dshwv-left', state.h === 'left')
}
function settle() {
  var vp = viewport()
  var w = root.offsetWidth || root.getBoundingClientRect().width || 0
  var h = root.offsetHeight || root.getBoundingClientRect().height || 0
  if (drag && drag.active) {
    // mid-drag resize: keep the pointer-follow position, just clamp into view
    state.left = clamp(state.left, 0, Math.max(0, vp.w - w))
    state.top = clamp(state.top, 0, Math.max(0, vp.h - h))
    express()
    return
  }
  if (state.h === 'right') {
    state.left = Math.max(0, vp.w - w - state.hOff)
  } else if (state.h === 'left') {
    state.left = state.hOff
  } else {
    state.left = clamp(state.left, 0, Math.max(0, vp.w - w))
  }
  if (state.v === 'bottom') {
    state.top = Math.max(0, vp.h - h - state.vOff)
  } else if (state.v === 'top') {
    state.top = state.vOff
  } else {
    state.top = clamp(state.top, 0, Math.max(0, vp.h - h))
  }
  express()
}
function refresh(manual) {
  if (busy) return
  busy = true
  if (manual || state.balance === null) { state.status = 'loading'; render() }
  var ctrl = null
  var timer = null
  try {
    ctrl = new AbortController()
    timer = setTimeout(function () { try { ctrl.abort() } catch (err) {} }, FETCH_TIMEOUT_MS)
  } catch (err) {}
  fetch(BALANCE_URL, { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
    .then(function (r) { return r.json() })
    .then(function (data) {
      if (data && data.ok) {
        var nb = Number(data.totalBalance)
        var nc = String(data.currency || 'CNY')
        var changed = state.balance !== null && (nb !== state.balance || nc !== state.currency)
        var currencyChanged = state.currency !== null && nc !== state.currency
        state.balance = nb
        state.currency = nc
        state.message = ''
        if (changed && !currencyChanged) {
          if (!manual) {
            state.status = 'changing'
            animateAmount(shown, nb, nc, ANIM_MS)
            if (settleTimer) clearTimeout(settleTimer)
            settleTimer = setTimeout(function () {
              settleTimer = null
              if (state.status === 'changing') { state.status = 'ok'; render() }
            }, CHANGE_MS)
          } else {
            animateAmount(shown, nb, nc, ANIM_MS)
            state.status = 'ok'
            render()
          }
        } else {
          if (animId === null) shown = nb
          state.status = 'ok'
          render()
        }
      } else {
        state.status = 'error'
        state.message = (data && data.error) ? String(data.error) : '获取失败'
        render()
      }
    })
    .catch(function () {
      state.status = 'error'
      state.message = '获取失败'
      render()
    })
    .finally(function () {
      busy = false
      if (timer) clearTimeout(timer)
    })
}
function adjust(delta) {
  var next = Math.round(Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.scale + delta)) * 10) / 10
  state.scale = next
  root.style.setProperty('--dshw-scale', String(next))
  try {
    fetch(SIZE_URL, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scale: next }) })
  } catch (err) {}
  settle()
}
var SQUISH = 'scaleY(0.88) scaleX(1.05)'
function pressDown() {
  body.style.transform = SQUISH
}
function pressUp() {
  body.style.transform = 'scaleY(1) scaleX(1)'
}
function onPointerDown(e) {
  closePanel()
  if (e.button !== 0) return
  try { root.setPointerCapture(e.pointerId) } catch (err) {}
  var vp = viewport()
  var rect = root.getBoundingClientRect()
  drag = { active: true, startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top, w: rect.width, h: rect.height, moved: false, vp: vp }
  root.classList.add('dshwv-dragging')
  pressDown()
}
function onPointerMove(e) {
  if (!drag || !drag.active) return
  var dx = e.clientX - drag.startX
  var dy = e.clientY - drag.startY
  if (dx * dx + dy * dy >= CLICK_SQ) drag.moved = true
  // Keep the pre-drag flip orientation while dragging (state.h/v stay as they
  // were); on release endDrag() recomputes the anchors and settle() flips the
  // class with a smooth transition instead of reverting instantly.
  state.left = clamp(drag.origLeft + dx, 0, Math.max(0, drag.vp.w - drag.w))
  state.top = clamp(drag.origTop + dy, 0, Math.max(0, drag.vp.h - drag.h))
  express()
}
function endDrag(e, clickAllowed) {
  if (!drag || !drag.active) return
  drag.active = false
  pressUp()
  root.classList.remove('dshwv-dragging')
  try {
    if (root.hasPointerCapture && root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId)
  } catch (err) {}
  if (clickAllowed && !drag.moved) { togglePanel(); return }
  var dx = e.clientX - drag.startX
  var dy = e.clientY - drag.startY
  var left = clamp(drag.origLeft + dx, 0, Math.max(0, drag.vp.w - drag.w))
  var top = clamp(drag.origTop + dy, 0, Math.max(0, drag.vp.h - drag.h))
  var centerX = left + drag.w / 2
  var centerY = top + drag.h / 2
  if (centerX < drag.vp.w / 4) {
    state.h = 'left'
    state.hOff = 0
  } else if (centerX > drag.vp.w * 3 / 4) {
    state.h = 'right'
    state.hOff = 0
  } else {
    state.h = null
    state.hOff = left
  }
  if (centerY < drag.vp.h / 4) {
    state.v = 'top'
    state.vOff = 0
  } else if (centerY > drag.vp.h * 3 / 4) {
    state.v = 'bottom'
    state.vOff = 0
  } else {
    state.v = null
    state.vOff = top
  }
  state.left = left
  state.top = top
  settle()
}
root.addEventListener('pointerdown', onPointerDown)
root.addEventListener('pointermove', onPointerMove)
root.addEventListener('pointerup', function (e) { endDrag(e, true) })
root.addEventListener('pointercancel', function (e) { endDrag(e, false) })
window.addEventListener('resize', function () {
  settle()
})

var rect0 = root.getBoundingClientRect()
state.left = rect0.left
state.top = rect0.top
express()
render()
fetch(SIZE_URL, { cache: 'no-store' })
  .then(function (r) { return r.json() })
  .then(function (d) {
    if (d && typeof d.scale === 'number' && d.scale >= MIN_SCALE - 0.1 && d.scale <= MAX_SCALE + 0.1) {
      state.scale = d.scale
      root.style.setProperty('--dshw-scale', String(d.scale))
      settle()
    }
    refresh(false)
  })
  .catch(function () { refresh(false) })
// ---------- dashu-notify integration: settings + completion polling ----------
var NOTIFY_ENABLED_KEY = 'dashu-notify:enabled'
var NOTIFY_VOLUME_KEY = 'dashu-notify:volume'
var NOTIFY_URL_KEY = 'dashu-notify:url'
var DEFAULT_AUDIO_URL = '/dsh-whale/audio.mp3'
var POLL_URL = '/dsh-whale/poll'
var POLL_MS = 1500

function readNotify() {
  var st = { enabled: true, volume: 1, url: DEFAULT_AUDIO_URL }
  try {
    st.enabled = localStorage.getItem(NOTIFY_ENABLED_KEY) !== '0'
    var v = parseFloat(localStorage.getItem(NOTIFY_VOLUME_KEY) || '')
    if (isFinite(v) && v >= 0 && v <= 1) st.volume = v
    var u = localStorage.getItem(NOTIFY_URL_KEY)
    if (typeof u === 'string' && u.trim() !== '') st.url = u.trim()
  } catch (e) {}
  return st
}
function writeNotify(key, value) {
  try { localStorage.setItem(key, String(value)) } catch (e) {}
}

var previewAudio = null
function stopPreview() {
  if (previewAudio !== null) {
    try { previewAudio.pause() } catch (e) {}
    previewAudio = null
  }
}
function togglePreview() {
  if (previewAudio !== null) { stopPreview(); return }
  var st = readNotify()
  if (!st.enabled) return
  try {
    var a = new Audio(st.url || DEFAULT_AUDIO_URL)
    a.volume = st.volume
    previewAudio = a
    a.addEventListener('ended', function () { if (previewAudio === a) previewAudio = null })
    a.play().catch(function () { if (previewAudio === a) previewAudio = null })
  } catch (e) { previewAudio = null }
}
function playNotify() {
  stopPreview()
  var st = readNotify()
  if (!st.enabled) return
  try {
    var a = new Audio(st.url || DEFAULT_AUDIO_URL)
    a.volume = st.volume
    a.play().catch(function () {})
  } catch (e) {}
}

// ---- panel controls ----
function syncPanel() {
  var st = readNotify()
  notifyToggle.textContent = st.enabled ? '开' : '关'
  notifyToggle.className = st.enabled ? 'on' : ''
  volRange.value = String(Math.round(st.volume * 100))
  volLabel.textContent = Math.round(st.volume * 100) + '%'
  actUrl.textContent = st.url === DEFAULT_AUDIO_URL ? '默认音频' : '自定义音频'
  urlInput.value = st.url === DEFAULT_AUDIO_URL ? '' : st.url
}
function positionPanel() {
  var rect = root.getBoundingClientRect()
  var vp = viewport()
  var pw = 236
  var left = clamp(rect.left + rect.width / 2 - pw / 2, 8, Math.max(8, vp.w - pw - 8))
  panel.style.left = left + 'px'
  var above = vp.h - rect.top + 10
  if (above > vp.h - 80) above = vp.h - rect.bottom - rect.height - 10
  panel.style.bottom = Math.max(8, above) + 'px'
  panel.style.right = 'auto'
}
function openPanel() {
  syncPanel()
  panel.style.display = 'block'
  positionPanel()
}
function closePanel() {
  panel.style.display = 'none'
}
function togglePanel() {
  if (panel.style.display === 'none') openPanel(); else closePanel()
}

notifyToggle.addEventListener('click', function (e) {
  e.stopPropagation()
  var st = readNotify()
  st.enabled = !st.enabled
  writeNotify(NOTIFY_ENABLED_KEY, st.enabled ? '1' : '0')
  syncPanel()
})
volRange.addEventListener('input', function (e) {
  var v = Number(e.target.value) / 100
  writeNotify(NOTIFY_VOLUME_KEY, String(v))
  volLabel.textContent = Math.round(v * 100) + '%'
})
actPreview.addEventListener('click', function (e) { e.stopPropagation(); togglePreview() })
actUrl.addEventListener('click', function (e) {
  e.stopPropagation()
  var st = readNotify()
  urlInput.value = st.url === DEFAULT_AUDIO_URL ? '' : st.url
  urlInput.focus()
})
urlInput.addEventListener('change', function (e) {
  var trimmed = e.target.value.trim()
  if (trimmed === '') {
    try { localStorage.removeItem(NOTIFY_URL_KEY) } catch (err) {}
  } else {
    writeNotify(NOTIFY_URL_KEY, trimmed)
  }
  syncPanel()
})
urlInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') urlInput.blur()
})

// ---- completion polling ----
var seenDoneAt = 0
var doneBaseline = false
setInterval(function () {
  fetch(POLL_URL, { cache: 'no-store' })
    .then(function (r) { return r.json() })
    .then(function (d) {
      var doneAt = d && typeof d.doneAt === 'number' ? d.doneAt : 0
      if (!doneBaseline) { doneBaseline = true; seenDoneAt = doneAt; return }
      if (doneAt > seenDoneAt) { seenDoneAt = doneAt; playNotify() }
    })
    .catch(function () {})
}, POLL_MS)

setInterval(function () { refresh(false) }, REFRESH_MS)
})()`

export default {
  name: 'whale-balance-widget',
  inject: ['webServer', 'credentials'],
  apply(ctx) {
    let imageBytes = null
    let balanceCache = null
    let balanceInFlight = null

    function loadImage() {
      if (imageBytes) return imageBytes
      for (const p of IMAGE_CANDIDATES) {
        try {
          const bytes = fs.readFileSync(p)
          if (bytes && bytes.length > 0) {
            imageBytes = bytes
            return bytes
          }
        } catch (err) {}
      }
      throw new Error('whale image not found')
    }

    async function fetchBalance() {
      let cred
      try {
        cred = await ctx.credentials.resolve('DEEPSEEK_API_KEY')
      } catch (err) {
        return { ok: false, code: 'NO_KEY', error: '凭据读取失败: ' + String((err && err.message) || err).slice(0, 160) }
      }
      if (!cred) {
        return { ok: false, code: 'NO_KEY', error: '未配置 DEEPSEEK_API_KEY' }
      }
      let lastErr = null
      for (let attempt = 0; attempt < 2; attempt++) {
        let res
        try {
          res = await fetch(BALANCE_URL, {
            headers: { Authorization: 'Bearer ' + cred.value },
            signal: AbortSignal.timeout(20000),
          })
        } catch (err) {
          lastErr = err
          if (attempt === 0) await new Promise((r) => setTimeout(r, 500))
          continue
        }
        if (!res.ok) {
          lastErr = new Error('HTTP ' + res.status)
          if (res.status < 500) break
          if (attempt === 0) await new Promise((r) => setTimeout(r, 500))
          continue
        }
        let data
        try {
          data = await res.json()
        } catch (err) {
          return { ok: false, code: 'PARSE', error: '余额接口返回不是合法 JSON' }
        }
        const info = data && Array.isArray(data.balance_infos) ? data.balance_infos[0] : null
        if (!info || info.total_balance === undefined) {
          return { ok: false, code: 'SHAPE', error: '余额接口返回结构异常' }
        }
        return {
          ok: true,
          totalBalance: Number(info.total_balance),
          currency: String(info.currency || 'CNY'),
          updatedAt: new Date().toISOString(),
        }
      }
      const transient = !(lastErr && /^HTTP 4\d\d/.test(lastErr.message))
      return {
        ok: false,
        code: 'HTTP',
        transient: transient,
        error: '余额接口请求失败: ' + String((lastErr && lastErr.message) || lastErr).slice(0, 200),
      }
    }

    function getBalance() {
      const now = Date.now()
      if (balanceCache && now - balanceCache.at < BALANCE_TTL_MS) {
        return Promise.resolve(balanceCache.payload)
      }
      if (balanceInFlight) return balanceInFlight
      balanceInFlight = fetchBalance()
        .then((payload) => {
          if (payload.ok) {
            balanceCache = { at: now, payload }
            return payload
          }
          if (payload.transient && balanceCache) {
            // transient network/API blip: keep serving the last known balance
            return { ...balanceCache.payload, stale: true, error: payload.error }
          }
          if (!payload.transient) console.error('[whale-balance]', payload.code, payload.error)
          return payload
        })
        .catch((err) => ({
          ok: false,
          code: 'ERROR',
          error: '余额服务异常: ' + String((err && err.message) || err).slice(0, 200),
        }))
        .finally(() => {
          balanceInFlight = null
        })
      return balanceInFlight
    }

    function readSizeConfig() {
      for (const p of SIZE_FILE_CANDIDATES) {
        try {
          const parsed = JSON.parse(fs.readFileSync(p, 'utf8'))
          if (parsed && typeof parsed.scale === 'number') return { scale: parsed.scale }
        } catch (err) {}
      }
      return null
    }

    function writeSizeConfig(scale) {
      const body = JSON.stringify({ scale: scale, updatedAt: new Date().toISOString() })
      for (const p of SIZE_FILE_CANDIDATES) {
        try {
          fs.writeFileSync(p, body, 'utf8')
          return { ok: true, scale: scale }
        } catch (err) {}
      }
      return { ok: false, error: '无法持久化挂件尺寸' }
    }

    function readBody(req) {
      return new Promise((resolve, reject) => {
        const chunks = []
        let size = 0
        req.on('data', (c) => {
          size += c.length
          if (size > 8192) {
            reject(new Error('body too large'))
            req.destroy()
            return
          }
          chunks.push(c)
        })
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
        req.on('error', reject)
      })
    }

    const disposers = []

    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-whale/image.png',
      handler: (req, res) => {
        try {
          const bytes = loadImage()
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600',
            'Content-Length': String(bytes.length),
          })
          res.end(bytes)
        } catch (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end('whale image unavailable: ' + String((err && err.message) || err))
        }
      },
    }))

    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-whale/balance.json',
      handler: async (req, res) => {
        try {
          const payload = await getBalance()
          res.writeHead(200, JSON_HEADERS)
          res.end(JSON.stringify(payload))
        } catch (err) {
          res.writeHead(200, JSON_HEADERS)
          res.end(JSON.stringify({ ok: false, code: 'ERROR', error: String((err && err.message) || err).slice(0, 200) }))
        }
      },
    }))

    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-whale/size.json',
      handler: async (req, res) => {
        if (req.method === 'PUT' || req.method === 'POST') {
          try {
            const body = await readBody(req)
            const parsed = JSON.parse(body)
            const scale = typeof parsed.scale === 'number' ? parsed.scale : null
            if (scale === null) {
              res.writeHead(400, JSON_HEADERS)
              res.end(JSON.stringify({ ok: false, error: 'missing scale' }))
              return
            }
            const result = writeSizeConfig(scale)
            res.writeHead(result.ok ? 200 : 500, JSON_HEADERS)
            res.end(JSON.stringify(result))
          } catch (err) {
            res.writeHead(400, JSON_HEADERS)
            res.end(JSON.stringify({ ok: false, error: String((err && err.message) || err) }))
          }
          return
        }
        res.writeHead(200, JSON_HEADERS)
        res.end(JSON.stringify(readSizeConfig() || {}))
      },
    }))

    // Task-completion signal: every turn/end in the session event stream.
    let lastDoneAt = 0
    const offEvents = ctx.on('session/event', (session, event) => {
      if (event && typeof event.type === 'string' && event.type === 'turn/end') {
        lastDoneAt = Date.now()
      }
    })
    disposers.push(offEvents)

    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-whale/audio.mp3',
      handler: (req, res) => {
        try {
          const bytes = fs.readFileSync(AUDIO_PATH)
          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-store',
            'Access-Control-Allow-Origin': '*',
            'Content-Length': String(bytes.length),
          })
          res.end(bytes)
        } catch (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end('audio not found: ' + String((err && err.message) || err))
        }
      },
    }))

    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-whale/poll',
      handler: (req, res) => {
        res.writeHead(200, JSON_HEADERS)
        res.end(JSON.stringify({ doneAt: lastDoneAt }))
      },
    }))

    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-whale/widget.js',
      handler: (req, res) => {
        res.writeHead(200, {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'no-store',
        })
        res.end(WIDGET_JS)
      },
    }))

    disposers.push(ctx.webServer.tapIndex((html) => {
      if (html.indexOf('/dsh-whale/widget.js') !== -1) return html
      const tag = '<script defer src="/dsh-whale/widget.js"></script>'
      if (html.indexOf('</body>') !== -1) return html.replace('</body>', tag + '</body>')
      return html + tag
    }))

    ctx.effect(() => () => {
      for (const d of disposers) {
        try { d() } catch (err) {}
      }
    })
  },
}
