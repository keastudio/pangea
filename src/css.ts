import { typedStorage } from './utils.ts'

function hash (str: string) {
  let h = 0
  let k; let i = 0; let len = str.length
  for (; len >= 4; ++i, len -= 4) {
    k = str.charCodeAt(i) & 255 | (str.charCodeAt(++i) & 255) << 8 | (str.charCodeAt(++i) & 255) << 16 | (str.charCodeAt(++i) & 255) << 24
    k = (k & 65535) * 1540483477 + ((k >>> 16) * 59797 << 16)
    k ^= k >>> 24
    h = (k & 65535) * 1540483477 + ((k >>> 16) * 59797 << 16) ^ (h & 65535) * 1540483477 + ((h >>> 16) * 59797 << 16)
  }
  switch (len) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 255) << 16
      break
    case 2:
      h ^= (str.charCodeAt(i + 1) & 255) << 8
      break
    case 1:
      h ^= str.charCodeAt(i) & 255
      h = (h & 65535) * 1540483477 + ((h >>> 16) * 59797 << 16)
  }
  h ^= h >>> 13
  h = (h & 65535) * 1540483477 + ((h >>> 16) * 59797 << 16)
  return ((h ^ h >>> 15) >>> 0).toString(36)
}

function css (templateStringArray: TemplateStringsArray, ...templateArgs: (string|number)[]) {
  const cssRules = templateStringArray
    .reduce(
      (acc, current, index) => index + 1 <= templateArgs.length
        ? acc + current + templateArgs[index]
        : acc + current,
      ''
    )
    .trim()

  const cssClassName = 'cn-' + hash(cssRules)

  const styleSheetBody = `.${cssClassName} {\n${cssRules}\n}\n`

  if ('Deno' in window) {
    typedStorage.setItem(
      'styleSheet',
      (typedStorage.getItem('styleSheet') || '') + styleSheetBody
    )
  }

  return cssClassName
}

function combine (...args: (string | [boolean, string] | [boolean, string, string])[]) {
  return <string|undefined>args.reduce(
    (acc, current) => typeof current === 'string'
      ? acc + ' ' + current
      : (Array.isArray(current) && [2, 3].includes(current.length))
          ? current[0]
            ? acc + ' ' + current[1]
            : current[2]
              ? acc + ' ' + current[2]
              : acc
          : acc,
    ''
  ) || undefined
}

export { css, combine }
