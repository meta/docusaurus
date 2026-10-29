import {describe, expect, it} from 'vitest';
import {bytesToSize, selectSrc} from '../components/helpers';

describe('bytesToSize', () => {
  const bitsInKB = 1024;
  const bitsInMB = bitsInKB * bitsInKB;

  it('Should correctly calculate size less than a single byte', () => {
    const bytes = 4;
    const result = bytesToSize(bytes);
    expect(result).toEqual(`${bytes} Bytes`);
  });

  it('Should correctly calculate size one bit less than a kilobyte', () => {
    const bytes = bitsInKB - 1;
    const result = bytesToSize(bytes);
    expect(result).toEqual(`${bytes} Bytes`);
  });

  it('Should correctly calculate size of exactly a kilobyte', () => {
    const expected = '1.0 KB';
    const result = bytesToSize(bitsInKB);
    expect(result).toEqual(expected);
  });

  it('Should correctly calculate decimal value of exactly a kilobyte plus 100 bits', () => {
    const expected = '1.1 KB';
    const result = bytesToSize(bitsInKB + 100);
    expect(result).toEqual(expected);
  });

  it('Should correctly calculate size of exactly a megabybte', () => {
    const expected = '1.0 MB';
    const result = bytesToSize(bitsInMB);
    expect(result).toEqual(expected);
  });
});

describe('selectSrc', () => {
  it('Should throw if provided no srcSet', () => {
    const props = {
      srcSet: [],
    };
    try {
      selectSrc(props);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe('Need at least one item in srcSet');
    }
  });

  it('Should throw if provided no supported formats in srcSet', () => {
    const props = {
      srcSet: [{format: 'webp'}],
    };
    try {
      selectSrc(props);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe(
        'Need at least one supported format item in srcSet',
      );
    }
  });

  it('Should select the right source with an image greater than the max width', () => {
    const srcThatShouldBeSelected = {format: 'jpeg', width: 100};
    const props = {
      srcSet: [srcThatShouldBeSelected],
      maxImageWidth: 100,
    };
    const expected = srcThatShouldBeSelected;
    const result = selectSrc(props);
    expect(result).toEqual(expected);
  });

  it('Should select the right source with an image less than the max width', () => {
    const srcThatShouldBeSelected = {format: 'jpeg', width: 99};
    const srcThatShouldNotBeSelected = {format: 'jpeg', width: 98};
    const props = {
      srcSet: [srcThatShouldBeSelected, srcThatShouldNotBeSelected],
      maxImageWidth: 100,
    };
    const expected = srcThatShouldBeSelected;
    const result = selectSrc(props);
    expect(result).toEqual(expected);
  });

  it('Should use webp images if supported', () => {
    const srcThatShouldBeSelected = {format: 'webp', width: 99};
    const srcThatShouldNotBeSelected = {format: 'webp', width: 98};
    const props = {
      srcSet: [srcThatShouldBeSelected, srcThatShouldNotBeSelected],
      supportsWebp: true,
      maxImageWidth: 100,
    };
    const expected = srcThatShouldBeSelected;
    const result = selectSrc(props);
    expect(result).toEqual(expected);
  });
});
