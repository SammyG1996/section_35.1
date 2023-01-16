const express = require('express');

const ExpressError = require("../expressError");
const db = require("../db");
const router = new express.Router();

/* This is the get route for the invoices route to get the list of invoices*/
 router.get("/", async function (req, res, next) {
  try {
    /* This will formulate and send the SQL query */
    const result = await db.query(
          `SELECT id, comp_code
           FROM invoices 
           ORDER BY id`
    );

    /* a response will be send with the return data */
    return res.json({"invoices": result.rows});
  }

  catch (err) {
    return next(err);
  }
});


/* This is the get route for the invoices route to get info on a specific invoice */
router.get("/:id", async function (req, res, next) {
  try {
    /* this will extract the id from the query params  */
    let id = req.params.id;

    /* this will then formulate the query */
    const result = await db.query(
          `SELECT i.id, 
                  i.comp_code, 
                  i.amt, 
                  i.paid, 
                  i.add_date, 
                  i.paid_date, 
                  c.name, 
                  c.description 
           FROM invoices AS i
             INNER JOIN companies AS c ON (i.comp_code = c.code)  
           WHERE id = $1`,
        [id]);

    /* If the row length is 0 then invoice doesnt exists and appropriate error will send  */
    if (result.rows.length === 0) {
      throw new ExpressError(`No such invoice: ${id}`,404);
    }

    /* if no error is thrown then the following code will run and construct the return object to send back to the user*/
    const data = result.rows[0];
    const invoice = {
      id: data.id,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
    };

    return res.json({"invoice": invoice}); /* This will then send the return object */
  }

  catch (err) {
    return next(err);
  }
});


/* This is the post route to adds a new invoice */
router.post("/", async function (req, res, next) {
  try {
    let {comp_code, amt} = req.body; /* This will extract the code to create the new invoice and the amount to insert */

    /*  This will then formulate the SQL query to create the invoice using sanatization to avoid SQL injection */
    const result = await db.query(
          `INSERT INTO invoices (comp_code, amt) 
           VALUES ($1, $2) 
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [comp_code, amt]);

    return res.json({"invoice": result.rows[0]}); /* This will return the created obj */
  }

  catch (err) {
    return next(err);
  }
});


/* 

This put route will update an invoice  

it expects the following type of JSON: 
{
	"amt" : "25.00", 
	"paid" : "false"
}

*/
router.put("/:id", async function (req, res, next) {
  try {
    let {amt, paid} = req.body; /* this will retrive the amount owed and amount paid from the request.body */
    let id = req.params.id; /* This will retrive the invoice id from the query params */
    let paidDate = null; /* this will at first be set to null and will be updated later if full amount has been paid */

    /* This will create the query to retrive the invioce using sanatization to prevent SQL injection */
    const currResult = await db.query(
          `SELECT paid
           FROM invoices
           WHERE id = $1`,
        [id]);

    /* If the rows.length === 0 then that means that no such invoice exists and the approprate error will be sent */
    if (currResult.rows.length === 0) {
      throw new ExpressError(`No such invoice: ${id}`, 404);
    }

    /* The below code will then update the paid date */
    const currPaidDate = currResult.rows[0].paid_date;

    if (!currPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null
    } else {
      paidDate = currPaidDate;
    }

    const result = await db.query(
          `UPDATE invoices
           SET amt=$1, paid=$2, paid_date=$3
           WHERE id=$4
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [amt, paid, paidDate, id]);

    return res.json({"invoice": result.rows[0]});
  }

  catch (err) {
    return next(err);
  }

});



/* This is the delete route */
router.delete("/:id", async function (req, res, next) {
  try {
    let id = req.params.id; /* This will extract the ID from the query params  */

    /* This will construct the delete SQL query using sanatization */
    const result = await db.query(
          `DELETE FROM invoices
           WHERE id = $1
           RETURNING id`,
        [id]);

    /* If results.rows.length === 0 that means no such invoice exits and error will send */
    if (result.rows.length === 0) {
      throw new ExpressError(`No such invoice: ${id}`, 404);
    }

    return res.json({"status": "deleted"}); /* If it does exist it will be deleted and respose will be sent */
  }

  catch (err) {
    return next(err);
  }
});



module.exports = router;