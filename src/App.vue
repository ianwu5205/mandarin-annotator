<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import { annotate } from './phonetics.js'

const text = ref('春天來了，一起去看花。')
const size = ref(112)
const input = useTemplateRef('input')
const characters = computed(() => annotate(text.value))
function clear() {
  text.value = ''
  input.value?.focus()
}
function printPage() { window.print() }
</script>

<template>
<div class="m-0 font-sans text-ink bg-page print:bg-white min-h-screen">
<header class="h-[88px] max-[650px]:h-[72px] border-b border-line px-[6%] flex items-center justify-between bg-page print:hidden"><a class="flex items-center gap-3 text-[21px] font-bold text-inherit no-underline" href="./"><span class="grid place-items-center bg-brand text-white rounded-[11px] w-[39px] h-[41px]">字</span>字字有聲<span class="text-xs font-normal border-l border-line pl-3 ml-1 text-muted">雙拼編輯器</span></a></header>
<main class="max-w-[1120px] mx-auto px-[30px] pt-[58px] pb-[50px] max-[650px]:px-4 max-[650px]:py-[35px] print:max-w-none print:p-0">

<section class="bg-white border border-line rounded-2xl px-[25px] py-[22px] max-[650px]:p-[18px] shadow-sm print:hidden" aria-labelledby="input-title"><div class="flex justify-between items-center text-sm font-medium"><label id="input-title" for="text">輸入文字，下面就會出現標注音標的文字</label><span class="text-[11px] text-muted font-normal" id="count">{{ Array.from(text).length }} / 200 字</span></div><textarea v-model="text" ref="input" class="block resize-y min-h-[95px] w-full border-0 bg-transparent pt-[17px] pb-2.5 text-[21px] leading-[1.6] text-ink outline-none focus:shadow-[0_2px_#87a990]" id="text" maxlength="200" placeholder="在這裡輸入中文…" spellcheck="false"></textarea><div class="border-t border-line/40 pt-3.5 flex justify-between items-center gap-3"><div class="flex items-center gap-2 flex-wrap"><span class="text-[11px] text-muted mr-1.5 max-[650px]:hidden">試試看</span><button class="cursor-pointer border border-line bg-page px-3 py-1.5 rounded-md text-leaf text-[11px] hover:bg-line focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-4" @click="text = '你好，世界。'">你好世界</button><button class="cursor-pointer border border-line bg-page px-3 py-1.5 rounded-md text-leaf text-[11px] hover:bg-line focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-4" @click="text = '床前明月光，疑是地上霜。'">一首小詩</button><button class="cursor-pointer border border-line bg-page px-3 py-1.5 rounded-md text-leaf text-[11px] hover:bg-line focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-4" @click="text = '宣'">圖片範例：宣</button></div><button class="cursor-pointer border border-line bg-page px-3 py-1.5 rounded-md text-leaf text-[11px] hover:bg-line focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-4 border-0 bg-transparent text-muted" id="clear" @click="clear">清空</button></div></section>
<section class="mt-7 border border-line rounded-2xl overflow-hidden bg-white print:border-0 print:mt-0 print:rounded-none" aria-labelledby="preview-title"><div class="p-5 px-6 flex items-center justify-between border-b border-line/60 gap-4 max-[650px]:items-start max-[650px]:flex-col max-[650px]:p-[18px] print:hidden"><div class="flex items-center gap-4"><h2 class="text-sm m-0 font-medium" id="preview-title">雙音標預覽</h2><span class="text-[10px] text-muted flex items-center gap-1.5"><i class="w-[5px] h-[5px] rounded-full bg-leaf"></i>即時產生</span></div><div class="flex items-center gap-4 max-[650px]:gap-3 text-[11px] text-muted"><label for="size">字級</label><input class="w-[85px] accent-leaf focus-visible:outline-2 focus-visible:outline-leaf" id="size" v-model.number="size" type="range" min="64" max="180"><output class="w-[23px] font-pinyin" id="size-value" for="size">{{ size }}</output><button class="cursor-pointer border border-line bg-page px-3 py-1.5 rounded-md text-leaf text-[11px] hover:bg-line focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-4 bg-white ml-[5px]" id="print" @click="printPage">列印 / PDF ↗</button></div></div><div class="min-h-[300px] px-8 py-10 flex flex-wrap content-start items-start gap-x-[18px] gap-y-7 text-black max-[650px]:px-[18px] max-[650px]:py-[30px] max-[650px]:gap-x-3 max-[650px]:gap-y-6 print:p-0 print:gap-6" :style="{ fontSize: `${size}px` }" id="result" aria-label="中文拼音與注音預覽">
<template v-for="(item, index) in characters" :key="index">
  <div v-if="item.char === '\n'" class="basis-full h-0"></div>
  <span v-else-if="/\s/u.test(item.char)" class="text-[1em] leading-[1.12] mt-[.36em] w-[.4em]">&nbsp;</span>
  <span v-else-if="!item.zhuyin" class="text-[.65em] leading-[1.12] pt-[.615385em]">{{ item.char }}</span>
  <span v-else class="inline-grid grid-cols-[1em_.46em] grid-rows-[.36em_1.12em] text-[1em] relative print:break-inside-avoid" :aria-label="`${item.char}，${item.pinyin}，${item.zhuyin.symbols}${item.zhuyin.tone}`">
    <span class="font-pinyin text-[.255em] text-center self-start text-leaf whitespace-nowrap col-start-1 leading-[1.2]">{{ item.pinyin }}</span>
    <span class="row-start-2 col-start-1 text-[1em] leading-[1.12] font-normal">{{ item.char }}</span>
    <span class="row-start-2 col-start-2 self-center relative grid grid-cols-[1em_.65em] gap-x-[.12em] items-center text-[.23em] pl-[.08em] text-sound">
      <span class="flex flex-col leading-[1.2]"><span v-for="(symbol, symbolIndex) in item.zhuyin.symbols" :key="symbolIndex">{{ symbol }}</span></span>
      <span class="text-[.8em] leading-none text-center" :class="item.zhuyin.neutral ? 'absolute top-[-.85em] left-[.1em] w-[1.25em]' : ''">{{ item.zhuyin.tone }}</span>
    </span>
  </span>
</template>
</div><p class="text-muted text-center text-[13px] m-0 px-6 pb-5 empty:hidden print:hidden" id="status" role="status">{{ text.trim() ? '' : '輸入一些中文，讓文字開始發聲。' }}</p><div class="px-6 py-[15px] border-t border-dashed border-line/60 flex gap-[22px] text-muted text-[10px] print:hidden"><span class="flex items-center gap-[7px]"><i class="w-1.5 h-1.5 rounded-full inline-block bg-leaf"></i>上方：漢語拼音</span><span class="flex items-center gap-[7px]"><i class="w-1.5 h-1.5 rounded-full inline-block bg-sand"></i>右側：注音符號</span></div></section>
<p class="text-[11px] text-muted text-center mt-[19px] max-[650px]:leading-[1.8] print:hidden">多音字依上下文自動判讀，特殊人名與地名請再確認讀音。採用 Google Noto 字型。</p>
</main><footer class="max-w-[1060px] mx-auto border-t border-line py-6 flex justify-between text-muted text-[10px] max-[650px]:mx-[18px] print:hidden"><span>字字有聲</span><span>把中文，一字一字讀進心裡。</span></footer>
</div>
</template>
