import { Howl } from "howler";

let assignSound;
let unassignSound;

export const useAssignSounds = (volume = 1) => {
  if (!assignSound) {
    assignSound = new Howl({
      src: ["/sounds/select/selectItem.mp3"],
      volume,
      preload: true,
    });
  } else {
    assignSound.volume(volume);
  }

  if (!unassignSound) {
    unassignSound = new Howl({
      src: ["/sounds/select/unSelectItem.mp3"],
      volume,
      preload: true,
    });
  } else {
    unassignSound.volume(volume);
  }

  const playAssign = () => assignSound.play();
  const playUnassign = () => unassignSound.play();

  return { playAssign, playUnassign };
};
