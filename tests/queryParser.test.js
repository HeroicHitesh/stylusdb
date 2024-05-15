const { parseJoinClause, parseSelectQuery } = require('../src/queryParser');

test('Parse SQL Query', () => {
    const query = 'SELECT id, name FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['id', 'name'],
        table: 'student',
        whereClauses: [],
        joinCondition: null,
        joinTable: null,
        joinType: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse SQL Query with WHERE Clause', () => {
    const query = 'SELECT id, name FROM student WHERE age = 25';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['id', 'name'],
        table: 'student',
        whereClauses: [{
            "field": "age",
            "operator": "=",
            "value": "25",
        }],
        joinCondition: null,
        joinTable: null,
        joinType: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse SQL Query with Multiple WHERE Clauses', () => {
    const query = 'SELECT id, name FROM student WHERE age = 30 AND name = John';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['id', 'name'],
        table: 'student',
        whereClauses: [{
            "field": "age",
            "operator": "=",
            "value": "30",
        }, {
            "field": "name",
            "operator": "=",
            "value": "John",
        }],
        joinCondition: null,
        joinTable: null,
        joinType: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse SQL Query with INNER JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id';
    const result = await parseSelectQuery(query);
    expect(result).toEqual({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [],
        joinTable: 'enrollment',
        joinType: "INNER",
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    })
});

test('Parse SQL Query with INNER JOIN and WHERE Clause', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE student.age > 20';
    const result = await parseSelectQuery(query);
    expect(result).toEqual({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [{ field: 'student.age', operator: '>', value: '20' }],
        joinTable: 'enrollment',
        joinType: "INNER",
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    })
});

test('Parse INNER JOIN clause', () => {
    const query = 'SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.ref_id';
    const result = parseJoinClause(query);
    expect(result).toEqual({
        joinType: 'INNER',
        joinTable: 'table2',
        joinCondition: { left: 'table1.id', right: 'table2.ref_id' }
    });
});

test('Parse LEFT JOIN clause', () => {
    const query = 'SELECT * FROM table1 LEFT JOIN table2 ON table1.id = table2.ref_id';
    const result = parseJoinClause(query);
    expect(result).toEqual({
        joinType: 'LEFT',
        joinTable: 'table2',
        joinCondition: { left: 'table1.id', right: 'table2.ref_id' }
    });
});

test('Parse RIGHT JOIN clause', () => {
    const query = 'SELECT * FROM table1 RIGHT JOIN table2 ON table1.id = table2.ref_id';
    const result = parseJoinClause(query);
    expect(result).toEqual({
        joinType: 'RIGHT',
        joinTable: 'table2',
        joinCondition: { left: 'table1.id', right: 'table2.ref_id' }
    });
});

test('Returns null for queries without JOIN', () => {
    const query = 'SELECT * FROM table1';
    const result = parseJoinClause(query);
    // console.log({ result });
    expect(result).toEqual(
        {
            joinType: null,
            joinTable: null,
            joinCondition: null
        }
    );
});

test('Parse LEFT Join Query Completely', () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id';
    const result = parseSelectQuery(query);
    expect(result).toEqual({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [],
        joinType: 'LEFT',
        joinTable: 'enrollment',
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    })
})

test('Parse RIGHT Join Query Completely', () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id';
    const result = parseSelectQuery(query);
    expect(result).toEqual({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [],
        joinType: 'RIGHT',
        joinTable: 'enrollment',
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    })
})

test('Parse SQL Query with LEFT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age > 22';
    const result = await parseSelectQuery(query);
    expect(result).toEqual({
        "fields": ["student.name", "enrollment.course"],
        "joinCondition": { "left": "student.id", "right": "enrollment.student_id" },
        "joinTable": "enrollment",
        "joinType": "LEFT",
        "table": "student",
        "whereClauses": [{ "field": "student.age", "operator": ">", "value": "22" }],
        "groupByFields": null,
        "hasAggregateWithoutGroupBy": false,
        "orderByFields": null,
        "limit": null,
        "isDistinct": false
    });
});

