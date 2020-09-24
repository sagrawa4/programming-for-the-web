import parse from './expr-parser.mjs';
import AppError from './app-error.mjs';

import { cellRefToCellId } from './util.mjs';
import { indexToColSpec } from './util.mjs';
import { indexToRowSpec } from './util.mjs';
import LIMITS from './limits.mjs';

//use for development only
import { inspect } from 'util';

class CellInfo
{
      constructor(id,expr,value,dependents,ast)
      {
	this.id=id;
   	this.expr=expr;
   	this.value=0;
   	this.dependents=dependents;
   	this.ast=ast;
      }
}

export default class Spreadsheet
{

  //factory method
  static async make() { return new Spreadsheet(); }

  
  constructor()
  {
  this.myMap = new Map();
    for(let i=1;i<=LIMITS.MAX_N_ROWS;i++)
    {
	for(let j=0;j<LIMITS.MAX_N_COLS;j++)
    	{
	 const result=indexToColSpec(j);//converting colmums to index
	 let cell_id = result +i; 
	 //console.log("cell_id",cell_id);
	 this.myMap.set(cell_id,new CellInfo(cell_id,' ',0,0,0))
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
  async eval(baseCellId, expr)
  {
    const updates = {};
    const parseOutput= parse(expr,baseCellId);

    console.log("*****************TO PRINT AST**************************");
    console.log(inspect(parseOutput,false,Infinity));//To print AST

   
    let val= auxEval(parseOutput);
    console.log("type",typeof(val));  
    updates[baseCellId]=val;

    let presentCellInfo = this.myMap.get(baseCellId);
    
    if(typeof(val) === 'string')
    {
     console.log("equal",this.myMap.get(val));
     console.log("value is",this.myMap.get(val).value);
     presentCellInfo.value=this.myMap.get(val).value;
     console.log("presentCellInfo.value",presentCellInfo.value);
     updates[baseCellId]=presentCellInfo.value;
    }
    else
    {
	presentCellInfo.value =val;
    	console.log("presentCellInfo.value",presentCellInfo.value);//22
	updates[baseCellId]=val;
    }

    console.log("my map", this.myMap.get(baseCellId));
    return updates;

   
   function auxEval(output)
   {
	console.log("output",output);
	if(output.type=== 'num')
	{
	  return output.value;
   	}

	if(output.type=== 'app')
	{
	   console.log("output.kids",output.kids);
	    let kidsList = [];
	    for(let i=0;i<output.kids.length;i++)
	    {
		kidsList.push(auxEval(output.kids[i]));
	    }
	
	    switch(output.fn)
            {
                case '+':

                var result= FNS['+'](...kidsList);
                break;

                case '-':

                result= FNS['-'](...kidsList);
                break;

                case '*':
                result= FNS['*'](...kidsList);
                break;

		case '/':
                result= FNS['/'](...kidsList);
                break;
           }
	    
	 return result;   
       }

       if(output.type=== 'ref')
       {
		console.log("refCol",indexToColSpec(output.value.col.index));
		console.log("refRow",indexToRowSpec(output.value.row.index));
		let refCol = indexToColSpec(output.value.col.index);
		let refRow = indexToRowSpec(output.value.row.index);
		let cellRef = refCol + refRow;
		console.log("returning",cellRefToCellId(cellRef));
		return cellRef;
       }
   }
  
}

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
