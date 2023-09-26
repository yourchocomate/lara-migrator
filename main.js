import "./style.css";
import Alpine from "alpinejs";
window.alpine = Alpine;

import { emitter } from  "./emitter";
import { generateMigrations } from "./migrator";
import { detectIfValidSQL } from "./util";

Alpine.store("errors", []);

/**
 * @typedef {object} AlpineData
 * @property {string} sql
 * @property {string} migrations
 * @property {function} init
 * @property {function} migrate
 */

Alpine.data("migrator", () => ({
    sql: "",
    migrations: "",

    init() {
        console.log("migrator");
    },

    /**
     * Executes migration
     * @param {string} text 
     * @returns {void}
     */

    migrate: function (text = "") {
      const sql = text || this.sql;

      if(sql.length === 0) {
        this.migrations = "";
        return;
      }

      if(!detectIfValidSQL(sql)) {
          Alpine.store("errors").push("Invalid SQL");
          emitter.emit("error:cleanup", { after: 2000 }); 
          return;
      }

      try {
        this.migrations = generateMigrations(sql).join("\n\n");
      } catch (error) {
        Alpine.store("errors").push(error.message);
        emitter.emit("error:cleanup", { after: 2000 }); 
      }
    }

}));


Alpine.start();