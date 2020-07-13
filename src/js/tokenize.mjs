// What symbols or words will be converted into others
// Always place a XX alias before an X alias for any symbol X
// Aliases with letters must be upper case
const aliases = {
  '∧': ['.', '⋅', '^', '&&', '&', 'AND', '*', '×', '⋂'],
  '∨': ['OR', '+', '||', '|', '⋃'],
  '¬': ['!', '~', '-', 'NOT'],
  '⊕': ['⊻', '⩒', '⩛', '≢', '^', '><', '>-<', '↮', 'XOR', 'EOR', 'EXOR'],
  '→': ['>', '⇒', '⊃', 'IMPLY', 'IMPLIES'],
  '≡': [
    '=',
    '↔',
    '⇔',
    '⊙',
    'IFF',
    'IF AND ONLY IF',
    'XNOR',
    "XORN'T",
    'ENOR',
    'EXNOR',
    'NXOR',
    'EQUIVALENT',
    'BICONDITIONAL',
  ],
  0: ['FALSE'],
  1: ['TRUE'],
};

// A dictionary mapping aliases to the correct symbols
const aliasMap = Object.fromEntries(
  Object.entries(aliases).flatMap(([symbol, symbolAliases]) =>
    symbolAliases.map((symbolAlias) => [symbolAlias, symbol])
  )
);

// A list of aliases
const aliasList = Object.values(aliases).flat();

// Matches all whitespace
const squeezeRegex = /\s+/g;
// Matches all strings of letters, numbers or other characters
const tokenRegex = /[A-Z][A-Z0-9]*|[01]|\W/gi;
// Matches all characters that must be escaped in regex
const escapeRegex = /[-[\]{}()*+?.,\\^$|#\s]/g;
// Matches all symbols that must be replaced
const replaceRegex = new RegExp(
  aliasList.map((alias) => alias.replace(escapeRegex, '\\$&')).join('|'),
  'gi'
);

// Returns an array of all tokens in an expression
// First removes all whitespace and then replaces all aliases that need to be replaced
export default (exp) =>
  exp
    .replace(replaceRegex, (alias) => aliasMap[alias.toUpperCase()])
    .replace(squeezeRegex, '')
    .match(tokenRegex);
