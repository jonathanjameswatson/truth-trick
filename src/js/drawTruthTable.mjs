import newCell from './newCell';

// The table element for the truth table
const truthTable = document.getElementById('truth-table');

// Creates a truth table
export default (inputs, outputs, variables) => {
  truthTable.firstElementChild.innerHTML = '';

  // Variables like A, B and Q are on the top row
  const header = truthTable.insertRow();
  const newVariables = variables.slice();
  newVariables.push('Q');
  newVariables.forEach((variable) => {
    newCell(header, variable);
  });

  // For each array of inputs, make a row
  inputs.forEach((input, i) => {
    const row = truthTable.insertRow();
    // For each input, enter it into a cell
    input.forEach(([, bool]) => {
      newCell(row, bool);
    });

    // Also enter the output in the Q column
    const output = newCell(row, outputs[i]);

    // Highlights 1s on outputs
    if (outputs[i] === 1) {
      output.classList.add('highlighted');
    }
  });
};
