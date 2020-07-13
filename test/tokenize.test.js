import tokenize from '../src/js/tokenize.mjs';

describe('tokenize', () => {
  it('Whitespace is removed', () => {
    expect(tokenize('A ∧ B')).toEqual(['A', '∧', 'B']);
  });
});
