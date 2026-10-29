import type {ReactNode} from 'react';

export default function Typography(props: {children: ReactNode}) {
  return <p>{props.children}</p>;
}
