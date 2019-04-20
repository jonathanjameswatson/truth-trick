const expression = document.getElementById('expression');

const squeezeRegex = /\s+/g;
const tokenRegex = /[A-Z]+|[01]+|\W/gi;
const tokenize = exp => exp.replace(squeezeRegex, '').match(tokenRegex);
const strRegex = /[A-Z]+/i;
const alphaNum = /[A-Z01]/i;

const precedence = {
  undefined: 4,
  '(': 2,
  '¬': 3,
  '∧': 1,
  '∨': 1,
};

const convert = (infix) => {
  const postfix = [];
  const stack = [];

  infix.forEach((token) => {
    if (alphaNum.test(token)) {
      postfix.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      let top = stack.pop();
      while (top !== '(') {
        postfix.push(top);
        top = stack.pop();
      }
    } else if (stack.length === 0) {
      stack.push(token);
    } else {
      let top = stack.length.length - 1;
      while (precedence[top] <= precedence[token]) {
        postfix.push(pop(stack));
        top += 1;
      }
      stack.push(token);
    }
  });
  stack.reverse();
  return postfix.concat(stack);
};

const newExpression = () => {
  const tokens = tokenize(expression.value);
  const variables = new Set(tokens.filter(token => strRegex.test(token)));
  const exp = convert(tokens);
};

const operator = (symbol) => {
  const start = expression.selectionStart;
  const before = expression.value.substring(0, start);
  const after = expression.value.substring(expression.selectionEnd, expression.value.length);
  expression.value = (before + symbol + after);
  expression.focus();
  expression.selectionStart = start + 1;
  expression.selectionEnd = expression.selectionStart;
  newExpression();
};
