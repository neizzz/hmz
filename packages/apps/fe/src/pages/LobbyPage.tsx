import { useCallback } from 'react';
import { useHmzClient } from '@hooks/useHmzClient';
// import { useModalController } from '@hooks/useModalController';
import { useNavigate } from 'react-router-dom';
// import MakeRoomForm from '@components/MakeRoomForm';

const LobbyPage = () => {
  const navigate = useNavigate();
  const client = useHmzClient();

  // const makeRoomModalController = useModalController({
  //   children: <MakeRoomForm />,
  //   onSubmit: () => {
  //     makeRoomModalController.hide();
  //   },
  // });

  return (
    <div>
      {/* <button onClick={() => makeRoomModalController.show()}>Make room</button>
      <makeRoomModalController.AutoModal /> */}
    </div>
  );
};

export default LobbyPage;
