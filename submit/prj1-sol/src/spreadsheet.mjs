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

export default class Spreadsheet
{

  //factory method
  static async make() { return new Spreadsheet(); }

  constructor()
  {    //@TODO
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
  async eval(baseCellId, expr)
  {

    const updates = {};
    CellInfo.id=baseCellId;
    CellInfo.expr=expr;
    const parseOutput= parse(CellInfo.expr,CellInfo.id);

    console.log("*****************TO PRINT AST**************************");
    console.log(inspect(parseOutput,false,Infinity));//To print AST
    console.log("type is", parseOutput.type);
    
    const val= auxEval(parseOutput);
    
    updates[CellInfo.id]=val;
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
		//console.log("output",output);
		console.log("output.kids",output.kids);
		//console.log("output.kids[0].value",output.kids[0].value);
	    //const kidsList=evalKids(output.kids);
            //console.log("list", kidsList);

	    let kidsList = [];
	    for(let i=0;i<output.kids.length;i++)
	    {
		kidsList.push(auxEval(output.kids[i]));
	    }
	  
	    switch(output.fn)
            {
                case '+':

                var result= FNS['+'](...kidsList);
                //updates[CellInfo.id]=Sum;
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
	    
	   
	   /*function evalKids(output)
	   {
		//console.log("output length",output.length);
		let i=0; let j = output.length;
		let kidsList = [];
		//console.log("type of input value",typeof output.kids.value);
                while(j!== 0 && typeof output[i].value!== 'undefined')
                {

                        //console.log("length :" , output.kids.length);
                        console.log("kid ",i, " value:" , output[i].value);
                        kidsList.push(output[i].value);
			auxEval(output[i]);
                        i++;
                        j--;
                        
                }
		console.log("type", typeof output.kids[i].value);
		if(typeof input[i].value === 'undefined')
		{
		console.log("output.kids[i].kids",output.kids[i].kids);
		
			evalKids(output.kids[i].kids);
		}
		console.log("kidsList",kidsList);
		return kidsList;
	    }*/

	   
	 return result;   
       }


   }
  //TODO add methods
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
