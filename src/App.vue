<script setup>
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { annotate } from './phonetics.js'

const text = ref('春天來了，一起去看花。')
const size = ref(64)
const annotationMode = ref('dual')
const showPinyin = computed(() => ['dual', 'pinyin'].includes(annotationMode.value))
const showZhuyin = computed(() => annotationMode.value !== 'pinyin')
const zhuyinAbove = computed(() => annotationMode.value === 'zhuyin-top')
const hasTopReading = computed(() => showPinyin.value || zhuyinAbove.value)
const colorFields = [
  { key: 'character', label: '文字', defaultColor: 'text-black' },
  { key: 'pinyin', label: '拼音', defaultColor: 'text-leaf' },
  { key: 'zhuyin', label: '注音', defaultColor: 'text-sound' },
]
const palette = [
  { label: '黑色', color: 'text-black' },
  { label: '灰色', color: 'text-slate-600' },
  { label: '草綠色', color: 'text-leaf' },
  { label: '灰綠色', color: 'text-sound' },
  { label: '紅色', color: 'text-red-700' },
  { label: '橙色', color: 'text-orange-700' },
  { label: '綠色', color: 'text-emerald-700' },
  { label: '藍色', color: 'text-blue-700' },
  { label: '紫色', color: 'text-violet-700' },
]
const colors = ref(Object.fromEntries(colorFields.map(({ key, defaultColor }) => [key, defaultColor])))
const formatOptions = [
  { label: '粗體', icon: 'B', className: 'font-bold' },
  { label: '斜體', icon: 'I', className: 'italic' },
]
const formats = ref(Object.fromEntries(colorFields.map(({ key }) => [key, []])))

function toggleFormat(key, className) {
  const active = formats.value[key]
  formats.value[key] = active.includes(className)
    ? active.filter(item => item !== className)
    : [...active, className]
}

const customColors = ref({ character: '#000000', pinyin: '#567b5b', zhuyin: '#6c7665' })
const customColorClasses = {
  character: 'text-(--character-color)',
  pinyin: 'text-(--pinyin-color)',
  zhuyin: 'text-(--zhuyin-color)',
}
const previewColors = computed(() => ({
  '--character-color': customColors.value.character,
  '--pinyin-color': customColors.value.pinyin,
  '--zhuyin-color': customColors.value.zhuyin,
}))

function selectCustomColor(key, event) {
  customColors.value[key] = event.target.value
  colors.value[key] = customColorClasses[key]
}

const input = useTemplateRef('input')
const editor = useTemplateRef('editor')
const edits = ref({})
const editing = ref(null)
const draft = ref('')
const characters = computed(() => annotate(text.value).map((item, index) => ({
  ...item,
  ...edits.value[index],
})))
const fieldLabel = computed(() => editing.value?.field === 'pinyin' ? '拼音' : '注音')

watch(text, () => {
  edits.value = {}
  editor.value?.close()
})

async function editReading(index, field) {
  const item = characters.value[index]
  editing.value = { index, field, char: item.char }
  draft.value = field === 'pinyin' ? item.pinyin : item.zhuyin.symbols + item.zhuyin.tone
  await nextTick()
  editor.value.showModal()
}

function saveReading() {
  const { index, field } = editing.value
  let reading = draft.value.trim()
  if (field === 'zhuyin') {
    const tone = reading.match(/[ˉˊˇˋ˙]/u)?.[0] || ''
    reading = {
      symbols: reading.replace(/[ˉˊˇˋ˙]/u, ''),
      tone: tone === 'ˉ' ? '' : tone,
      neutral: tone === '˙',
    }
  }
  edits.value[index] = { ...edits.value[index], [field]: reading }
  editor.value.close()
}
function clear() {
  text.value = ''
  input.value?.focus()
}
function printPage() { window.print() }

async function downloadCharacter(event, char) {
  const group = event.currentTarget.parentElement
  await document.fonts.ready

  const bounds = group.getBoundingClientRect()
  const padding = 8
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil((bounds.width + padding * 2) * 2)
  canvas.height = Math.ceil((bounds.height + padding * 2) * 2)
  const context = canvas.getContext('2d')
  context.scale(2, 2)
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width / 2, canvas.height / 2)
  context.textBaseline = 'alphabetic'

  for (const element of group.querySelectorAll('[data-export-text]')) {
    const value = element.textContent.trim()
    if (!value) continue

    const range = document.createRange()
    range.selectNodeContents(element)
    const box = range.getBoundingClientRect()
    const style = getComputedStyle(element)
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    context.fillStyle = style.color
    const metrics = context.measureText(value)
    const baseline = (box.height + metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2
    context.fillText(value, box.left - bounds.left + padding, box.top - bounds.top + baseline + padding)
  }

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `${char}.png`
  link.click()
}
</script>

