import parse from './expr-parser.mjs';
import AppError from './app-error.mjs';

import { cellRefToCellId } from './util.mjs';
import { indexToColSpec } from './util.mjs';
import LIMITS from './limits.mjs';

//use for development only
import { inspect } from 'util';

class CellInfo{

constructor(id,expr,value,dependents,ast){
this.id=id;
this.expr=expr;
this.value=0;
this.dependents=dependents;
this.ast=ast;
}
}

export default class Spreadsheet {

  //factory method
  static async make() { return new Spreadsheet(); }

  constructor() {    //@TODO
    for(let i=1;i<=LIMITS.MAX_N_ROWS;i++)
    {
    for(let j=0;j<LIMITS.MAX_N_COLS;j++)
    	{
	const result=indexToColSpec(j);//converting colmums to index
	let final= result + i;// concat the row& coulmn to develop a cell
	const cellInfo= new CellInfo(final,0,0,0,0);
   	//console.log(cellInfo.id,cellInfo.expr,cellInfo.value,cellInfo.dependents,cellInfo.ast);
	cellInfo.id=final;
	}
    }
  }

  /** Set cell with id baseCellId to result of evaluating formula
   *  specified by the string expr.  Update all cells which are
   *  directly or indirectly dependent on the base cell.  Return an
   *  object mapping the id's of all dependent cells to their updated
   *  values.  User errors must be reported by throwing a suitable
   *  AppError object having code property set to `SYNTAX` for a
   *  syntax error and `CIRCULAR_REF` for a circular reference
   *  and message property set to a suitable error message.
   */
  async eval(baseCellId, expr) {    const updates = {};
    CellInfo.id=baseCellId;
    CellInfo.expr=expr;
    const parseOutput= parse(CellInfo.expr,CellInfo.id);
    console.log(inspect(parseOutput,false,Infinity));//To print AST
    if(parseOutput.type==='num')
    {
	updates[CellInfo.id]=parseOutput.value;
	console.log(parseOutput.kids.value);
    }
    if(parseOutput.type==='app')
    {
	//parseOutput.kids.unit=parseOutput.value;
	console.log("kids", parseOutput.value.toString());
	//Math.eval(parseOutput.kids.value=parseOutput.value)
    }

    return updates;
  }
  //TODO add methods
}


//Map fn property of Ast type === 'app' to corresponding function.
const FNS = {
  '+': (a, b) => a + b,
  '-': (a, b=null) => b === null ? -a : a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  min: (...args) => Math.min(...args),
  max: (...args) => Math.max(...args),
}


//@TODO add other classes, functions, constants etc as needed
