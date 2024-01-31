import Input from '@components/common/Input';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const SAVE_KEY_NICKNAME = 'hmz.save.nickname';

const WelcomePage = () => {
  const navigate = useNavigate();

  const savedNickname = useMemo(() => {
    return localStorage.getItem(SAVE_KEY_NICKNAME) ?? '';
  }, []);

  return (
    <div className={'centering-layer'}>
      <Input
        initialValue={savedNickname}
        onSubmit={nickname => {
          localStorage.setItem(SAVE_KEY_NICKNAME, nickname);
          navigate('/rooms');
        }}
      />
    </div>
  );
};

export default WelcomePage;
