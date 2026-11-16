import { pinyin, addTraditionalDict } from 'pinyin-pro'
import TraditionalDict from '@pinyin-pro/data/traditional'

addTraditionalDict(TraditionalDict)

/* Pinyin syllables → Taiwan-style vertical Zhuyin; first tone is unmarked. */
export function toZhuyin(syllable) {
  const match = syllable.toLowerCase().replaceAll('v', 'ü').match(/^([a-züê]+)([0-5])?$/u);
  if (!match) return null;
  let [, base, tone = '0'] = match;
  const initials = {b:'ㄅ',p:'ㄆ',m:'ㄇ',f:'ㄈ',d:'ㄉ',t:'ㄊ',n:'ㄋ',l:'ㄌ',g:'ㄍ',k:'ㄎ',h:'ㄏ',j:'ㄐ',q:'ㄑ',x:'ㄒ',zh:'ㄓ',ch:'ㄔ',sh:'ㄕ',r:'ㄖ',z:'ㄗ',c:'ㄘ',s:'ㄙ'};
  const finals = {a:'ㄚ',o:'ㄛ',e:'ㄜ',ê:'ㄝ',ai:'ㄞ',ei:'ㄟ',ao:'ㄠ',ou:'ㄡ',an:'ㄢ',en:'ㄣ',ang:'ㄤ',eng:'ㄥ',er:'ㄦ',i:'ㄧ',ia:'ㄧㄚ',io:'ㄧㄛ',ie:'ㄧㄝ',iao:'ㄧㄠ',iu:'ㄧㄡ',ian:'ㄧㄢ',in:'ㄧㄣ',iang:'ㄧㄤ',ing:'ㄧㄥ',iong:'ㄩㄥ',u:'ㄨ',ua:'ㄨㄚ',uo:'ㄨㄛ',uai:'ㄨㄞ',ui:'ㄨㄟ',uan:'ㄨㄢ',un:'ㄨㄣ',uang:'ㄨㄤ',ong:'ㄨㄥ',ueng:'ㄨㄥ',ü:'ㄩ',üe:'ㄩㄝ',üan:'ㄩㄢ',ün:'ㄩㄣ'};
  const aliases = {yi:'i',ya:'ia',yo:'io',ye:'ie',yao:'iao',you:'iu',yan:'ian',yin:'in',yang:'iang',ying:'ing',yong:'iong',yu:'ü',yue:'üe',yuan:'üan',yun:'ün',wu:'u',wa:'ua',wo:'uo',wai:'uai',wei:'ui',wan:'uan',wen:'un',wang:'uang',weng:'ueng'};
  base = aliases[base] || base;
  const initial = base.match(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcs])/u)?.[0] || '';
  let final = base.slice(initial.length);
  if (/[jqx]/.test(initial) && final.startsWith('u')) final = 'ü' + final.slice(1);
  if (['zh','ch','sh','r','z','c','s'].includes(initial) && final === 'i') final = '';
  if (final && !finals[final]) return null;
  return { symbols: (initials[initial] || '') + (finals[final] || ''), tone: ({2:'ˊ',3:'ˇ',4:'ˋ',0:'˙',5:'˙'})[tone] || '', neutral: tone === '0' || tone === '5' };
}


export function annotate(text) {
  const marked = pinyin(text, { type: 'array', nonZh: 'spaced', traditional: true })
  const numbered = pinyin(text, { type: 'array', toneType: 'num', nonZh: 'spaced', traditional: true })
  return Array.from(text, (char, index) => ({
    char,
    pinyin: marked[index],
    zhuyin: /\p{Script=Han}/u.test(char) ? toZhuyin(numbered[index] || '') : null,
  }))
}
