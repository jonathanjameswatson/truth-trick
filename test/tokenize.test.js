import tokenize from '../src/js/tokenize';

describe('tokenize', () => {
  it('whitespace is removed', () => {
    expect.assertions(1)
    expect(tokenize('A ∧ B')).toStrictEqual(['A', '∧', 'B']);
  });
});
