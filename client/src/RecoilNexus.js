import {
  useGetRecoilValueInfo_UNSTABLE,
  useRecoilCallback,
  useRecoilTransaction_UNSTABLE,
} from "recoil";

const nexus = {};

export default function RecoilNexus() {
  nexus.get = useRecoilCallback(
    ({ snapshot }) =>
      function (atom) {
        return snapshot.getLoadable(atom).contents;
      },
    []
  );

  nexus.getPromise = useRecoilCallback(
    ({ snapshot }) =>
      function (atom) {
        return snapshot.getPromise(atom);
      },
    []
  );

  const getInfo = useGetRecoilValueInfo_UNSTABLE();
  const transact = useRecoilTransaction_UNSTABLE(({ set }) => set);

  nexus.set = useRecoilCallback(({ set }) => {
    return function (recoilState, valOrUpdater) {
      const update = {
        atom: transact,
        selector: set,
      }[getInfo(recoilState).type];

      update(recoilState, valOrUpdater);
    };
  }, []);

  nexus.reset = useRecoilCallback(({ reset }) => reset, []);

  return null;
}

export function getRecoil(atom) {
  return nexus.get(atom);
}

export function getRecoilPromise(atom) {
  return nexus.getPromise(atom);
}

export function setRecoil(atom, valOrUpdater) {
  nexus.set(atom, valOrUpdater);
}

export function resetRecoil(atom) {
  nexus.reset(atom);
}