<template>
<div class="m-0 font-sans text-ink bg-page print:bg-white min-h-screen">
<header class="h-[88px] max-[650px]:h-[72px] border-b border-line px-[6%] flex items-center justify-between bg-page print:hidden"><a class="flex items-center gap-3 text-[21px] font-bold text-inherit no-underline" href="./"><span class="grid place-items-center bg-brand text-white rounded-[11px] w-[39px] h-[41px]">字</span>字字有聲<span class="text-xs font-normal border-l border-line pl-3 ml-1 text-muted">華語雙拼編輯器</span></a></header>
<main class="max-w-[1120px] mx-auto px-[30px] pt-[58px] pb-[50px] max-[650px]:px-4 max-[650px]:py-[35px] print:max-w-none print:p-0">

<section class="bg-white border border-line rounded-2xl px-[25px] py-[22px] max-[650px]:p-[18px] shadow-sm print:hidden" aria-labelledby="input-title"><div class="flex justify-between items-center text-sm font-medium"><label id="input-title" for="text">輸入文字，下面就會<strong>出現標記拼音、注音的文字</strong></label><span class="text-[11px] text-muted font-normal" id="count">{{ Array.from(text).length }} / 200 字</span></div><textarea v-model="text" ref="input" class="block resize-y min-h-[95px] w-full border-0 bg-transparent pt-[17px] pb-2.5 text-[21px] leading-[1.6] text-ink outline-none focus:shadow-[0_2px_#87a990]" id="text" maxlength="200" placeholder="在這裡輸入華語" spellcheck="false"></textarea><div class="border-t border-line/40 pt-3.5 flex justify-between items-center gap-3"><div class="flex items-center gap-2 flex-wrap"><span class="text-[11px] text-muted mr-1.5 max-[650px]:hidden">試試看</span><button class="cursor-pointer border border-line bg-page px-3 py-1.5 rounded-md text-leaf text-[11px] hover:bg-line focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-4" @click="text = '你好，世界。'">你好世界</button><button class="cursor-pointer border border-line bg-page px-3 py-1.5 rounded-md text-leaf text-[11px] hover:bg-line focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-4" @click="text = '床前明月光，疑是地上霜。'">一首小詩</button><button class="cursor-pointer border border-line bg-page px-3 py-1.5 rounded-md text-leaf text-[11px] hover:bg-line focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-4" @click="text = '宣'">圖片範例：宣</button></div><button class="cursor-pointer border border-line bg-page px-3 py-1.5 rounded-md text-leaf text-[11px] hover:bg-line focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-4 border-0 bg-transparent text-muted" id="clear" @click="clear">清空</button></div></section>
<section class="mt-7 border border-line rounded-2xl overflow-hidden bg-white print:border-0 print:mt-0 print:rounded-none" aria-labelledby="preview-title"><div class="p-5 px-6 flex items-center justify-between border-b border-line/60 gap-4 max-[650px]:items-start max-[650px]:flex-col max-[650px]:p-[18px] print:hidden"><div class="flex items-center gap-4"><h2 class="text-sm m-0 font-medium" id="preview-title">標音預覽</h2><span class="text-[10px] text-muted flex items-center gap-1.5"><i class="w-[5px] h-[5px] rounded-full bg-leaf"></i>即時產生</span>
  </div><div class="flex flex-wrap items-center gap-3">
    <select v-model="annotationMode" aria-label="標音方式" class="rounded-md border border-line bg-white px-2 py-1.5 text-[11px] text-leaf focus-visible:outline-2 focus-visible:outline-leaf">
      <option value="dual">雙拼</option>
      <option value="pinyin">只顯示拼音（上方）</option>
      <option value="zhuyin-top">只顯示注音（上方）</option>
      <option value="zhuyin-right">只顯示注音（右側）</option>
    </select>
    <div class="flex items-center gap-4 max-[650px]:gap-3 text-[11px] text-muted"><label for="size">字級</label><input class="w-[85px] accent-leaf focus-visible:outline-2 focus-visible:outline-leaf" id="size" v-model.number="size" type="range" min="64" max="180"><output class="w-[23px] font-pinyin" id="size-value" for="size">{{ size }}</output>
    <details class="relative z-20">
      <summary class="cursor-pointer list-none whitespace-nowrap rounded-md border border-line px-3 py-1.5 text-leaf hover:bg-page focus-visible:outline-2 focus-visible:outline-leaf">文字樣式</summary>
      <div class="absolute right-0 top-full mt-2 w-64 space-y-3 rounded-xl border border-line bg-white p-3 text-ink shadow-lg">
        <fieldset v-for="field in colorFields" :key="field.key">
          <legend class="mb-1.5 font-medium">{{ field.label }}</legend>
          <div class="flex gap-1">
            <button
              v-for="option in formatOptions"
              :key="option.className"
              type="button"
              class="grid size-6 cursor-pointer place-items-center rounded border border-line hover:bg-page aria-pressed:border-leaf aria-pressed:bg-page focus-visible:outline-2 focus-visible:outline-leaf"
              :class="option.className"
              :aria-pressed="formats[field.key].includes(option.className)"
              :aria-label="field.label + '：' + option.label"
              :title="option.label"
              @click="toggleFormat(field.key, option.className)"
            >{{ option.icon }}</button>
          </div>
          <div class="mt-1.5 grid grid-cols-10 gap-0.5">
            <button
              v-for="option in palette"
              :key="option.color"
              type="button"
              class="grid size-5 cursor-pointer place-items-center rounded border border-transparent aria-pressed:border-current focus-visible:outline-2 focus-visible:outline-offset-1"
              :class="option.color"
              :aria-pressed="colors[field.key] === option.color"
              :aria-label="field.label + '：' + option.label"
              :title="option.label"
              @click="colors[field.key] = option.color"
            ><span class="size-3 rounded-full bg-current"></span></button>
            <input
              type="color"
              class="size-5 cursor-pointer rounded border border-line focus-visible:outline-2 focus-visible:outline-leaf"
              :class="{ 'outline-1 outline-leaf': colors[field.key] === customColorClasses[field.key] }"
              :value="customColors[field.key]"
              :aria-label="'自訂' + field.label + '顏色'"
              title="自訂顏色"
              @input="selectCustomColor(field.key, $event)"
            >
          </div>
        </fieldset>
      </div>
    </details>
    </div>
  </div></div><div class="relative min-h-[300px] px-8 py-10 flex flex-wrap content-start items-start gap-x-[18px] gap-y-7 max-[650px]:px-[18px] max-[650px]:py-[30px] max-[650px]:gap-x-3 max-[650px]:gap-y-6 print:p-0 print:gap-6" :class="[`text-[${size}px]`, colors.character]" :style="previewColors" id="result" aria-label="華語標音預覽">
