import { MouseEventHandler, useCallback, useEffect, useState } from 'react';
import { useHmzClient } from '@hooks/useHmzClient';
import { RoomAvailable } from 'colyseus.js';
import Button from '@components/common/Button';
import { RoomType } from '@shared/types';
import { getUserNickname } from '@utils/user';
import {
  navigateToWaitingRoomPage,
  navigateToWaitingRoomPageWithCreation,
} from '@utils/route';
import AvailableRoom from '@components/AvailableRoom';
// import MakeRoomForm from '@components/MakeRoomForm';

const client = useHmzClient();

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
  return (
    <Button
      onClick={() => {
        const nickname = getUserNickname();
        navigateToWaitingRoomPageWithCreation({
          title: `${nickname}'s room`,
          hostJoinInfo: { name: getUserNickname() },
          maxPlayers: 12,
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
  onClick: MouseEventHandler;
}) => {
  return (
    <Button disabled={disabled} onClick={onClick}>
      Join
    </Button>
  );
};

const LobbyPage = () => {
  const [selectedAvailableRoom, setSelectedAvailableRoom] =
    useState<RoomAvailable>();
  const [availableRooms, setAvailableRooms] = useState<RoomAvailable[]>([]);

  // const makeRoomModalController = useModalController({
  //   children: <MakeRoomForm />,
  //   onSubmit: () => {
  //     makeRoomModalController.hide();
  //   },
  // });

  useEffect(() => {
    client.getAvailableRooms(RoomType.WAITING_ROOM).then(setAvailableRooms);
  }, []);

  return (
    <div className={'centering-layer'}>
      <section className={'lobby-page-cont comm-cont'}>
        {/* <button onClick={() => makeRoomModalController.show()}>Make room</button>
      <makeRoomModalController.AutoModal /> */}
        <ul className={'avlb-room-list'}>
          {availableRooms.length > 0
            ? availableRooms.map(availableRoom => (
                <AvailableRoom
                  key={availableRoom.roomId}
                  availableRoom={availableRoom}
                  selected={
                    selectedAvailableRoom?.roomId === availableRoom.roomId
                  }
                  onClick={() => {
                    setSelectedAvailableRoom(availableRoom);
                  }}
                />
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
            <JoinButton
              disabled={!selectedAvailableRoom}
              onClick={() => {
                navigateToWaitingRoomPage(selectedAvailableRoom.roomId);
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LobbyPage;
