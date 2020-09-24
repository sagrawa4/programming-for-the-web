import parse from './expr-parser.mjs';
import AppError from './app-error.mjs';

import { cellRefToCellId } from './util.mjs';
import { indexToColSpec } from './util.mjs';
import LIMITS from './limits.mjs';

//use for development only
import { inspect } from 'util';

class CellInfo{

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
	 this.myMap.set(cell_id,new CellInfo(cell_id,0,0,0,0))
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
    console.log("type is", parseOutput.type);
    
    const val= auxEval(parseOutput);
    updates[baseCellId]=val;
   // console.log("my map", this.myMap.get(baseCellId));
    let existingCellInfo = this.myMap.get(baseCellId);
    existingCellInfo.value =val;
    console.log("my map", this.myMap.get(baseCellId));
    return updates;

   
   function auxEval(output)
   {
	console.log("output",output);
	if(output.type=== 'num')
	{
	  return output.value;
   	}

	/*if(output.type === 'ref')
        {
		console.log("ref",output.value)
	}*/	


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