<template v-for="(item, index) in characters" :key="index">
  <div v-if="item.char === '\n'" class="basis-full h-0"></div>
  <span v-else-if="/\s/u.test(item.char)" class="text-[1em] leading-[1.12] w-[.4em]" :class="{ 'mt-[.36em]': hasTopReading }">&nbsp;</span>
  <span v-else-if="!item.zhuyin" class="hover:outline hover:outline-offset-2 hover:outline-leaf print:outline-none text-[.65em] leading-[1.12]" :class="[formats.character, hasTopReading && 'pt-[.615385em]']">{{ item.char }}</span>
  <span v-else class="group hover:has-[>[data-character]:hover]:outline hover:has-[>[data-download]:hover]:outline has-[>[data-download]:focus-visible]:outline outline-offset-2 outline-leaf print:outline-none inline-grid text-[1em] relative print:break-inside-avoid"
    :class="[
      showZhuyin && !zhuyinAbove ? 'grid-cols-[minmax(1em,max-content)_.46em]' : 'grid-cols-[minmax(1em,max-content)]',
      hasTopReading ? 'grid-rows-[.36em_1.12em]' : 'grid-rows-[1.12em]',
    ]">
    <button v-if="showPinyin" data-export-text type="button" class="cursor-pointer hover:outline hover:outline-offset-2 hover:outline-leaf print:outline-none focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-leaf font-pinyin text-[.255em] text-center justify-self-center self-start whitespace-nowrap row-start-1 col-start-1 leading-[1.2]" :class="[colors.pinyin, formats.pinyin]" :aria-label="`編輯「${item.char}」的拼音：${item.pinyin}`" @click="editReading(index, 'pinyin')">{{ item.pinyin }}</button>
    <span data-export-text data-character class="col-start-1 justify-self-center text-[1em] leading-[1.12]" :class="[formats.character, hasTopReading ? 'row-start-2' : 'row-start-1']">{{ item.char }}</span>
    <button v-if="showZhuyin" type="button" class="cursor-pointer hover:outline hover:outline-offset-2 hover:outline-leaf print:outline-none focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-leaf relative items-center text-[.23em]" :class="[
      colors.zhuyin,
      formats.zhuyin,
      zhuyinAbove
        ? 'row-start-1 col-start-1 flex self-start justify-self-center'
        : 'col-start-2 grid grid-cols-[1em_.65em] gap-x-[.12em] self-center pl-[.08em] text-left',
      !zhuyinAbove && (hasTopReading ? 'row-start-2' : 'row-start-1'),
      !zhuyinAbove && item.zhuyin.neutral && 'pt-[.85em] -mt-[.85em]',
    ]" :aria-label="`編輯「${item.char}」的注音：${item.zhuyin.symbols}${item.zhuyin.tone}`" @click="editReading(index, 'zhuyin')">
      <span class="flex leading-[1.2]" :class="{ 'flex-col': !zhuyinAbove }"><span data-export-text v-for="(symbol, symbolIndex) in item.zhuyin.symbols" :key="symbolIndex">{{ symbol }}</span></span>
      <span data-export-text class="text-[.8em] leading-none text-center" :class="item.zhuyin.neutral && (zhuyinAbove ? 'order-first' : 'absolute top-0 left-[.1em] w-[1.25em]')">{{ item.zhuyin.tone }}</span>
    </button>
    <button
      type="button"
      data-download
      class="absolute bottom-1 left-1 z-10 grid size-7 cursor-pointer place-items-center rounded border border-leaf bg-white text-lg leading-none text-brand opacity-0 group-hover:group-has-[>[data-character]:hover]:opacity-100 hover:opacity-100 focus-visible:opacity-100 print:hidden"
      :aria-label="`下載「${item.char}」的 PNG`"
      title="下載 PNG"
      @click="downloadCharacter($event, item.char)"
    >↓</button>
  </span>
