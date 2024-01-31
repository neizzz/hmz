import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{}>;

const Modal = ({ children }: Props) => {
  return <div className={'centering-layer dimm'}>{children}</div>;
};

export default Modal;
