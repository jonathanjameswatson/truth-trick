const expression = document.getElementById('expression');
const truthTable = document.getElementById('truth-table');
const karnaughMap = document.getElementById('karnaugh-map');
const circuit = document.getElementById('diagram');
const ctx = circuit.getContext('2d');
const { images } = document;

ctx.font = '12px serif';
circuit.width = circuit.getBoundingClientRect().width;
circuit.height = circuit.getBoundingClientRect().height;

const otherSymbols = {
  '.': '∧',
  '^': '∧',
  '&': '∧',
  AND: '∧',
  '+': '∨',
  '|': '∨',
  OR: '∨',
  '!': '¬',
  NOT: '∨',
  '⊻': '⊕',
  XOR: '∨',
  '>': '→',
  '=': '≡',
  '⊙': '≡',
  XNOR: '≡',
};

const squeezeRegex = /\s+/g;
const tokenRegex = /[A-Z]+|[01]+|\W/gi;
const escapeRegex = /[-[\]{}()*+?.,\\^$|#\s]/g;
const replaceRegex = new RegExp(Object.keys(otherSymbols).map(key => key.replace(escapeRegex, '\\$&')).join('|'), 'gi');
const tokenize = exp => exp.replace(squeezeRegex, '').replace(replaceRegex, key => otherSymbols[key]).match(tokenRegex);
const strRegex = /[A-Z]+/i;
const alphaNum = /[A-Z01]/i;

const precedence = {
  undefined: 7,
  '¬': 6,
  '(': 5,
  '→': 4,
  '⊕': 3,
  '≡': 2,
  '∧': 1,
  '∨': 0,
};

const operations1 = {
  '¬': a => (!a),
};

const operations2 = {
  '∧': (a, b) => (a && b),
  '∨': (a, b) => (a || b),
  '→': (a, b) => (!a || b),
  '⊕': (a, b) => (a ? !b : b),
  '≡': (a, b) => (a === b),
};

const conversion = {
  0: false,
  1: true,
  false: '0',
  true: '1',
};

const gray = i => i ^ (i >> 1);

const names = {
  '¬': 'NOT',
  '∧': 'AND',
  '∨': 'OR',
  '→': 'IMPLY',
  '⊕': 'XOR',
  '≡': 'XNOR',
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

const createCircuit = (exp, x, y) => {
  console.log(exp)
  const last = exp.pop();
  if (last in operations1 || last in operations2) {
    ctx.drawImage(Array.from(images).find(image => image.attributes.src.value === `images/gates/${names[last]}.svg`), x - 95, y - 25);
    if (last in operations1) {
      createCircuit(exp, x - 90, y);
    } else {
      createCircuit(exp, x - 90, y + 10);
      createCircuit(exp, x - 90, y - 10);
    }
  } else {
    ctx.fillText(last, x, y);
  }
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

const createKarnaughMap = (inputs, outputs, variables) => {
  const vertical = Math.floor(variables.length / 2);
  const horizontal = variables.length - vertical;

  karnaughMap.firstElementChild.innerHTML = '';

  const header = karnaughMap.insertRow();

  const key = header.insertCell();
  key.appendChild(document.createTextNode(`${variables.slice(0, vertical).join('')}\\${variables.slice(vertical).join('')}`));

  for (let i = 0; i < 2 ** horizontal; i += 1) {
    const cell = header.insertCell();
    cell.appendChild(document.createTextNode(gray(i).toString(2).padStart(horizontal, '0')));
  }

  for (let i = 0; i < 2 ** vertical; i += 1) {
    const row = karnaughMap.insertRow();
    const firstCell = row.insertCell();
    firstCell.appendChild(document.createTextNode(gray(i).toString(2).padStart(vertical, '0')));

    for (let j = 0; j < 2 ** horizontal; j += 1) {
      const cell = row.insertCell();
      const index = gray(i).toString(2).padStart(vertical, '0') + gray(j).toString(2).padStart(horizontal, '0');
      cell.appendChild(document.createTextNode(outputs[parseInt(index, 2)]));
    }
  }
};

const evaluate = (exp) => {
  const last = exp.pop();
  if (last in operations1) {
    return operations1[last](evaluate(exp));
  }
  if (last in operations2) {
    return operations2[last](evaluate(exp), evaluate(exp));
  }
  if (last in conversion) {
    return conversion[last];
  }
  return last;
};

const getInputs = (length) => {
  const inputs = [];
  for (let i = 0; i < 2 ** length; i += 1) {
    inputs.push(Number(i).toString(2).padStart(length, '0').split(''));
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

  ctx.clearRect(0, 0, circuit.width, circuit.height);
  createCircuit(exp, circuit.width, circuit.height / 2);
  createKarnaughMap(inputs, outputs, variables);
  createTruthTable(inputs, outputs, variables);
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
