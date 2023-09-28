import "./style.css";
import Alpine from "alpinejs";
window.alpine = Alpine;

import { emitter } from  "@lib/emitter";
import { generateMigrations } from "@lib/migrator";
import { detectIfValidSQL } from "@lib/util";

Alpine.store("errors", []);

/**
 * @typedef {object} AlpineData
 * @property {string} sql
 * @property {string[]} migrations
 * @property {string} selectedmigration
 * @property {string[]} filtered
 * @property {function} init
 * @property {function} migrate
 */

Alpine.data("migrator", () => ({
    sql: "",
    migrations: [],
    selectedmigration: "",
    filtered: [],
    search: "",

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
        this.migrations = generateMigrations(sql);
      } catch (error) {
        Alpine.store("errors").push(error.message);
        emitter.emit("error:cleanup", { after: 2000 }); 
      }
    },

    filter: function () {
      const splitted = this.search.toLowerCase().split(",");
      this.filtered = this.migrations.filter(migration => {
        return splitted.some(search => {
          return migration.name.toLowerCase().includes(search.trim());
        });
      });
    },

    copyToClipboard: function (text) {
      navigator.clipboard.writeText(text);
    }

}));


Alpine.start();