</template>
<p class="pointer-events-none absolute inset-0 m-0 grid place-items-center px-6 text-center text-[13px] text-muted empty:hidden print:hidden" id="status" role="status">{{ text.trim() ? '' : '輸入一些文字，讓文字開始發聲。' }}</p>
</div><div class="px-6 py-[15px] border-t border-dashed border-line/60 flex flex-wrap items-center gap-x-[22px] gap-y-2 text-muted text-[10px] print:hidden"><span v-if="showPinyin" class="flex items-center gap-[7px]"><i class="w-1.5 h-1.5 rounded-full inline-block bg-leaf"></i>上方：拼音</span><span v-if="showZhuyin" class="flex items-center gap-[7px]"><i class="w-1.5 h-1.5 rounded-full inline-block bg-sand"></i>{{ zhuyinAbove ? '上方' : '右側' }}：注音符號</span><button class="cursor-pointer border border-line px-3 py-1.5 rounded-md text-leaf text-[11px] hover:bg-line focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-4 bg-white ml-auto shrink-0 whitespace-nowrap" id="print" @click="printPage">列印 / PDF ↗</button></div></section>
<p class="text-[11px] text-muted text-center mt-[19px] max-[650px]:leading-[1.8] print:hidden">多音字依上下文自動判讀，特殊人名與地名請再確認讀音，並可以透過編輯器手動編輯。</p>
<dialog ref="editor" class="inset-0 m-auto w-[calc(100%-2rem)] max-w-88 rounded-2xl border border-line bg-white p-5 text-ink backdrop:bg-ink/30 print:hidden" aria-labelledby="reading-title">
  <form v-if="editing" @submit.prevent="saveReading">
    <label id="reading-title" for="reading">編輯「{{ editing.char }}」的{{ fieldLabel }}</label>
    <input
      id="reading"
      class="mt-3 block w-full rounded-md border border-leaf px-3 py-2"
      :key="editing.field"
      v-model="draft"
      type="text"
      required
      autofocus
      spellcheck="false"
      :pattern="editing.field === 'zhuyin' ? '(?:˙[ㄅ-ㄩ]{1,3}|[ㄅ-ㄩ]{1,3}[ˉˊˇˋ˙]?)' : '[\\p{Script=Latin}\\p{Mark}]+[0-5]?'"
      :title="editing.field === 'zhuyin' ? '請輸入注音符號及聲調，例如 ㄏㄠˇ 或 ˙ㄉㄜ' : '請輸入拼音，例如 hǎo 或 hao3'"
    >
    <div class="mt-4 flex justify-end gap-2">
      <button type="button" class="cursor-pointer rounded-md border border-line px-3 py-1.5" @click="editor.close()">取消</button>
      <button type="submit" class="cursor-pointer rounded-md border border-line bg-brand px-3 py-1.5 text-white">儲存</button>
    </div>
  </form>
</dialog>
</main><footer class="max-w-[1060px] mx-auto border-t border-line py-6 text-center text-muted text-[10px] max-[650px]:mx-[18px] print:hidden"><a class="hover:underline" href="https://github.com/ianwu5205/mandarin-annotator" target="_blank" rel="noopener noreferrer">字字有聲</a> <a class="hover:underline" href="./changes.html">v0.0.3</a></footer>
</div>
</template>