test('Parse SQL Query with LEFT JOIN with a WHERE clause filtering the join table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Physics'`;
    const result = await parseSelectQuery(query);
    expect(result).toEqual({
        "fields": ["student.name", "enrollment.course"],
        "joinCondition": { "left": "student.id", "right": "enrollment.student_id" },
        "joinTable": "enrollment",
        "joinType": "LEFT",
        "table": "student",
        "whereClauses": [{ "field": "enrollment.course", "operator": "=", "value": "'Physics'" }],
        "groupByFields": null,
        "hasAggregateWithoutGroupBy": false,
        "orderByFields": null,
        "limit": null,
        "isDistinct": false
    });
});

test('Parse SQL Query with RIGHT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age < 25';
    const result = await parseSelectQuery(query);
    expect(result).toEqual({
        "fields": ["student.name", "enrollment.course"],
        "joinCondition": { "left": "student.id", "right": "enrollment.student_id" },
        "joinTable": "enrollment",
        "joinType": "RIGHT",
        "table": "student",
        "whereClauses": [{ "field": "student.age", "operator": "<", "value": "25" }],
        "groupByFields": null,
        "hasAggregateWithoutGroupBy": false,
        "orderByFields": null,
        "limit": null,
        "isDistinct": false
    });
});

test('Parse SQL Query with RIGHT JOIN with a WHERE clause filtering the join table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Chemistry'`;
    const result = await parseSelectQuery(query);
    expect(result).toEqual({
        "fields": ["student.name", "enrollment.course"],
        "joinCondition": { "left": "student.id", "right": "enrollment.student_id" },
        "joinTable": "enrollment",
        "joinType": "RIGHT",
        "table": "student",
        "whereClauses": [{ "field": "enrollment.course", "operator": "=", "value": "'Chemistry'" }],
        "groupByFields": null,
        "hasAggregateWithoutGroupBy": false,
        "orderByFields": null,
        "limit": null,
        "isDistinct": false
    });
});

test('Parse COUNT Aggregate Query', () => {
    const query = 'SELECT COUNT(*) FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['COUNT(*)'],
        table: 'student',
        whereClauses: [],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse SUM Aggregate Query', () => {
    const query = 'SELECT SUM(age) FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['SUM(age)'],
        table: 'student',
        whereClauses: [],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse AVG Aggregate Query', () => {
    const query = 'SELECT AVG(age) FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['AVG(age)'],
        table: 'student',
        whereClauses: [],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse MIN Aggregate Query', () => {
    const query = 'SELECT MIN(age) FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['MIN(age)'],
        table: 'student',
        whereClauses: [],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse MAX Aggregate Query', () => {
    const query = 'SELECT MAX(age) FROM student';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['MAX(age)'],
        table: 'student',
        whereClauses: [],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse basic GROUP BY query', () => {
    const query = 'SELECT age, COUNT(*) FROM student GROUP BY age';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['age', 'COUNT(*)'],
        table: 'student',
        whereClauses: [],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        groupByFields: ['age'],
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse GROUP BY query with WHERE clause', () => {
    const query = 'SELECT age, COUNT(*) FROM student WHERE age > 22 GROUP BY age';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['age', 'COUNT(*)'],
        table: 'student',
        whereClauses: [{ field: 'age', operator: '>', value: '22' }],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        groupByFields: ['age'],
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse GROUP BY query with multiple fields', () => {
    const query = 'SELECT student_id, course, COUNT(*) FROM enrollment GROUP BY student_id, course';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['student_id', 'course', 'COUNT(*)'],
        table: 'enrollment',
        whereClauses: [],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        groupByFields: ['student_id', 'course'],
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse GROUP BY query with JOIN and WHERE clauses', () => {
    const query = 'SELECT student.name, COUNT(*) FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE enrollment.course = "Mathematics" GROUP BY student.name';
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['student.name', 'COUNT(*)'],
        table: 'student',
        whereClauses: [{ field: 'enrollment.course', operator: '=', value: '"Mathematics"' }],
        joinType: 'INNER',
        joinTable: 'enrollment',
        joinCondition: {
            left: 'student.id',
            right: 'enrollment.student_id'
        },
        groupByFields: ['student.name'],
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse SQL Query with LIKE Clause', () => {
    const query = "SELECT name FROM student WHERE name LIKE '%Jane%'";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['name'],
        table: 'student',
        whereClauses: [{ field: 'name', operator: 'LIKE', value: '%Jane%' }],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse SQL Query with LIKE Clause and Wildcards', () => {
    const query = "SELECT name FROM student WHERE name LIKE 'J%'";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['name'],
        table: 'student',
        whereClauses: [{ field: 'name', operator: 'LIKE', value: 'J%' }],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse SQL Query with Multiple LIKE Clauses', () => {
    const query = "SELECT name FROM student WHERE name LIKE 'J%' AND age LIKE '2%'";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['name'],
        table: 'student',
        whereClauses: [
            { field: 'name', operator: 'LIKE', value: 'J%' },
            { field: 'age', operator: 'LIKE', value: '2%' }
        ],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null,
        limit: null,
        isDistinct: false
    });
});

test('Parse SQL Query with LIKE and ORDER BY Clauses', () => {
    const query = "SELECT name FROM student WHERE name LIKE '%e%' ORDER BY age DESC";
    const parsed = parseSelectQuery(query);
    expect(parsed).toEqual({
        fields: ['name'],
        table: 'student',
        whereClauses: [{ field: 'name', operator: 'LIKE', value: '%e%' }],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: [{ fieldName: 'age', order: 'DESC' }],
        limit: null,
        isDistinct: false
    });
});