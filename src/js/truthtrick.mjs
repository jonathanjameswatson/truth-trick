import tokenize from './tokenize';
import getVariables from './variables';
import postfix from './postfix';
import getInputs from './inputs';
import getOutputs from './outputs';

import { drawCircuit, resize } from './drawCircuit';
import drawTruthTable from './drawTruthTable';
import drawKarnaughMap from './drawKarnaughMap';

// The input element for the expression
const expression = document.getElementById('expressionInput');
// The list of operator buttons
const operationButtons = document.getElementsByClassName('operation');

// This runs whenever the expression is changed
const newExpression = () => {
  const tokens = tokenize(expression.value);
  const variables = getVariables(tokens);
  const exp = postfix(tokens);
  const inputs = getInputs(variables);
  const outputs = getOutputs(exp, inputs);

  drawCircuit(exp);
  drawTruthTable(inputs, outputs, variables);
  drawKarnaughMap(outputs, variables);
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
