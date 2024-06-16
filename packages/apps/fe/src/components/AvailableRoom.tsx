import { WaitingRoomMetadata } from '@shared/types';
import clsx from 'clsx';
import { RoomAvailable } from 'colyseus.js';

type Props = {
  availableRoom: RoomAvailable<WaitingRoomMetadata>;
  selected?: boolean;
  onClick?: () => void;
};

const AvailableRoom = ({ availableRoom, selected, onClick }: Props) => {
  return (
    <li className={clsx('avlb-room', selected && 'selected')} onClick={onClick}>
      <span>{availableRoom.metadata.title}</span>
      <span>
        {availableRoom.clients}/{availableRoom.maxClients}
      </span>
    </li>
  );
};

export default AvailableRoom;
