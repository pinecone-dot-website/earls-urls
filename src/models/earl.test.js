import Earl from './earl';

test('https://google.com/ is a valid url', () => {
    const url = 'https://google.com/';
    expect(Earl.validate(url)).toBe(url);
});

test('javascript:void(0) is not a valid url', () => {
    const url = 'javascript:void(0)';
    expect(Earl.validate(url)).toBe(false);
});