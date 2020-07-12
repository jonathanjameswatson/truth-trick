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

// Matches the first character of a variable or boolean
const variableOrBoolRegex = /[A-Z01]/i;

// Converts infix list of tokens to postfix list of tokens
export default (infix) => {
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
    if (variableOrBoolRegex.test(token)) {
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
