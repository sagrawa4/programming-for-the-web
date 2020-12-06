//-*- mode: rjsx-mode;

import React from 'react';
import ReactDom from 'react-dom';

/** Component which displays a single input widget having the following
 *  props:
 *
 *    `id`:     The id associated with the <input> element.
 *    `value`:  An initial value for the widget (defaults to '').
 *    `label`:  The label displayed for the widget.
 *    `update`: A handler called with the `value` of the <input>
 *              widget whenever it is blurred or its containing
 *              form submitted.
 */


export default class SingleInput extends React.Component {

  constructor(props) {
    super(props);
      //@TODO
      this.state = {
	  value: '' ||props.value,
	  error: ''
      }
  }

  //@TODO                                                                       

  render() {
      return(
	 // <form>
          <label htmlFor="ssName">Open Spreadsheet Name
          <input type="text" id={this.props.id} value={this.state.value} label={this.props.label} />
          <br />
	  </label>
         // <span className = "error">{this.state.error}
	 // </span>
	 // </label>
         // </form>
      );
  }

}

