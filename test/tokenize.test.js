import tokenize from '../src/js/tokenize';

describe('tokenize', () => {
  it('simple expression can be parsed', () => {
    expect.assertions(1);
    expect(tokenize('A∧B')).toStrictEqual(['A', '∧', 'B']);
  });
  it('symbol aliases are replaced', () => {
    expect.assertions(1);
    expect(tokenize('A&B')).toStrictEqual(['A', '∧', 'B']);
  });
  it('upper case word aliases are replaced', () => {
    expect.assertions(1);
    expect(tokenize('A&TRUE')).toStrictEqual(['A', '∧', '1']);
  });
  it('lower case word aliases are replaced', () => {
    expect.assertions(1);
    expect(tokenize('A&true')).toStrictEqual(['A', '∧', '1']);
  });
  it('double symbol aliases are replaced', () => {
    expect.assertions(1);
    expect(tokenize('A&&B')).toStrictEqual(['A', '∧', 'B']);
  });
  it('aliases with whitespace are replaced', () => {
    expect.assertions(1);
    expect(tokenize('A IF AND ONLY IF B')).toStrictEqual(['A', '≡', 'B']);
  });
  it('whitespace is removed', () => {
    expect.assertions(1);
    expect(tokenize('A ∧ B')).toStrictEqual(['A', '∧', 'B']);
  });
  it('unexpected numbers are removed', () => {
    expect.assertions(1);
    expect(tokenize('A ∧ 2B')).toStrictEqual(['A', '∧', 'B']);
  });
});
