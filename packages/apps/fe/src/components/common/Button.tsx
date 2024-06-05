import { MouseEventHandler, PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}>;

const Button = ({ onClick, disabled = false, children }: Props) => {
  return (
    <button className={'comm-btn'} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
