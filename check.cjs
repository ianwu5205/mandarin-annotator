const assert = require('node:assert/strict');
(async () => {
  const { toZhuyin, annotate } = await import('./src/phonetics.js');
  for (const [syllable, symbols] of Object.entries({ xuan1:'ㄒㄩㄢ', zhi1:'ㄓ', shi4:'ㄕ', yuan2:'ㄩㄢ', yong3:'ㄩㄥ', wen2:'ㄨㄣ', liu2:'ㄌㄧㄡ', gui4:'ㄍㄨㄟ', nü3:'ㄋㄩ', jun1:'ㄐㄩㄣ' })) {
    assert.equal(toZhuyin(syllable).symbols, symbols, syllable);
  }
  assert.equal(toZhuyin('ma5').tone, '˙');
  assert.equal(toZhuyin('!'), null);
  assert.equal(annotate('宣')[0].pinyin, 'xuān');
  assert.equal(annotate('宣')[0].zhuyin.symbols, 'ㄒㄩㄢ');
  assert.equal(annotate('銀行行走')[1].pinyin, 'háng');
  assert.equal(annotate('銀行行走')[2].pinyin, 'xíng');
  const mixed = annotate('你 A\n好！');
  assert.deepEqual(mixed.map(item => item.char), Array.from('你 A\n好！'));
  assert.equal(mixed[4].pinyin, 'hǎo');
  assert.equal(mixed[5].zhuyin, null);
  assert.deepEqual(annotate(''), []);
  console.log('Phonetic conversion, bundled dictionary, polyphones, whitespace and punctuation checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
