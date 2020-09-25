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


  async eval(baseCellId, expr)
  {
    const updates = {};
    const parseOutput= parse(expr,baseCellId);

   // console.log("*****************TO PRINT AST**************************");
   // console.log(inspect(parseOutput,false,Infinity));//To print AST
   
	let val= auxEval(parseOutput,this.myMap);
    	let presentCellInfo = this.myMap.get(baseCellId);
    	presentCellInfo.value =val;
	updates[baseCellId]=val;
    
	return updates;

   
   function auxEval(output,spreadmap)
   {
	if(output.type=== 'num')
	{
	  return output.value;
   	}

	else if(output.type=== 'ref')
     	{
                let refCol = indexToColSpec(output.value.col.index);
                let refRelativeRow =parseInt(output.value.row.index);
		let baseRow= parseInt(spreadmap.get(baseCellId).row);
		let absRow = baseRow + refRelativeRow;
		let cellRef = refCol + absRow;
		let refvalue= spreadmap.get(cellRef).value;
                return refvalue;
       }
       
	else if(output.type=== 'app')
	{
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
