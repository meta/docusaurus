/**
 * @vitest-environment jsdom
 */

import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Download from '../components/Icon/Download';
import Loading from '../components/Icon/Loading';
import Offline from '../components/Icon/Offline';
import Warning from '../components/Icon/Warning';

const snapshotTestDescription = 'Should render a snapshot that is good';

describe('Download icon', () => {
  it(snapshotTestDescription, () => {
    const {container} = render(<Download />);
    expect(container.firstElementChild).toMatchSnapshot();
  });
});

describe('Loading icon', () => {
  it(snapshotTestDescription, () => {
    const {container} = render(<Loading />);
    expect(container.firstElementChild).toMatchSnapshot();
  });
});

describe('Offline icon', () => {
  it(snapshotTestDescription, () => {
    const {container} = render(<Offline />);
    expect(container.firstElementChild).toMatchSnapshot();
  });
});

describe('Warning icon', () => {
  it(snapshotTestDescription, () => {
    const {container} = render(<Warning />);
    expect(container.firstElementChild).toMatchSnapshot();
  });
});
