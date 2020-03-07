import d3 from 'd3';
import dagreD3 from './dagre-d3.min.js';

import AND from '../images/gates/AND.svg';
import IMPLY from '../images/gates/IMPLY.svg';
import NOT from '../images/gates/NOT.svg';
import OR from '../images/gates/OR.svg';
import XNOR from '../images/gates/XNOR.svg';
import XOR from '../images/gates/XOR.svg';

const { render: Render, graphlib } = dagreD3;

// SVGs of gates
const sprites = {
  AND,
  IMPLY,
  NOT,
  OR,
  XNOR,
  XOR,
};

// The input element for the expression
const expression = document.getElementById('expressionInput');
// The table element for the truth table
const truthTable = document.getElementById('truth-table');
// The table element for the karnaugh map
const karnaughMap = document.getElementById('karnaugh-map');
// The list of operator buttons
const operationButtons = document.getElementsByClassName('operation');

const svg = d3.select('#diagram');
const inner = svg.select('g');

// Create the renderer
const render = new Render();

// The graph to be rendered
let g;

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
  NOT: '¬',
  '⊻': '⊕',
  XOR: '⊕',
  EOR: '⊕',
  EXOR: '⊕',
  '>': '→',
  IMPLY: '→',
  IMPLIES: '→',
  '=': '≡',
  '⊙': '≡',
  XNOR: '≡',
  ENOR: '≡',
  EXNOR: '≡',
  NXOR: '≡',
  EQUIVALENT: '≡',
  BICONDITIONAL: '≡',
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
  '(': 6,
  '→': 5,
  '≡': 4,
  '∨': 3,
  '⊕': 2,
  '∧': 1,
  '¬': 0,
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
const gray = i => i ^ (i >> 1); // eslint-disable-line no-bitwise

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
  const reverse = infix.reverse().map((token) => {
    if (token === '(') {
      return ')';
    }
    if (token === ')') {
      return '(';
    }
    return token;
  });
  reverse.forEach((token) => {
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
      let top = stack[stack.length - 1];
      while (precedence[top] <= precedence[token]) {
        postfix.push(stack.pop());
        top = stack[stack.length - 1];
      }
      stack.push(token);
    }
  });
  stack.reverse();
  return postfix.concat(stack);
};

render.shapes().gate = (parent, bbox, node) => {
  const w = bbox.width;
  const h = bbox.height;
  const points = [
    { x: w * 0.05, y: -h * 0.3 },
    { x: w * 0.3, y: -h * 0.1 },
    { x: w * 0.95, y: -h / 2 },
    { x: w * 0.3, y: -h * 0.9 },
    { x: w * 0.05, y: -h * 0.7 },
  ];

  const shapeSvg = parent.insert('polygon', ':first-child')
    .attr('points', points.map(d => `${d.x},${d.y}`).join(' '))
    .attr('transform', `translate(${-w / 2},${h * 0.5})`);

  parent.insert('svg')
    .attr('class', 'nodeImage')
    .attr('x', -w / 2)
    .attr('y', -h / 2)
    .attr('width', w)
    .attr('height', h)
    .insert('use')
    .attr('href', sprites[node.gate].url);

  return shapeSvg;
};

// Draws the circuit diagram
const createCircuit = (exp) => {
  g.setNode('0', { label: 'Q' });

  const addNode = (direction, parentNode, node) => {
    const last = exp.pop();
    if (last in operations1 || last in operations2) {
      g.setNode(node, {
        shape: 'gate',
        label: '',
        width: 180,
        height: 90,
        direction,
        gate: names[last],
      });

      if (last in operations1) {
        addNode(0, node, `${node}0`);
      } else {
        addNode(-1, node, `${node}0`);
        addNode(1, node, `${node}1`);
      }
    } else {
      g.setNode(node, { label: last, direction });
    }

    g.setEdge(parentNode, node, { arrowhead: 'undirected' });
  };

  addNode(0, '0', '00');
};

