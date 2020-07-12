import tokenize from './tokenize';
import getVariables from './variables';
import postfix from './postfix';
import getInputs from './inputs';
import getOutputs from './outputs';

import { drawCircuit, resize } from './drawCircuit';
import drawTruthTable from './drawTruthTable';

// The input element for the expression
const expression = document.getElementById('expressionInput');
// The table element for the karnaugh map
const karnaughMap = document.getElementById('karnaugh-map');
// The section element for the karnaugh map
const karnaughMapSection = document.getElementById('karnaugh-map-section');
// The list of operator buttons
const operationButtons = document.getElementsByClassName('operation');

// Returns a value n_i that differs by one bit from n_(i-1)
// gray(0) = 0, gray(1) = 1, gray(2) = 3
const gray = i => i ^ (i >> 1); // eslint-disable-line no-bitwise

// Creates a karnaugh map
const createKarnaughMap = (outputs, variables) => {
  const vertical = Math.floor(variables.length / 2);
  const horizontal = variables.length - vertical;

  // Hide karnaugh map section if there is only one variable
  if (variables.length <= 1) {
    karnaughMapSection.hidden = true;
    return;
  }

  karnaughMapSection.hidden = false;

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

// This runs whenever the expression is changed
const newExpression = () => {
  const tokens = tokenize(expression.value);
  const variables = getVariables(tokens);
  const exp = postfix(tokens);
  const inputs = getInputs(variables);
  const outputs = getOutputs(exp, inputs);

  drawCircuit(exp);
  drawTruthTable(inputs, outputs, variables);
  createKarnaughMap(outputs, variables);
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
