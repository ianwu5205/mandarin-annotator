<script setup>
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { annotate } from './phonetics.js'

const text = ref('春天來了，一起去看花。')
const size = ref(64)
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
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
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
<section class="mt-7 border border-line rounded-2xl overflow-hidden bg-white print:border-0 print:mt-0 print:rounded-none" aria-labelledby="preview-title"><div class="p-5 px-6 flex items-center justify-between border-b border-line/60 gap-4 max-[650px]:items-start max-[650px]:flex-col max-[650px]:p-[18px] print:hidden"><div class="flex items-center gap-4"><h2 class="text-sm m-0 font-medium" id="preview-title">雙音標預覽</h2><span class="text-[10px] text-muted flex items-center gap-1.5"><i class="w-[5px] h-[5px] rounded-full bg-leaf"></i>即時產生</span></div><div class="flex items-center gap-4 max-[650px]:gap-3 text-[11px] text-muted"><label for="size">字級</label><input class="w-[85px] accent-leaf focus-visible:outline-2 focus-visible:outline-leaf" id="size" v-model.number="size" type="range" min="64" max="180"><output class="w-[23px] font-pinyin" id="size-value" for="size">{{ size }}</output><button class="cursor-pointer border border-line bg-page px-3 py-1.5 rounded-md text-leaf text-[11px] hover:bg-line focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-4 bg-white ml-[5px]" id="print" @click="printPage">列印 / PDF ↗</button></div></div><div class="relative min-h-[300px] px-8 py-10 flex flex-wrap content-start items-start gap-x-[18px] gap-y-7 text-black max-[650px]:px-[18px] max-[650px]:py-[30px] max-[650px]:gap-x-3 max-[650px]:gap-y-6 print:p-0 print:gap-6" :class="`text-[${size}px]`" id="result" aria-label="華語拼音與注音預覽">
<template v-for="(item, index) in characters" :key="index">
  <div v-if="item.char === '\n'" class="basis-full h-0"></div>
  <span v-else-if="/\s/u.test(item.char)" class="text-[1em] leading-[1.12] mt-[.36em] w-[.4em]">&nbsp;</span>
  <span v-else-if="!item.zhuyin" class="hover:outline hover:outline-offset-2 hover:outline-leaf print:outline-none text-[.65em] leading-[1.12] pt-[.615385em]">{{ item.char }}</span>
  <span v-else class="group hover:has-[>[data-character]:hover]:outline hover:has-[>[data-download]:hover]:outline has-[>[data-download]:focus-visible]:outline outline-offset-2 outline-leaf print:outline-none inline-grid grid-cols-[minmax(1em,max-content)_.46em] grid-rows-[.36em_1.12em] text-[1em] relative print:break-inside-avoid" :aria-label="`${item.char}，${item.pinyin}，${item.zhuyin.symbols}${item.zhuyin.tone}`">
    <button data-export-text type="button" class="cursor-pointer hover:outline hover:outline-offset-2 hover:outline-leaf print:outline-none focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-leaf font-pinyin text-[.255em] text-center justify-self-center self-start text-leaf whitespace-nowrap col-start-1 leading-[1.2]" :aria-label="`編輯「${item.char}」的拼音：${item.pinyin}`" @click="editReading(index, 'pinyin')">{{ item.pinyin }}</button>
    <span data-export-text data-character class="row-start-2 col-start-1 justify-self-center text-[1em] leading-[1.12] font-normal">{{ item.char }}</span>
    <button type="button" class="cursor-pointer hover:outline hover:outline-offset-2 hover:outline-leaf print:outline-none focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-leaf row-start-2 col-start-2 self-center relative grid grid-cols-[1em_.65em] gap-x-[.12em] items-center text-[.23em] pl-[.08em] text-left text-sound" :class="{ 'pt-[.85em] -mt-[.85em]': item.zhuyin.neutral }" :aria-label="`編輯「${item.char}」的注音：${item.zhuyin.symbols}${item.zhuyin.tone}`" @click="editReading(index, 'zhuyin')">
      <span class="flex flex-col leading-[1.2]"><span data-export-text v-for="(symbol, symbolIndex) in item.zhuyin.symbols" :key="symbolIndex">{{ symbol }}</span></span>
      <span data-export-text class="text-[.8em] leading-none text-center" :class="item.zhuyin.neutral ? 'absolute top-0 left-[.1em] w-[1.25em]' : ''">{{ item.zhuyin.tone }}</span>
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
</div><div class="px-6 py-[15px] border-t border-dashed border-line/60 flex gap-[22px] text-muted text-[10px] print:hidden"><span class="flex items-center gap-[7px]"><i class="w-1.5 h-1.5 rounded-full inline-block bg-leaf"></i>上方：漢語拼音</span><span class="flex items-center gap-[7px]"><i class="w-1.5 h-1.5 rounded-full inline-block bg-sand"></i>右側：注音符號</span></div></section>
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
</main><footer class="max-w-[1060px] mx-auto border-t border-line py-6 text-center text-muted text-[10px] max-[650px]:mx-[18px] print:hidden"><a class="hover:underline" href="https://github.com/ianwu5205/mandarin-annotator" target="_blank" rel="noopener noreferrer">字字有聲</a> <a class="hover:underline" href="./changes.html">v0.0.2</a></footer>
</div>
</template>
