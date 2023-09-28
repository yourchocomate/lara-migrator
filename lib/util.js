export const schemasplitregex =
  /,(?=(?:(?:[^']*'[^']*')*[^']*$)(?:(?:[^"]*"[^"]*")*[^"]*$)(?![^\(]*\)))/;

/**
 * Get data type for migration
 * @param {string} type 
 * @returns {string}
 */
export const types = (type) => {
  const types = {
    string: "string",
    int: "integer",
    integer: "integer",
    tinyint: "tinyInteger",
    smallint: "smallInteger",
    mediumint: "mediumInteger",
    bigint: "bigInteger",
    unsigned: "unsigned",
    float: "float",
    double: "double",
    decimal: "decimal",
    date: "date",
    datetime: "dateTime",
    time: "time",
    timestamp: "timestamp",
    year: "year",
    char: "char",
    varchar: "string",
    tinyblob: "tinyText",
    tinytext: "tinyText",
    blob: "text",
    text: "text",
    mediumblob: "mediumText",
    mediumtext: "mediumText",
    longblob: "longText",
    longtext: "longText",
    enum: "enum",
    json: "json",
    jsonb: "jsonb",
    binary: "binary",
    varbinary: "binary",
    point: "point",
    linestring: "lineString",
    polygon: "polygon",
    geometry: "geometry",
    multipoint: "multiPoint",
    multilinestring: "multiLineString",
    multipolygon: "multiPolygon",
    geometrycollection: "geometryCollection",
  };

  if (!types[type]) throw new Error(`Invalid data type ${type}`);

  return types[type];
};

/**
 * Get modifier type
 * @param {string} type 
 * @param {boolean} ignoreError 
 * @returns {string}
 */
export const modifiers = (type, ignoreError = false) => {
  const types = {
    unsigned: "unsigned",
    null: "nullable",
    "not null": "nullable",
    default: "default",
    charset: "charset",
    collate: "collate",
    stored: "storedAs",
    virtual: "virtualAs",
    after: "after",
    first: "first",
    comment: "comment",
  };

  if (!types[type] && !ignoreError) throw new Error(`Invalid modifier ${type}`);

  return types[type];
};

/**
 * Detects if SQL is valid
 * @param {string} sql 
 * @returns {boolean}
 */
export function detectIfValidSQL(sql) {
  const sqlRegex =
    /CREATE TABLE|INSERT INTO|UPDATE|DELETE FROM|DROP TABLE|ALTER TABLE|CREATE DATABASE|DROP DATABASE|USE|SELECT|SHOW|DESCRIBE|TRUNCATE TABLE|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER/i;
  return sqlRegex.test(sql);
}

/**
 * Split string by comma but ignore commas inside quotes and parentheses
 * @param {string} str 
 * @returns {string[]}
 */
export function customSplit(str) {
  const parts = [];
  let part = "";
  let insideQuotes = false;
  let insideParentheses = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === "," && !insideQuotes && insideParentheses === 0) {
      parts.push(part.trim());
      part = "";
    } else {
      part += char;

      if (char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "(") {
        insideParentheses++;
      } else if (char === ")") {
        insideParentheses--;
      }
    }
  }

  parts.push(part.trim());
  return parts;
}

/**
 * Migration schema template for latest laravel versions
 * @param {string} type 
 * @param {string} table 
 * @param {string[]} schema 
 * @param {string} indents 
 * @returns {string}
 */

export const migrationSchema = (type, table, schema, indents = "") => {
  return `
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
                Schema::${type}('${table}', function (Blueprint $table) {
                        ${schema.join(indents)}                 });
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