// Creates a truth table
const createTruthTable = (inputs, outputs, variables) => {
  truthTable.firstElementChild.innerHTML = '';

  // Variables like A, B and Q are on the top row
  const header = truthTable.insertRow();
  variables.push('Q');
  variables.forEach((variable) => {
    const cell = header.insertCell();
    const div = cell.appendChild(document.createElement('div'));
    div.classList.add('overflow');
    div.appendChild(document.createTextNode(variable));
  });

  // For each array of inputs, make a row
  inputs.forEach((input, i) => {
    const row = truthTable.insertRow();
    // For each input, enter it into a cell
    input.forEach((digit) => {
      const cell = row.insertCell();
      const div = cell.appendChild(document.createElement('div'));
      div.classList.add('overflow');
      div.appendChild(document.createTextNode(digit));
    });

    // Also enter the output in the Q column
    const out = row.insertCell();
    const outDiv = out.appendChild(document.createElement('div'));
    outDiv.classList.add('overflow');
    outDiv.appendChild(document.createTextNode(outputs[i]));

    // Highlights 1s on outputs
    if (outputs[i] === '1') {
      out.classList.add('highlighted');
    } else {
      out.classList.remove('highlighted');
    }
  });
};

// Creates a karnaugh map
const createKarnaughMap = (outputs, variables) => {
  const vertical = Math.floor(variables.length / 2);
  const horizontal = variables.length - vertical;

  karnaughMap.firstElementChild.innerHTML = '';

  const header = karnaughMap.insertRow();

  // Creates top left corner
  const key = header.insertCell();
  const keyDiv = key.appendChild(document.createElement('div'));
  keyDiv.classList.add('overflow');
  const keyText = `${variables.slice(0, vertical).join('')}\\${variables.slice(vertical).join('')}`;
  keyDiv.appendChild(document.createTextNode(keyText));

  // Creates headings for the top
  for (let i = 0; i < 2 ** horizontal; i += 1) {
    const cell = header.insertCell();
    const div = cell.appendChild(document.createElement('div'));
    div.classList.add('overflow');
    div.appendChild(document.createTextNode(gray(i).toString(2).padStart(horizontal, '0')));
  }

  // Creates headings for the left
  for (let i = 0; i < 2 ** vertical; i += 1) {
    const row = karnaughMap.insertRow();
    const firstCell = row.insertCell();
    const firstDiv = firstCell.appendChild(document.createElement('div'));
    firstDiv.classList.add('overflow');
    firstDiv.appendChild(document.createTextNode(gray(i).toString(2).padStart(vertical, '0')));

    // Fills in the rest of the cells
    for (let j = 0; j < 2 ** horizontal; j += 1) {
      const index = gray(i).toString(2).padStart(vertical, '0') + gray(j).toString(2).padStart(horizontal, '0');
      const digit = outputs[parseInt(index, 2)];
      const cell = row.insertCell();
      const div = cell.appendChild(document.createElement('div'));
      div.classList.add('overflow');
      div.appendChild(document.createTextNode(digit));

      // Highlights 1s
      if (digit === '1') {
        cell.classList.add('highlighted');
      } else {
        cell.classList.remove('highlighted');
      }
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
    let n = 0;
    replacedExp = replacedExp.map((token) => {
      if (strRegex.test(token)) {
        n += 1;
        return input[input.length - n];
      }
      return token;
    });
    outputs.push(conversion[evaluate(replacedExp)]);
  });

  return outputs;
};

const resize = () => {
  // Get graph dimensions
  const graphWidth = g.graph().width;
  const graphHeight = g.graph().height;
  // Get SVG width
  const width = parseInt(svg.style('width').replace(/px/, ''), 10);

  inner.attr('transform',
    `scale(${width / graphWidth}),
    translate(0, 20)`);

  svg.attr('height', (graphHeight + 40) * (width / graphWidth));
};

// This runs whenever the expression is changed
const newExpression = () => {
  const tokens = tokenize(expression.value);
  const variables = [...new Set(tokens.filter(token => strRegex.test(token)))];
  const exp = convertToPostfix(tokens);
  const inputs = getInputs(variables.length);
  const outputs = getOutputs(exp, inputs);

  inner.selectAll('*').remove();

  // Create a new directed graph
  g = new graphlib.Graph().setGraph({ rankdir: 'RL', nodeSep: 20 });

  createCircuit(exp);
  createKarnaughMap(outputs, variables);
  createTruthTable(inputs, outputs, variables);

  // Run the renderer. This is what draws the final graph.
  render(inner, g);

  resize(g);
};

// This runs whenever an operator button is clicked
const operator = (elem) => {
  const symbol = elem.textContent || elem.innerText;
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

expression.addEventListener('input', () => { newExpression(); });
Array.from(operationButtons)
  .forEach(operation => operation.addEventListener('click', () => { operator(operation); }));

window.addEventListener('resize', () => { resize(); });
