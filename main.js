// The input element for the expression
const expression = document.getElementById('expressionInput');
// The table element for the truth table
const truthTable = document.getElementById('truth-table');
// The table element for the karnaugh map
const karnaughMap = document.getElementById('karnaugh-map');
// The canvas element for the circuit diagram
const circuit = document.getElementById('diagram');
// The context of the circuit diagram
const ctx = circuit.getContext('2d');
// HTML collection of all images on the page
const { images } = document;

// The canvas' width and height
circuit.width = circuit.getBoundingClientRect().width;
circuit.height = circuit.getBoundingClientRect().height;

// The direction the text will face
ctx.textAlign = 'right';
ctx.textBaseline = 'middle';

// What symbols or words will be converted into others
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

// Matches all whitespace
const squeezeRegex = /\s+/g;
// Matches all strings of letters, numbers or other characters
const tokenRegex = /[A-Z]+|[01]+|\W/gi;
// Matches all characters that must be escaped in regex
const escapeRegex = /[-[\]{}()*+?.,\\^$|#\s]/g;
// Matches all symbols that must be replaced
const replaceRegex = new RegExp(Object.keys(otherSymbols).map(key => key.replace(escapeRegex, '\\$&')).join('|'), 'gi');

// Returns an array of all tokens in an expression
// First removes all whitespace and then replaces all symbols that need to be replaced
const tokenize = exp => exp.replace(squeezeRegex, '').replace(replaceRegex, key => otherSymbols[key]).match(tokenRegex);

// Matches a string of letters
const strRegex = /[A-Z]+/i;
// Matches a string of alphanumeric characters
const alphaNum = /[A-Z01]/i;

// Order of operations
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

// Dictionary of operations that take one argument
const operations1 = {
  '¬': a => (!a), // NOT
};

// Dictionary of operations that take two arguments
const operations2 = {
  '∧': (a, b) => (a && b), // AND
  '∨': (a, b) => (a || b), // OR
  '→': (a, b) => (!a || b), // IMPLY
  '⊕': (a, b) => (a ? !b : b), // XOR
  '≡': (a, b) => (a === b), // XNOR
};

// Maps ones and zeroes to true and false and vice versa
const conversion = {
  0: false,
  1: true,
  false: '0',
  true: '1',
};

// Returns a value n_i that differs by one bit from n_(i-1)
// gray(0) = 0, gray(1) = 1, gray(2) = 3
const gray = i => i ^ (i >> 1);

// Maps names to symbols
const names = {
  '¬': 'NOT',
  '∧': 'AND',
  '∨': 'OR',
  '→': 'IMPLY',
  '⊕': 'XOR',
  '≡': 'XNOR',
};

// Converts infix list of tokens to postfix list of tokens
const convertToPostfix = (infix) => {
  const postfix = [];
  const stack = [];
  let d = 0;

  infix.forEach((token) => {
    if (alphaNum.test(token)) {
      postfix.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      let top = stack.pop();
      while (top !== '(' && top !== undefined) {
        postfix.push(top);
        top = stack.pop();
      }
    } else if (stack.length === 0) {
      stack.push(token);
    } else {
      let top = stack.length.length - 1;
      d = Math.max(d, stack.length + 1);
      while (precedence[top] <= precedence[token]) {
        postfix.push(pop(stack));
        top += 1;
      }
      stack.push(token);
    }
  });
  d = Math.max(d, stack.length);
  stack.reverse();
  return [postfix.concat(stack), d];
};

// Gets the width per layer
const getScale = (depth) => {
  const scale = circuit.width / depth;
  ctx.font = `${scale * 0.1}px Courier`;
  ctx.lineWidth = scale * 0.02;
  return scale;
};

// Draws the circuit diagram
const createCircuit = (exp, x, y, scale, direction = null) => {
  const last = exp.pop();
  if (last in operations1 || last in operations2) {
    let offset = 0;
    if (direction === 'down') {
      offset = scale * -0.15;
      ctx.beginPath();
      ctx.moveTo(x, y + scale * 0.16);
      ctx.lineTo(x, y - scale * 0.01);
      ctx.stroke();
    } else if (direction === 'up') {
      offset = scale * 0.15;
      ctx.beginPath();
      ctx.moveTo(x, y - scale * 0.16);
      ctx.lineTo(x, y + scale * 0.01);
      ctx.stroke();
    }
    ctx.drawImage(Array.from(images).find(image => image.id === names[last]),
      x - scale * 0.95, y - scale * 0.25 - offset, scale, scale * 0.5);
    if (last in operations1) {
      if (direction === 'down') {
        createCircuit(exp, x - scale * 0.9, y + scale * 0.3 + offset, scale, 'down');
      } else {
        createCircuit(exp, x - scale * 0.9, y - scale * 0.3 + offset, scale, 'up');
      }
    } else {
      createCircuit(exp, x - scale * 0.9, y + scale * 0.1 - offset, scale, 'down');
      createCircuit(exp, x - scale * 0.9, y - scale * 0.1 - offset, scale, 'up');
    }
  } else {
    ctx.fillText(last, x - scale * 0.01, y);
  }
};

// Creates a truth table
const createTruthTable = (inputs, outputs, variables) => {
  truthTable.firstElementChild.innerHTML = '';

  // Variables like A, B and Q are on the top row
  const header = truthTable.insertRow();
  variables.push('Q');
  variables.forEach((variable) => {
    const cell = header.insertCell();
    cell.appendChild(document.createTextNode(variable));
  });

  // For each array of inputs, make a row
  inputs.forEach((input, i) => {
    const row = truthTable.insertRow();
    // For each input, enter it into a cell
    input.forEach((digit) => {
      const cell = row.insertCell();
      cell.appendChild(document.createTextNode(digit));
    });
    // Also enter the output in the Q column
    const out = row.insertCell();
    out.appendChild(document.createTextNode(outputs[i]));
  });
};

// Creates a karnaugh map
const createKarnaughMap = (inputs, outputs, variables) => {
  const vertical = Math.floor(variables.length / 2);
  const horizontal = variables.length - vertical;

  karnaughMap.firstElementChild.innerHTML = '';

  const header = karnaughMap.insertRow();

  // Creates top left corner
  const key = header.insertCell();
  key.appendChild(document.createTextNode(`${variables.slice(0, vertical).join('')}\\${variables.slice(vertical).join('')}`));

  // Creates headings for the top
  for (let i = 0; i < 2 ** horizontal; i += 1) {
    const cell = header.insertCell();
    cell.appendChild(document.createTextNode(gray(i).toString(2).padStart(horizontal, '0')));
  }

  // Creates headings for the left
  for (let i = 0; i < 2 ** vertical; i += 1) {
    const row = karnaughMap.insertRow();
    const firstCell = row.insertCell();
    firstCell.appendChild(document.createTextNode(gray(i).toString(2).padStart(vertical, '0')));

    // Fills in the rest of the cells
    for (let j = 0; j < 2 ** horizontal; j += 1) {
      const cell = row.insertCell();
      const index = gray(i).toString(2).padStart(vertical, '0') + gray(j).toString(2).padStart(horizontal, '0');
      cell.appendChild(document.createTextNode(outputs[parseInt(index, 2)]));
    }
  }
};

// Evaluates a postfix expression
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

// Gets all inputs to the expression
const getInputs = (length) => {
  const inputs = [];
  for (let i = 0; i < 2 ** length; i += 1) {
    inputs.push(Number(i).toString(2).padStart(length, '0').split(''));
  }

  return inputs;
};

// Gets all outputs from inputs to the expression
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

// This runs whenever the expression is changed
const newExpression = () => {
  const tokens = tokenize(expression.value);
  const variables = [...new Set(tokens.filter(token => strRegex.test(token)))];
  const [exp, depth] = convertToPostfix(tokens);
  const inputs = getInputs(variables.length);
  const outputs = getOutputs(exp, inputs);
  const scale = getScale(depth);

  ctx.clearRect(0, 0, circuit.width, circuit.height);
  createCircuit(exp, circuit.width, circuit.height / 2, scale);
  createKarnaughMap(inputs, outputs, variables);
  createTruthTable(inputs, outputs, variables);
};

// This runs whenever an operator button is clicked
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

// Do newExpression once the page has loaded
window.onload = () => { newExpression(); };
