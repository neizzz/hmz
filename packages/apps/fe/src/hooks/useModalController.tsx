import Modal from '@components/common/Modal';
import { PropsWithChildren, useMemo, useState } from 'react';

type Props = PropsWithChildren<{
  onSubmit: () => void;
}>;

export const useModalController = ({ children, onSubmit }: Props) => {
  const [show, setShow] = useState(false);

  return {
    show: () => setShow(true),
    hide: () => setShow(false),
    AutoModal: () => <>{show && <Modal>{children}</Modal>}</>,
  };
};
