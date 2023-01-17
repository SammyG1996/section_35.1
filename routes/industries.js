const express = require('express');
const slugify = require("slugify");

const ExpressError = require("../expressError");
const db = require("../db");
const router = new express.Router();

// This will get the CODE and INDUSTRY from the industries table
router.get('/', async (req, res, next) => {
  try{
    const results = await db.query('SELECT code, industry FROM industries')
    return res.json({'industries': results.rows});
  }
  catch (err) {
    next(err)
  }
})



/* 

This will add an industry 

Here is an example of the JSON this POST route expects to receive: 

{
	"industry" : "Food Industry"
}

*/
router.post('/', async (req, res, next) => {
  try {
    
    let {industry} = req.body; /* extracts name and desc from the body */
    let code = slugify(industry, {lower: true}); /* converts a string to a valid URL (a slug) */

    /* This will construct the SQL query and makes sure to use sanatization to avoid SQL injection */
    const result = await db.query(
          `INSERT INTO industries (code, industry) 
           VALUES ($1, $2) 
           RETURNING code, industry`,
        [code, industry]);

    return res.status(201).json({"industry": result.rows[0]}); /* returns the created object */
  }

  catch (err) {
    return next(err);
  }
})




module.exports = router;