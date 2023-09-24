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

    migrate: function (text) {
      const sql = this.sql + '\n' + (text || "");
      if(!detectIfValidSQL(sql)) {
          Alpine.store("errors").push("Invalid SQL");
          emitter.emit("error:cleanup", { after: 2000 }); 
          return;
      }

      this.migrations = differBlocksByStatementType(sql).join("\n\n");
    },

    inputChange: function() {
        if(this.sql.length < 1) {
            this.migrations = "";
        }
    }

}));


Alpine.start();