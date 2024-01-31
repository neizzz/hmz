import { useRef } from 'react';

type Props = {
  initialValue: string;
  onSubmit: (value: string) => void;
};

const Input = ({ initialValue, onSubmit }: Props) => {
  const inputElRef = useRef<HTMLInputElement>(null);
  return (
    <div className={'input-nickname-cont'}>
      <input
        ref={inputElRef}
        type="text"
        defaultValue={initialValue}
        onKeyDown={e => {
          if (e.code === 'Enter') {
            onSubmit(inputElRef.current.value);
          }
        }}
      />
    </div>
  );
};

export default Input;
