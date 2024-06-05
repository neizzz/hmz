import { MouseEventHandler, useCallback, useEffect, useState } from 'react';
import { useHmzClient } from '@hooks/useHmzClient';
import { RoomAvailable } from 'colyseus.js';
import Button from '@components/common/Button';
import clsx from 'clsx';
import { RoomType } from '@shared/types';
import { getUserNickname } from '@utils/user';
import {
  navigateToWaitingRoomPage,
  navigateToWaitingRoomPageWithCreation,
} from '@utils/route';
import { useLoading } from '../contexts/LoadingContext';
// import MakeRoomForm from '@components/MakeRoomForm';

const RefreshButton = () => {
  return (
    <Button
      disabled
      onClick={() => {
        // TODO:
      }}
    >
      refresh
    </Button>
  );
};

const CreationButton = () => {
  return (
    <Button
      disabled
      onClick={() => {
        // TODO:
      }}
    >
      Create
    </Button>
  );
};

const QuickRoomButton = () => {
  // const client = useHmzClient();
  const { loadingFor } = useLoading();

  return (
    <Button
      onClick={() => {
        loadingFor(async () => {
          navigateToWaitingRoomPageWithCreation();
        });
      }}
    >
      Quick Room
    </Button>
  );
};

const JoinButton = ({
  disabled,
  onClick,
}: {
  disabled?: boolean;
  onClick?: MouseEventHandler;
}) => {
  // const { loadingFor } = useLoading();
  return (
    <Button disabled={disabled} onClick={onClick}>
      Join
    </Button>
  );
};

const LobbyPage = () => {
  const [selectedRoom, setSelectedRoom] = useState<RoomAvailable>();
  const [rooms, setRooms] = useState<RoomAvailable[]>([]);
  const client = useHmzClient();

  // const makeRoomModalController = useModalController({
  //   children: <MakeRoomForm />,
  //   onSubmit: () => {
  //     makeRoomModalController.hide();
  //   },
  // });

  useEffect(() => {
    client.getAvailableRooms().then(setRooms);
  }, []);

  return (
    <div className={'centering-layer'}>
      <section className={'lobby-page-cont comm-cont'}>
        {/* <button onClick={() => makeRoomModalController.show()}>Make room</button>
      <makeRoomModalController.AutoModal /> */}
        <ul className={'avlb-room-list'}>
          {rooms.length > 0
            ? rooms.map(room => (
                <li
                  key={room.roomId}
                  className={clsx(
                    'avlb-room',
                    selectedRoom?.roomId === room.roomId && 'selected'
                  )}
                  onClick={() => {
                    setSelectedRoom(room);
                  }}
                >
                  {JSON.stringify(room)}
                </li>
              ))
            : 'no rooms'}
        </ul>

        <div className={'lobby-page-act-btns'}>
          <div className={'secondary-act-btn-sect'}>
            <QuickRoomButton />
            <CreationButton />
            <RefreshButton />
          </div>
          <div className={'primary-act-btn-sect'}>
            <JoinButton disabled={!selectedRoom} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LobbyPage;
