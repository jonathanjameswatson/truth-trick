// Adds a cell to a given row with given text
export default (row, text) => {
  const cell = row.insertCell();
  const div = cell.appendChild(document.createElement('div'));
  div.classList.add('overflow');
  div.appendChild(document.createTextNode(text));
  return cell;
};
