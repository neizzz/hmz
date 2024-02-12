type UserInfo = {
  nickname?: string;
};

const userInfo: UserInfo = {};

export const setUserNickname = (nickname: string) => {
  userInfo.nickname = nickname;
};

export const getUserNickname = () => userInfo.nickname;
