import variableRegex from './variableRegex';

// Returns all variables in a set of tokens
export default (tokens) => [
  ...new Set(tokens.filter((token) => variableRegex.test(token))),
];
