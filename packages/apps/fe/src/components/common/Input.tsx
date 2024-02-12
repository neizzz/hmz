import { PropsWithChildren, useRef } from 'react';

type Props = PropsWithChildren<{
  autoFocus?: boolean;
  label?: string;
  initialValue: string;
  onSubmit: (value: string) => void;
  onChange?: (value: string) => void;
}>;

const Input = ({
  autoFocus,
  label,
  initialValue,
  onSubmit,
  onChange,
  children,
}: Props) => {
  const inputElRef = useRef<HTMLInputElement>(null);
  return (
    <div className={'input-cont'}>
      <label>{label}</label>
      <input
        ref={inputElRef}
        autoFocus={autoFocus}
        type="text"
        defaultValue={initialValue}
        onKeyDown={e => {
          if (e.code === 'Enter') {
            onSubmit(inputElRef.current.value);
          }
        }}
        onChange={e => onChange?.(e.target.value)}
      />
      {children}
    </div>
  );
};

export default Input;

// #7da888
