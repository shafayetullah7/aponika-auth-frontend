import { createStrokeIcon } from "./create-stroke-icon";

export const UserCircleIcon = createStrokeIcon([
  { d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" },
  { d: "M6 18c0-3.314 2.686-6 6-6s6 2.686 6 6" },
]);

export const EnvelopeIcon = createStrokeIcon([
  { d: "M4 8l8 5 8-5" },
  { d: "M4 8v10h16V8" },
]);

export const KeyIcon = createStrokeIcon([
  { d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" },
  { d: "M14 12h6" },
  { d: "M18 10v4" },
]);
