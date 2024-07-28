import { IpcMessage } from '../in-game/ipc';

import pm2 from 'pm2';

export function sendMessage(pid: number, data: IpcMessage) {
  // 현재 pm2에서 제공되는 타입들은 구버전 타입들이며 현재 인터페이스와 싱크가 안맞음.
  // @ts-ignore
  pm2.sendDataToProcessId(
    {
      id: pid,
      type: 'process:msg',
      topic: true,
      data,
    },
    () => {}
  );
}

export async function getPidsExceptMe(): Promise<number[]> {
  return await new Promise(resolve => {
    let pids: number[];
    pm2.list((err: Error, procDescs: pm2.ProcessDescription[]) => {
      const myPid = +(process.env.pm_id as string);
      pids = procDescs
        .map(({ pm_id }) => pm_id as number)
        .filter(pm_id => pm_id !== myPid);
      resolve(pids);
    });
  });
}
