import assert from 'assert';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';

import {AppError} from 'cs544-ss';

/** Storage web service for spreadsheets.  Will report DB errors but
 *  will not make any attempt to report spreadsheet errors like bad
 *  formula syntax or circular references (it is assumed that a higher
 *  layer takes care of checking for this and the inputs to this
 *  service have already been validated).
 */

//some common HTTP status codes; not all codes may be necessary
const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

export default function serve(port, ssStore) {
  const app = express();
  app.locals.port = port;
  app.locals.ssStore = ssStore;
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}

const CORS_OPTIONS = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: 'Location',
};

const BASE = 'api';
const STORE = 'store';


function setupRoutes(app) {
  app.use(cors(CORS_OPTIONS));  //needed for future projects
  app.use(bodyParser.json());  //use json bodyparser
  app.get(`/${BASE}/${STORE}/:id`, doGet(app)); //retrieve data from spreadsheet
  app.delete(`/${BASE}/${STORE}/:id`, doClear(app)); //clear the content of spreadsheet
  app.patch(`/${BASE}/${STORE}/:id`, doUpdate(app)); //updates the collection with the data in the request body
  app.put(`/${BASE}/${STORE}/:id`, doReplace(app)); //replaces the collection with the data in the request body


  app.patch(`/${BASE}/${STORE}/:id/:cell`, doUpdateCell(app)); //updates the formula for the cell specified by CELL_ID in the spreadsheet 
  app.delete(`/${BASE}/${STORE}/:id/:cell`, doDeleteCell(app)); //delete the cell specified by CELL_ID in the spreadsheet
  app.put(`/${BASE}/${STORE}/:id/:cell`, doReplaceCell(app)); //replaces the formula for the cell specified by CELL_ID in the spreadsheet
  
  app.use(do404(app));
  app.use(doErrors(app));
  //@TODO add routes to handlers
}

/****************************** Handlers *******************************/

//return all the data for the spreadsheet
function doGet(app) {
  return (async function(req, res) {
    try {
      const id = req.params.id;
      const results = await app.locals.ssStore.readFormulas(id);
	res.json(results);
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

//clear out all the data for the spreadsheet
function doClear(app) {
  return (async function(req, res) {
    try {
      const id = req.params.id;
      const results = await app.locals.ssStore.clear(id);
       res.status(NO_CONTENT).json(results);
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

//update the data for the spreadsheet 
function doUpdate(app){
  return (async function(req,res){
    try {
    	console.log("req.body" , req.body);
        for (const [cellId, formula] of req.body)
	{
          await app.locals.ssStore.updateCell(req.params.id,cellId, formula)
	}

        res.status(NO_CONTENT).json()
    }
     catch (err){
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  })
}

//update the formula for the cell specified by CELL_ID in the spreadsheet
function doUpdateCell(app){
  return (async function(req,res){
  try {
      console.log("req.params.id" , req.params.id);
      console.log(" req.params.cell" , req.params.cell);
      console.log("req.body.formula" , req.body.formula);
      if(req.body.formula !== undefined)
      {
	await app.locals.ssStore.updateCell(req.params.id, req.params.cell, req.body.formula);
       	console.log("out");
	res.status(NO_CONTENT).json()
	console.log("end");
      }
      else
      {
	throw 'Formula undefined';
      }
  }
  catch (err)
  {
	    const result =
	    {
		status: BAD_REQUEST,
            	error: { code: "BAD_REQUEST", message : "request body must be a { formula } object" },
   	    }
   res.status(BAD_REQUEST).json(result);
  }
})
}

//delete the cell specified by CELL_ID in the spreadsheet 
function doDeleteCell(app) {
  return (async function (req, res) {
    try {
      await app.locals.ssStore.delete(req.params.id,req.params.cell)
      //res.json({});
      res.status(NO_CONTENT).json();
    }
    catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}
//replace all the data for the spreadsheet named SS_NAME with the data in the request body
function doReplace(app) {
  return (async function(req, res) {
    try {
     await app.locals.ssStore.clear(req.params.id);
      console.log("print",req.body);
      for (const [cellId, formula] of req.body)
        {
          await app.locals.ssStore.updateCell(req.params.id,cellId, formula)
        }
	res.status(CREATED).json()
    }
    catch(err) {
      const result = {
            status: BAD_REQUEST,
            error: { code: "BAD_REQUEST", message : "request body must be a list of cellId, formula pairs" },
      };
      res.status(BAD_REQUEST).json(result);
    }
  });
}

//replace the formula for the cell specified by CELL_ID in the spreadsheet
function doReplaceCell(app) {
  return (async function(req, res) {
    try {
      await app.locals.ssStore.updateCell(req.params.id,req.params.cell, req.body.formula);
      res.status(CREATED).json()
    }
    catch(err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  });
}
/** Default handler for when there is no route for a particular method
 *  and path.
 */
function do404(app) {
  return async function(req, res) {
    const message = `${req.method} not supported for ${req.originalUrl}`;
    const result = {
      status: NOT_FOUND,
      error: { code: 'NOT_FOUND', message, },
    };
    res.status(404).
	json(result);
  };
}


/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    const result = {
      status: SERVER_ERROR,
      error: { code: 'SERVER_ERROR', message: err.message },
    };
    res.status(SERVER_ERROR).json(result);
    console.error(err);
  };
}


/*************************** Mapping Errors ****************************/

const ERROR_MAP = {
}

/** Map domain/internal errors into suitable HTTP errors.  Return'd
 *  object will have a "status" property corresponding to HTTP status
 *  code and an error property containing an object with with code and
 *  message properties.
 */
function mapError(err) {
  const isDomainError = (err instanceof AppError);
  const status =
    isDomainError ? (ERROR_MAP[err.code] || BAD_REQUEST) : SERVER_ERROR;
  const error = 
	isDomainError
	? { code: err.code, message: err.message } 
        : { code: 'SERVER_ERROR', message: err.toString() };
  if (!isDomainError) console.error(err);
  return { status, error };
} 

/****************************** Utilities ******************************/



/** Return original URL for req */
function requestUrl(req) {
  const port = req.app.locals.port;
  return `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
}
