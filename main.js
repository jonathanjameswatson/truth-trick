const expression = document.getElementById('expression');

const squeezeRegex = /\s+/g;
const tokenRegex = /[A-Z]+|\d+|\W/gi;
const tokenize = exp => exp.replace(squeezeRegex, '').match(tokenRegex);
const strRegex = /[A-Z]+/i;

const operator = (symbol) => {
  expression.value += symbol;
  expression.focus();
};

const newExpression = () => {
  const tokens = tokenize(expression.value);
  const variables = new Set(tokens.filter(token => strRegex.test(token)));
};

newExpression();
