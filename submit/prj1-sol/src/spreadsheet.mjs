import parse from './expr-parser.mjs';
import AppError from './app-error.mjs';

import { cellRefToCellId } from './util.mjs';
import { indexToColSpec } from './util.mjs';
import { indexToRowSpec } from './util.mjs';
import { rowSpecToIndex } from './util.mjs';
import LIMITS from './limits.mjs';

//use for development only
import { inspect } from 'util';

class CellInfo
{
      constructor(id,expr,value,dependents,ast,column,row)
      {
	this.id=id;
   	this.expr=expr;
   	this.value=0;
   	this.dependents=dependents;
   	this.ast=ast;
	this.column=column;
	this.row=row;
      }
}

export default class Spreadsheet
{

  //factory method
  static async make() { return new Spreadsheet(); }

  
  constructor()
  {
    this.myMap = new Map();
    for(let i=0;i<LIMITS.MAX_N_ROWS;i++)
    {
	for(let j=0;j<LIMITS.MAX_N_COLS;j++)
    	{
	 const result=indexToColSpec(j);//converting colmums to index
	 let cell_id = result +indexToRowSpec(i); 
	 //console.log("cell_id",cell_id);
	 this.myMap.set(cell_id,new CellInfo(cell_id,' ',0,0,0,indexToColSpec(j),
	 indexToRowSpec(i)))
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


 /*  async auxEvaltest(output)
   {
        console.log("output",output);
        if(output.type=== 'num')
        {
          return output.value;
        }

        else if(output.type=== 'ref')
        {
                console.log("map",this.myMap);
                console.log("inside ref",output);
                console.log("refCol",indexToColSpec(output.value.col.index));
                console.log("refRow",(output.value.row.index));
                let refCol = indexToColSpec(output.value.col.index);
                let refRelativeRow =parseInt(output.value.row.index);
                console.log("refRelativeRow ",refRelativeRow );
                console.log("baseCellId",baseCellId);
                let baseRow= parseInt(this.myMap.get(baseCellId).row);
                //console.log("spreadsheet",spreadmap.get(baseCellId).row);
                console.log("baseRow",baseRow);
                let absRow = baseRow + refRelativeRow;
                console.log("absRow",absRow);
                let cellRef = refCol + absRow;
                let refvalue= spreadmap.get(cellRef).value;
                console.log("refvalue",refvalue);
                //console.log("returning",cellRefToCellId(cellRef));
                return refvalue;
       }

        else if(output.type=== 'app')
        {
           console.log("output.kids for app",output.kids);
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
}*/
  async eval(baseCellId, expr)
  {
    const updates = {};
    const parseOutput= parse(expr,baseCellId);

    console.log("*****************TO PRINT AST**************************");
    console.log(inspect(parseOutput,false,Infinity));//To print AST
   
    let val= auxEval(parseOutput,this.myMap);

   // updates[baseCellId]=val;
    console.log("base",baseCellId);
    console.log("this.myMap.get(baseCellId)",this.myMap.get(baseCellId));
    let presentCellInfo = this.myMap.get(baseCellId);
   // console.log("presentCellInfo",presentCellInfo);
   // console.log("Conversion",toString(baseCellId));
    /*if(typeof(val) === 'string')
    {
    
     console.log("equal",this.myMap.get(val));
    // console.log("value is",this.myMap.get(val).value);
    // presentCellInfo.value=this.myMap.get(val).value;
     console.log("presentCellInfo.value",presentCellInfo.value);
     //updates[baseCellId]=presentCellInfo.value;
    }*/
    	presentCellInfo.value =val;
    	console.log("presentCellInfo.value",presentCellInfo.value);//22
	updates[baseCellId]=val;
    

    //console.log("my map", this.myMap.get(baseCellId));
    return updates;

   
   function auxEval(output,spreadmap)
   {
	console.log("output",output);
	if(output.type=== 'num')
	{
	  return output.value;
   	}

	else if(output.type=== 'ref')
     	{
		console.log("spread",spreadmap);
		console.log("inside ref",output);
     	        console.log("refCol",indexToColSpec(output.value.col.index));
                console.log("refRow",(output.value.row.index));
                let refCol = indexToColSpec(output.value.col.index);
                let refRelativeRow =parseInt(output.value.row.index);
		console.log("refRelativeRow ",refRelativeRow );
		console.log("baseCellId",baseCellId);
		let baseRow= parseInt(spreadmap.get(baseCellId).row);
		console.log("spreadsheet",spreadmap.get(baseCellId).row);
		console.log("baseRow",baseRow);
		let absRow = baseRow + refRelativeRow;
		console.log("absRow",absRow);
		let cellRef = refCol + absRow;
		let refvalue= spreadmap.get(cellRef).value;
		console.log("refvalue",refvalue);
		//console.log("returning",cellRefToCellId(cellRef));
                return refvalue;
       }
       
	else if(output.type=== 'app')
	{
	   console.log("output.kids for app",output.kids);
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
