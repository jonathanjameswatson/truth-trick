// Dictionary of dictionaries of operations that take n arguments
const operations = {
  1: {
    '¬': (a) => !a, // NOT
  },
  2: {
    '∧': (a, b) => a && b, // AND
    '∨': (a, b) => a || b, // OR
    '→': (a, b) => !a || b, // IMPLY
    '⊕': (a, b) => (a ? !b : b), // XOR
    '≡': (a, b) => a === b, // XNOR
  },
};

// Dictionary of functions and how many variables each one takes
export const operationVariableCounts = Object.fromEntries(
  Object.entries(operations).flatMap(([n, symbols]) =>
    Object.keys(symbols).map((symbol) => [symbol, n])
  )
);

// Converts a number to a boolean
const numberToBoolean = (number) => number === '1';

// Evaluates a postfix expression
const evaluate = (exp) => {
  const token = exp.pop();
  if (token in operationVariableCounts) {
    const variablesCount = operationVariableCounts[token];
    const parameters = Array(Number(variablesCount))
      .fill()
      .map(() => evaluate(exp));
    return operations[variablesCount][token](...parameters);
  }
  if (token in [0, 1]) {
    return numberToBoolean(token);
  }
  return token;
};

export default (exp) => {
  const newExp = exp.slice();
  return evaluate(newExp);
};
