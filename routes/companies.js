const express = require('express');
const slugify = require("slugify");

// const items = require()
const ExpressError = require("../expressError");
const db = require("../db");
const router = new express.Router();

/* All the following code is for the companies route */


// This will get the CODE and NAME from the companies table
router.get('/', async (req, res, next) => {
  try{
    const results = await db.query('SELECT code, name FROM companies')
    return res.json({'companies': results.rows});
  }
  catch (err) {
    next(err)
  }
})

/* This will get all the info for a specific company */
router.get('/:code', async (req, res, next) => {
  const {code} = req.params; /* This will get the company code */
  try{
    const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
    const industries =  await db.query(`SELECT i.industry 
    FROM companies c
    JOIN companies_industries ci
    ON c.code = ci.comp_code
    JOIN industries i 
    ON ci.indus_code = i.code
    WHERE c.code = $1;`, [code]);

    if(results.rows.length === 0) {
      throw new ExpressError('not found', 404);
    } else {
      return res.json({'company': results.rows, 'industries' : industries.rows.map( (item) => item.industry)})
    }
  }
  catch (err) {
    next(err);
  }
})

/* This is the companies post route and will add a company */
router.post('/', async (req, res, next) => {
  try {
    
    let {name, description} = req.body; /* extracts name and desc from the body */
    let code = slugify(name, {lower: true}); /* converts a string to a valid URL (a slug) */

    /* This will construct the SQL query and makes sure to use sanatization to avoid SQL injection */
    const result = await db.query(
          `INSERT INTO companies (code, name, description) 
           VALUES ($1, $2, $3) 
           RETURNING code, name, description`,
        [code, name, description]);

    return res.status(201).json({"company": result.rows[0]}); /* returns the created object */
  }

  catch (err) {
    return next(err);
  }
})

/* This is the companies put route */
router.put("/:code", async function (req, res, next) {
  try {
    let {name, description} = req.body; /* This extracts the name and desc from the body */
    let code = req.params.code; /* This will retrieve the code from the query params */

    /* This will formulate the update SQL query and implement sanatization to prevent SQL injection */
    const result = await db.query(
          `UPDATE companies
           SET name=$1, description=$2
           WHERE code = $3
           RETURNING code, name, description`,
        [name, description, code]);

    /* If there are no rows returned from the query that means the company doesnt exist and the approprate error will be thrown */
    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    } 
    /* If the company does exist then the new updated company will be returned */
    else {
      return res.json({"company": result.rows[0]});
    }
  }

  catch (err) {
    return next(err);
  }

});


/* This is the companies delete route */
router.delete("/:code", async function (req, res, next) {
  try {
    let code = req.params.code; /* This will get the code from the query params */

    /* This will formulate a delete SQL query to remove the company and it implements sanatization to avoid SQL injection */
    const result = await db.query(
          `DELETE FROM companies
           WHERE code=$1
           RETURNING code`,
        [code]);

    /* If there are no rows returned from the query that means the company doesnt exist and the approprate error will be thrown */
    if (result.rows.length == 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    } 
    /* If the company does exist then the new updated company will be returned */
    else {
      return res.json({"status": "deleted"});
    }
  }

  catch (err) {
    return next(err);
  }
});











module.exports = router;