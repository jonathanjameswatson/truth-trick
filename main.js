const expression = document.getElementById('expression');

const operator = (symbol) => {
  expression.value += symbol;
  expression.focus();
};
