import "./style.css";
import Alpine from "alpinejs";
window.alpine = Alpine;

import { emitter } from  "./emitter.js";
import { differBlocksByStatementType } from "./migrator";
import { detectIfValidSQL } from "./util";

Alpine.store("errors", []);

Alpine.data("migrator", () => ({
    sql: "",
    migrations: "",

    init() {
        // this.migrate();
        console.log("migrator");
    },

    migrate: function (text = "") {
      const sql = this.sql + (text ? '\n' + (text || "") : "");

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
        this.migrations = differBlocksByStatementType(sql).join("\n\n");
      } catch (error) {
        Alpine.store("errors").push(error.message);
        emitter.emit("error:cleanup", { after: 2000 }); 
      }
    }

}));


Alpine.start();