// Gets a list containing a list for each combination of 0 or 1 for each variable.
// Each sublist is a list of entries giving the variable name and value.
// Entries are used so that the order of variables is guaranteed to be maintained.
export default (variables) =>
  [...Array(2 ** variables.length).keys()].map((i) =>
    i
      .toString(2)
      .padStart(variables.length, '0')
      .split('')
      .map((bool, j) => [variables[j], bool])
  );
