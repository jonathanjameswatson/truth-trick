import evaluate from './evaluate';
import variableRegex from './variableRegex';

const booleansToNumbers = {
  false: 0,
  true: 1,
};

// Gets all outputs from inputs to an expression.
// A list of 1s and 0s.
export default (exp, inputs) => {
  const outputs = inputs.map((input) => {
    const replacedExp = exp.map((token) => {
      const match = token.match(variableRegex);
      if (match) {
        return input.find(bool => bool[0] === match[0])[1];
      }
      return token;
    });
    return booleansToNumbers[evaluate(replacedExp)];
  });

  return outputs;
};
