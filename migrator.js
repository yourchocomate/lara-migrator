import { customSplit, modifiers, types } from "./util";

/**
 * Function to generate migrations from SQL
 * @param {string} sql 
 * @returns {string[]} migrations
 */

export const generateMigrations = (sql) => {
  let blocks = [];
  //   const statements = /CREATE TABLE|DROP TABLE|ALTER TABLE|TRUNCATE TABLE/gi;
  const statements = /CREATE TABLE|INSERT INTO/gi;

  const alterstatements =
    /ADD COLUMN|DROP COLUMN|CHANGE COLUMN|MODIFY COLUMN|RENAME COLUMN/gi;
  let match = statements.exec(sql);

  while (match != null) {
    const operation = match[0];

    if (operation === "INSERT INTO") {
      match = statements.exec(sql);
      continue;
    }

    const prev = match.index;
    match = statements.exec(sql);
    const next = match ? match.index : sql.length;

    const unfiltered = sql.substring(prev, next).trim();
    const length = unfiltered.length;

    let schema = "";
    let table = "";
    let modifier = "";

    const splitted = unfiltered.split(" ");

    const nextoperation = splitted.slice(3).join(" ");
    let altermatched = undefined;

    if ((altermatched = alterstatements.exec(nextoperation))) {
      schema = altermatched.input.split(" ").slice(2).join(" ");
      modifier = altermatched[0];
    } else {
      for (let i = 0; i < length; i++) {
        if (i > unfiltered.indexOf("(") && i < unfiltered.lastIndexOf(")")) {
          schema += unfiltered[i];
        }
      }
      // @regex: to remove backticks
      table = splitted[2].replace(/`/g, "");
    }

    // @regex: to remove parenthesis from schema start and end
    schema = schema.replace(/^\((.*)\)$/, '$1');
    schema = customSplit(schema);

    blocks.push({ schema, operation, table, modifier });
  }
  
  const migrations = blocks.map(block => getmigration(block.table, block.schema, block.operation));

  return migrations;
}

/**
 * Generates migration from schema
 * @param {string} table 
 * @param {string[]} schema 
 * @param {string} type 
 * @returns {string}
 */

export const getmigration = (table, schema, type) => {
  type = type.split(" ");
  const name = `${type[0].toLowerCase()}_${table.toLowerCase()}`
  return {
    name,
    migration: `
    <?php

      use Illuminate\\Database\\Migrations\\Migration;
      use Illuminate\\Database\\Schema\\Blueprint;
      use Illuminate\\Support\\Facades\\Schema;
        
      return new class extends Migration
      {
            /**
             * Run the migrations.
             */
            public function up(): void
            {
                  Schema::${
                    type[0].toLowerCase() !== "create" ? "table" : "create"
                  }('${table}', function (Blueprint $table) {
                        ${schema.map(makeMigration).filter(m => m.length > 0).join("\t\t\t\t\t\t")}                 });
            }
            
            /**
             * Reverse the migrations.
             */
            public function down(): void
            {
                  Schema::drop('${table}');
            }
      };`
  }
};

/**
 * Parses schema and generates migration
 * @param {string} schema 
 * @returns {string} migration
 */

export const makeMigration = (schema) => {

  const statements = ["default","charset","collate","stored","virtual","after","first","comment","not"];
  const basestatements = ["primary","key","constraint","fulltext","unique"];

  //  @regex: to split schema by spaces but ignore spaces inside quotes
  const splitted = schema.split(
    / (?=(?:(?:[^']*'[^']*')*[^']*$)(?:(?:[^"]*"[^"]*")*[^"]*$)(?![^\(]*\)))/
  );
  const name = splitted[0].replace(/`/g, "");
  const namelower = name.toLowerCase()

  if (namelower === "id") return "\$table->id();\n";
  if (basestatements.includes(namelower)) return handleKeysIndexes(namelower, schema);

  const type = splitted[1]
    .split("")
    .map(c => /[a-z]/i.test(c) ? c : "")
    .join("").toLowerCase();

  if (!type) throw new Error(`Invalid type ${type} for column ${name}`);

  const length = splitted[1]?.split("(")[1]?.split(")")[0] || undefined;

  let migration = `\$table->${types(type)}('${name}'${
    length ? `, '${length}'` : ""
  })`;

  for (let i = 2; i < splitted.length; i++) {
    const modifier = splitted[i].toLowerCase();
    if (
      !statements.includes(modifier)
      && modifiers(modifier, true)
    ) {
      migration += `->${modifiers(modifier)}()`;
    }

    if (modifier === "not") {
      migration += `->${modifiers(splitted[i + 1].toLowerCase())}(false)`;
      i++;
    }

    if (statements.slice(0, -1).includes(modifier)) {
      migration += `->${modifiers(modifier)}('${splitted[i + 1].replace(/'/g,"")}')`;
      i++;
    }
  }

  migration += ";\n";
  return migration;
};

/**
 * Handles different types of keys and indexes and parses them to generate migration
 * @param {string} type 
 * @param {string} sql 
 * @returns {string}
 */
export const handleKeysIndexes = (type, sql) => {
  switch (type) {
    case "primary":
      return handleKey(sql, type);
    case "key":
      return handleKey(sql, type);
    case "constraint":
      return handleConstraint(sql);
    case "fulltext":
      return handleKey(sql, type);
    case "unique":
      return handleKey(sql, type);
    default:
      return "";
  }
}

/**
 * Split indexes for differnt types of sql statements
 * @typedef {object} KeyBreakpoints
 */

export const keyBreakpoints = {
  "primary": 2,
  "key": 2,
  "fulltext": 1,
  "unique": 3,
}

/**
 * Generates migration for keys and indexes
 * @param {string} sql 
 * @param {string} type 
 * @returns {string}
 */

export const handleKey = (sql, type) => {
  const splitted = sql.split(" ");
  // @regex: to remove parenthesis from column start and end, and remove backticks from column names
  const columns = splitted[keyBreakpoints[type]].replace(/^\((.*)\)$/, '$1').split(",").map(c => c.trim().replace(/['"`]/g, '')).filter(c => c !== "id");

  if(columns.length === 0) return "";

  const datatype = type === "key" ? "index" : type;

  return columns.length > 1 ? `\$table->${datatype}([${columns.map(c => `'${c}'`).join(",")}]);\n` : `\$table->${datatype}('${columns[0]}');\n`;
}

/**
 * Handles constraints | foreign keys
 * @param {string} sql 
 * @returns {string}
 */

export const handleConstraint = (sql) => {
  const splitted = sql.split(" ");
  const type = splitted[2].toLowerCase();
  if(type === "foreign") return handleForeign(sql);
  return "";
}

/**
 * Handles foreign keys and generates migration
 * @param {string} sql 
 * @returns {string}
 */

export const handleForeign = (sql) => {
  const splitted = sql.split(" ");
  // @regex: to remove parenthesis from column start and end, and remove backticks
  const column = splitted[4].replace(/^\((.*)\)$/, '$1').replace(/['"`]/g, '');
  let table = "";
  let references = "";
  
  let ondelete = undefined;
  let onupdate = undefined;

  if(splitted[7].toLowerCase() === "on") {
    const refer = splitted[6].split("(");
    // @regex: to remove backticks
    table = refer[0].replace(/['"`]/g, '');
    // @regex: to remove parenthesis from references start and end, and remove backticks
    references = refer[1].replace(/^\((.*)\)$/, '$1').replace(/['"`]/g, '');
  } else {
    table = splitted[6].replace(/['"`]/g, '');
    references = splitted[7].replace(/^\((.*)\)$/, '$1').replace(/['"`]/g, '');
  }

  ondelete = splitted[9].toLowerCase() === "delete" ? splitted[10].toLowerCase() : undefined;
  onupdate = splitted[9].toLowerCase() === "update" ? splitted[10].toLowerCase() : undefined;

  return `\$table->foreign('${column}')->references('${references}')->on('${table}')${ondelete ? `->onDelete('${ondelete}')` : ""}${onupdate ? `->onUpdate('${onupdate}')` : ""};\n`;
}