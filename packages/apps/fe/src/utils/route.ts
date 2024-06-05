import { createBrowserRouter } from 'react-router-dom';

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

export const navigateToWaitingRoomPageWithCreation = () => {
  ThisContext.router.navigate(`/room/create`);
};
