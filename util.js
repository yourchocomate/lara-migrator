export const schemasplitregex = /,(?=(?:(?:[^']*'[^']*')*[^']*$)(?:(?:[^"]*"[^"]*")*[^"]*$)(?![^\(]*\)))/;

export const types = (type) => {
    const types = {
    'string': 'string',
    'int': 'integer',
    'integer': 'integer',
    'tinyint': 'tinyInteger',
    'smallint': 'smallInteger',
    'mediumint': 'mediumInteger',
    'bigint': 'bigInteger',
    'unsigned': 'unsigned',
    'float': 'float',
    'double': 'double',
    'decimal': 'decimal',
    'date': 'date',
    'datetime': 'dateTime',
    'time': 'time',
    'timestamp': 'timestamp',
    'year': 'year',
    'char': 'char',
    'varchar': 'string',
    'tinyblob': 'tinyText',
    'tinytext': 'tinyText',
    'blob': 'text',
    'text': 'text',
    'mediumblob': 'mediumText',
    'mediumtext': 'mediumText',
    'longblob': 'longText',
    'longtext': 'longText',
    'enum': 'enum',
    'json': 'json',
    'jsonb': 'jsonb',
    'binary': 'binary',
    'varbinary': 'binary',
    'point': 'point',
    'linestring': 'lineString',
    'polygon': 'polygon',
    'geometry': 'geometry',
    'multipoint': 'multiPoint',
    'multilinestring': 'multiLineString',
    'multipolygon': 'multiPolygon',
    'geometrycollection': 'geometryCollection'
    }

    if(!types[type]) throw new Error(`Invalid data type ${type}`);

    return types[type];
}

export const modifiers = (type, ignoreError = false) => {
    const types = {
        'unsigned': 'unsigned',
        'null': 'nullable',
        'not null': 'nullable',
        'default': 'default',
        'charset': 'charset',
        'collate': 'collate',
        'stored': 'storedAs',
        'virtual': 'virtualAs',
        'after': 'after',
        'first': 'first',
        'comment': 'comment'
    }

    if(!types[type] && !ignoreError) throw new Error(`Invalid modifier ${type}`);

    return types[type];
} 

export function detectIfValidSQL(sql) {
    const sqlRegex = /CREATE TABLE|INSERT INTO|UPDATE|DELETE FROM|DROP TABLE|ALTER TABLE|CREATE DATABASE|DROP DATABASE|USE|SELECT|SHOW|DESCRIBE|TRUNCATE TABLE|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER|RENAME TABLE|RENAME COLUMN|RENAME DATABASE|RENAME USER|RENAME INDEX|RENAME VIEW|RENAME EVENT|RENAME FUNCTION|RENAME PROCEDURE|RENAME TRIGGER/i;
    return sqlRegex.test(sql);
}

export function customSplit(str) {
    const parts = [];
    let part = '';
    let insideQuotes = false;
    let insideParentheses = 0;
    
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        
        if (char === ',' && !insideQuotes && insideParentheses === 0) {
        parts.push(part.trim());
        part = '';
        } else {
        part += char;
    
        if (char === "'") {
            insideQuotes = !insideQuotes;
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === '(') {
            insideParentheses++;
        } else if (char === ')') {
            insideParentheses--;
        }
        }
    }
    
    parts.push(part.trim());
    return parts;
}