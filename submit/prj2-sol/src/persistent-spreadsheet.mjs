import AppError from './app-error.mjs';
import MemSpreadsheet from './mem-spreadsheet.mjs';

//use for development only
import { inspect } from 'util';

import mongo from 'mongodb';

//use in mongo.connect() to avoid warning
const MONGO_CONNECT_OPTIONS = { useUnifiedTopology: true };



/**
 * User errors must be reported by throwing a suitable
 * AppError object having a suitable message property
 * and code property set as follows:
 *
 *  `SYNTAX`: for a syntax error.
 *  `CIRCULAR_REF` for a circular reference.
 *  `DB`: database error.
 */



export default class PersistentSpreadsheet{

  //factory method
  static async make(dbUrl, spreadsheetName) {
  try 
    {

      //connect to mongo
      const client = await mongo.connect(dbUrl, MONGO_CONNECT_OPTIONS);

      //get database name
      const db = client.db();
      console.log(`db ${db.databaseName}`);

      //get the name of the collection
      const collect = db.collection(spreadsheetName);
      console.log(collect.collectionName);

      //instance for mem spreadsheet created
      const mem = new MemSpreadsheet();
 
      return new PersistentSpreadsheet(mem,collect, client);
    }
    
    catch (err) {
      const msg = `cannot connect to URL "${dbUrl}": ${err}`;
      throw new AppError('DB', msg);
    }

  }

  constructor(mem, mongoCollection,mongoClient) {
    //@TODO
    this.mem=mem;
    this.client=mongoClient;
    this.collect=mongoCollection;
  }

  /** Release all resources held by persistent spreadsheet.
   *  Specifically, close any database connections.
   */
  async close() {
  try {
	await this.client.close();
	}
  catch(err){
      throw new AppError('DB', err.toString());
      }
  }

  /** Set cell with id baseCellId to result of evaluating string
   *  formula.  Update all cells which are directly or indirectly
   *  dependent on the base cell.  Return an object mapping the id's
   *  of all dependent cells to their updated values.
   */
  async eval(baseCellId, formula) {
    const results = this.mem.eval(baseCellId, formula);
    console.log('results ' , results);
    try 
    {
      //updating the database
      console.log("inside try");
      await this.collect.insertOne({id: baseCellId, formula: formula, value: results});
      const updates = await this.collect.find({}).toArray();
      console.log("updates: ", updates);
      
    }
    catch (err) {
      //@TODO undo mem-spreadsheet operation
      const msg = `cannot update "${baseCellId}": ${err}`;
      throw new AppError('DB', msg);
    }
    return results;
  }

  /** return object containing formula and value for cell cellId 
   *  return { value: 0, formula: '' } for an empty cell.
   */
  async query(cellId) {
    //no db opertn.. we assume our in mem contain correct data..
    //dont read from db
    const updates = await this.collect.find({}).toArray();
    console.log("updates for query: ", updates);
    return this.mem.query(cellId);  
  }

  /** Clear contents of this spreadsheet */
  async clear() {
    this.mem.clear();
    try 
    {
      //@TODO
      await this.collect.deleteMany({});
      const updates = await this.collect.find({}).toArray();
      console.log("updates: ", updates); 

    }
    catch (err) {
      const msg = `cannot drop collection ${this.collect}: ${err}`;
      throw [ new AppError('DB', msg) ];
    }
    /* @TODO delegate to in-memory spreadsheet */
  }

  /** Delete all info for cellId from this spreadsheet. Return an
   *  object mapping the id's of all dependent cells to their updated
   *  values.  
   */
  async delete(cellId) {
    let updates;
    try {
      this.mem.delete(cellId); 
     updates= await this.collect.find({}).toArray();
      for(let i of updates)
      {
        console.log("i", i);
        if(i.id===cellId)
        {
          console.log("inside");
          updates = await this.collect.deleteOne({_id:i});
        }
      } 
    }
    catch (err) {
      //@TODO undo mem-spreadsheet operation
      const msg = `cannot delete "${cellId}": ${err}`;
      throw [ new AppError('DB', msg) ];
    }
    return updates;
  }
  
  /** copy formula from srcCellId to destCellId, adjusting any
   *  relative cell references suitably.  Return an object mapping the
   *  id's of all dependent cells to their updated values. Copying
   *  an empty cell is equivalent to deleting the destination cell.
   */
  async copy(destCellId, srcCellId) {
    const srcFormula = /* @TODO get formula by querying mem-spreadsheet */ '';
    if (!srcFormula) {
      return await this.delete(destCellId);
    }
    else {
      const results = /* @TODO delegate to in-memory spreadsheet */ {}; 
      try {
	//@TODO
      }
      catch (err) {
	//@TODO undo mem-spreadsheet operation
	const msg = `cannot update ${destCellId}: ${err}`;
	throw new AppError('DB', msg);
      }
      return results;
    }
    }
  

  /** Return dump of cell values as list of cellId and formula pairs.
   *  Do not include any cell's with empty formula.
   *
   *  Returned list must be sorted by cellId with primary order being
   *  topological (cell A < cell B when B depends on A) and secondary
   *  order being lexicographical (when cells have no dependency
   *  relation). 
   *
   *  Specifically, the cells must be dumped in a non-decreasing depth
   *  order:
   *     
   *    + The depth of a cell with no dependencies is 0.
   *
   *    + The depth of a cell C with direct prerequisite cells
   *      C1, ..., Cn is max(depth(C1), .... depth(Cn)) + 1.
   *
   *  Cells having the same depth must be sorted in lexicographic order
   *  by their IDs.
   *
   *  Note that empty cells must be ignored during the topological
   *  sort.
   */
  async dump() {
    return /* @TODO delegate to in-memory spreadsheet */ []; 
  }
}
const MONGO_URL = 'mongodb://localhost:27017';

//@TODO auxiliary functions
