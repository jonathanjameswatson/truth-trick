import evaluate from './evaluate';
import variableRegex from './variableRegex';

const booleanToNumber = boolean => (boolean ? 1 : 0);

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
    console.log(replacedExp.join(''))
    console.log(evaluate(replacedExp))
    return booleanToNumber(evaluate(replacedExp));
  });

  return outputs;
};
