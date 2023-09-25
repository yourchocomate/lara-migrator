import { EventEmitter } from "events";

export const emitter = new EventEmitter();

emitter.on("error:cleanup", (e) => {
  const length = window.alpine.store("errors").length;

  setTimeout(() => {
    window.alpine.store("errors").splice(0, 1);
  }, (e.after || 2000) * length);
});
