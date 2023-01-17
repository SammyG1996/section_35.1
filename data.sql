\c biztime

DROP TABLE IF EXISTS companies_industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
  code text PRIMARY KEY,
  industry text NOT NULL UNIQUE
);

-- This is the many to many table relationship
CREATE TABLE companies_industries (
  comp_code TEXT REFERENCES companies ON DELETE CASCADE,
  indus_code TEXT REFERENCES industries ON DELETE CASCADE
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries
  VALUES ('computer', 'Computer Makers'),
         ('phone', 'Phone Makers'),
         ('tech', 'Technology Sector');

  INSERT INTO companies_industries
    VALUES('apple', 'tech'),
          ('apple', 'phone'), 
          ('apple', 'computer'), 
          ('ibm', 'tech'), 
          ('ibm', 'computer');

-- This is a MANY to MANY query 

-- SELECT i.industry 
-- FROM companies c
-- JOIN companies_industries ci
-- ON c.code = ci.comp_code
-- JOIN industries i 
-- ON ci.indus_code = i.code
-- WHERE c.code = 'apple'; 

-- This last part above is where I can then input a sanitized user input to get the specific tags