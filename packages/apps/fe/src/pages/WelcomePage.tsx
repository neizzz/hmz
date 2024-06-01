import Input from '@components/common/Input';
import Text from '@components/common/Text';
import { navigateToLobbyPage } from '@utils/route';
import { setUserNickname } from '@utils/user';
import { useMemo, useState } from 'react';

const SAVE_KEY_NICKNAME = 'hmz.save.nickname';

const WelcomePage = () => {
  const savedNickname = useMemo(() => {
    return localStorage.getItem(SAVE_KEY_NICKNAME) ?? '';
  }, []);

  const [showEnterText, setShowEnterText] = useState(savedNickname.length > 1);

  return (
    <div className={'centering-layer'}>
      <div className={'welcome-cont'}>
        <Text heading={true} style={{ fontSize: '8rem' }}>
          H M Z
        </Text>
        <Input
          autoFocus
          label={'Nickname:'}
          initialValue={savedNickname}
          onSubmit={nickname => {
            localStorage.setItem(SAVE_KEY_NICKNAME, nickname);
            setUserNickname(nickname);
            navigateToLobbyPage();
          }}
          onChange={nickname => {
            nickname.length > 1
              ? setShowEnterText(true)
              : setShowEnterText(false);
          }}
        />
        {showEnterText ? (
          <Text
            style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'rgb(0, 85, 255)',
            }}
          >
            press 'Enter' key
          </Text>
        ) : (
          <Text
            style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ed2e14' }}
          >
            input more charactors
          </Text>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
