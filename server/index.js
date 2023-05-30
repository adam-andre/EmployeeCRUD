// SETUP
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const port = process.env.PORT || 3000;

const app = express();
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'intweb',
    password: 'postgres',
    port: 5432
});

// CREATE ROUTES
app.post("/employee/new", (req, res) => {
    const {first_name, last_name, age, salary} = req.body;

    pool.query(`INSERT INTO employees (first_name, last_name, age, salary)
                VALUES ('${first_name}', '${last_name}', ${age}, ${salary})`,
        (error) => {
            if (error) {
                res.status(500).send("Error 409: Internal Server Error");
            }
            else {
                res.status(201).send("Success: Added employee");
            }
        });
});

// READ ROUTES
app.get("/employee/:id", (req, res) => {
    pool.query(`SELECT * FROM employees WHERE employee_id = ${req.params.id}`, (error, result) => {
        if (error) {
            res.status(500).send("Error 500: Internal Server Error");
        }
        else {
            res.json(result.rows);
        }
    });
});

app.get("/employee", (req, res) => {
    pool.query('SELECT * FROM employees', (error, result) => {
        if (error) {
            res.status(500).send("Error 500: Internal Server Error");
        }
        else {
            res.json(result.rows);
        }
    });
});

// UPDATE ROUTES
app.patch("/employee/:id", (req, res) => {
    let updateFields = Object.keys(req.body);
    let updateValues = Object.values(req.body);
    let updateFieldsString = "";

    updateFields.forEach((el, i) => {
        // append the SQL formatting to the string to add to the query
        updateFieldsString += `${el} = `;

        if (isNaN(Number(updateValues[i]))) {
            updateFieldsString += `'${updateValues[i]}'`;
        }
        else {
            updateFieldsString += updateValues[i];
        }


        // if we are not on the last element:
        if (i !== updateFields.length - 1) updateFieldsString += ",";
    });

    console.log(updateFieldsString);

    pool.query(`UPDATE employees SET ${updateFieldsString} WHERE employee_id = ${req.params.id}`, (error) => {
        if (error) {
            res.status(500).send("Error 500: Internal Server Error");
        }
        else {
            res.status(200).send("Success: Updated employee");
        }
    });
});

// DELETE ROUTES
app.delete("/employee/:id", (req, res) => {
    pool.query(`DELETE FROM employees WHERE employee_id = ${req.params.id}`, (error) => {
        if (error) {
            res.status(500).send("Error 500: Internal Server Error");
        }
        else {
            res.status(200).send("Success: Deleted employee");
        }
    });
});

// STAR ROUTE
app.get("*", (req, res) => {
    res.send("Route not recognized");
});

// LISTENER
app.listen(port, () => console.log(`Employee backend running on port ${port}`));