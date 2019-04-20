const expression = document.getElementById('expression');
const truthTable = document.getElementById('truth-table');

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
  '∨': 0,
};

const operations1 = {
  '¬': a => (!a),
};

const operations2 = {
  '∧': (a, b) => (a && b),
  '∨': (a, b) => (a || b),
};

const conversion = {
  '0': false,
  '1': true,
  false: '0',
  true: '1',
};

const convertToPostfix = (infix) => {
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

const createTruthTable = (inputs, outputs, variables) => {
  truthTable.firstElementChild.innerHTML = '';

  const header = truthTable.insertRow();
  variables.push('Q');
  variables.forEach((variable) => {
    const cell = header.insertCell();
    cell.appendChild(document.createTextNode(variable));
  });

  inputs.forEach((input, i) => {
    const row = truthTable.insertRow();
    input.forEach((digit) => {
      const cell = row.insertCell();
      cell.appendChild(document.createTextNode(digit));
    });
    const out = row.insertCell();
    out.appendChild(document.createTextNode(outputs[i]));
  });
};

const evaluate = (exp) => {
  const last = exp.pop();
  if (last in operations1) {
    return operations1[last](evaluate(exp));
  }
  if (last in operations2) {
    return operations2[last](evaluate(exp), evaluate(exp));
  }
  if (last in Object.keys(conversion)) {
    return conversion[last];
  }
  return last;
};

const getInputs = (length) => {
  const inputs = [];
  for (let i = 0; i < 2 ** length; i += 1) {
    const binary = (Number(i).toString(2).split(''));
    inputs.push(new Array(length - binary.length).fill('0').concat(binary));
  }

  return inputs;
};

const getOutputs = (exp, inputs) => {
  const outputs = [];
  inputs.forEach((input) => {
    let replacedExp = exp;
    let n = -1;
    replacedExp = replacedExp.map((token) => {
      if (strRegex.test(token)) {
        n += 1;
        return input[n];
      }
      return token;
    });
    outputs.push(conversion[evaluate(replacedExp)]);
  });

  return outputs;
};

const newExpression = () => {
  const tokens = tokenize(expression.value);
  const variables = [...new Set(tokens.filter(token => strRegex.test(token)))];
  const exp = convertToPostfix(tokens);
  const inputs = getInputs(variables.length);
  const outputs = getOutputs(exp, inputs);
  createTruthTable(inputs.slice(), outputs, variables);
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

newExpression();
