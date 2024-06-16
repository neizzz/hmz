import { WaitingRoomCreateInfo } from '@shared/types';
import { createBrowserRouter } from 'react-router-dom';
import { encode } from './data';

type Router = ReturnType<typeof createBrowserRouter>;

const ThisContext = {
  router: undefined as Router,
} as { router: Router };

export const initRouter = (
  ...params: Parameters<typeof createBrowserRouter>
): Router => {
  ThisContext.router = createBrowserRouter(...params);
  return ThisContext.router;
};

// export const getRouter = (): Router => {
//   return ThisContext.router;
// };

export const navigateToLobbyPage = () => {
  ThisContext.router.navigate(`/rooms`);
};

export const navigateToWaitingRoomPage = (roomId: string) => {
  ThisContext.router.navigate(`/room/${roomId}`);
};

export const navigateToWaitingRoomPageWithCreation = (
  options: WaitingRoomCreateInfo
) => {
  ThisContext.router.navigate(`/room/create/${encode(options)}`);
};
