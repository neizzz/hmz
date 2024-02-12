import clsx from 'clsx';
import { CSSProperties, PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  heading?: boolean;
  noCursor?: boolean;
  text?: string;
  style?: CSSProperties;
}>;

const Text = ({ heading, noCursor, text, children, style }: Props) => {
  return (
    <div
      className={clsx(
        'text-cont',
        heading && 'heading-txt',
        noCursor && 'no-cursor'
      )}
      style={style}
    >
      {children ?? text}
    </div>
  );
};

export default Text;
