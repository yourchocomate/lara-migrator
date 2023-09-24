import { customSplit, modifiers, types } from "./util";

export function differBlocksByStatementType(sql) {
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
      table = splitted[2].replace(/`/g, "");
      // schema = splitted.slice(3).join(" ");
    }

    // remove parenthesis from schema start and end
    schema = schema.replace(/^\(/, "").replace(/\)$/, "");
    schema = customSplit(schema);

    blocks.push({ schema, operation, table, modifier });
  }
  
  const migrations = blocks.map((block) => {
    return getmigration(block.table, block.schema, block.operation);
  });

  return migrations;
}

export const getmigration = (table, schema, type) => {
  type = type.split(" ");

  return `// ${type[0].toLowerCase()}_${table.toLowerCase()}_table_${new Date().getTime()}.php

public function up(): void
{
    Schema::${
      type[0].toLowerCase() !== "create" ? "table" : "create"
    }('${table}', function (Blueprint $table) {
        ${schema.map(makeMigration).join("\t\t")}
    });
}
`;
};

export const makeMigration = (schema) => {
  const splitted = schema.split(
    / (?=(?:(?:[^']*'[^']*')*[^']*$)(?:(?:[^"]*"[^"]*")*[^"]*$)(?![^\(]*\)))/
  );
  const name = splitted[0].replace(/`/g, "").toLowerCase();

  if (
    [
      "primary",
      "key",
      "constraint",
      "unique",
      "index",
      "fulltext",
      "spatial",
    ].includes(name)
  ) {
    return "";
  }

  if (name === "id") {
    return "$table->id();\n";
  }

  const type = splitted[1]
    .split("")
    .map((c) => {
      if (/[a-z]/.test(c)) {
        return c;
      }
      return "";
    })
    .join("");

  const length = splitted[1]?.split("(")[1]?.split(")")[0] || undefined;

  let migration = `\$table->${types[type]}('${name}'${
    length ? `, '${length}'` : ""
  })`;

  for (let i = 2; i < splitted.length; i++) {
    const modifier = splitted[i].toLowerCase();
    if (
      modifiers[modifier] &&
      ![
        "default",
        "not",
        "charset",
        "collate",
        "stored",
        "virtual",
        "after",
        "first",
        "comment",
      ].includes(modifier)
    ) {
      migration += `->${modifiers[modifier]}()`;
    }

    if (modifier === "not") {
      migration += `->${modifiers[splitted[i + 1].toLowerCase()]}(false)`;
      i++;
    }

    if (
      [
        "default",
        "charset",
        "collate",
        "stored",
        "virtual",
        "after",
        "first",
        "comment",
      ].includes(modifier)
    ) {
      migration += `->${modifiers[modifier]}('${splitted[i + 1].replace(
        /'/g,
        ""
      )}')`;
      i++;
    }
  }

  migration += ";\n";
  return migration;
};
