import newCell from './newCell';

// The table element for the karnaugh map
const karnaughMap = document.getElementById('karnaugh-map');
// The section element for the karnaugh map
const karnaughMapSection = document.getElementById('karnaugh-map-section');

// Returns a value n_i that differs by one bit from n_(i-1)
// gray(0) = 0, gray(1) = 1, gray(2) = 3
const gray = i => i ^ (i >> 1); // eslint-disable-line no-bitwise

// Returns a gray number of a certain length as a binary string
const grayString = (i, length) => gray(i).toString(2).padStart(length, '0');

// Creates a karnaugh map
export default (outputs, variables) => {
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
  const keyText = `${variables.slice(0, vertical).join('')}\\${variables.slice(vertical).join('')}`;
  newCell(header, keyText);

  // Creates headings for the top
  for (let i = 0; i < 2 ** horizontal; i += 1) {
    newCell(header, grayString(i, horizontal));
  }

  // Creates headings for the left
  for (let i = 0; i < 2 ** vertical; i += 1) {
    const row = karnaughMap.insertRow();
    newCell(row, grayString(i, vertical));

    // Fills in the rest of the cells
    for (let j = 0; j < 2 ** horizontal; j += 1) {
      const index = grayString(i, vertical) + grayString(j, horizontal);
      const digit = outputs[parseInt(index, 2)];
      const cell = newCell(row, digit);

      // Highlights 1s
      if (digit === 1) {
        cell.classList.add('highlighted');
      }
    }
  }
};
