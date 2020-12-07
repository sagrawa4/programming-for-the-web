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
      };
      this.handleChange = this.handleChange.bind(this);
      this.onBlur = this.onBlur.bind(this);
     
  }

    //@TODO
    handleChange(event){
	this.setState({value:event.target.value});
    }

    onBlur(event){
	alert('A spreadsheet is submitted:' + this.state.value);
	try{
	    this.props.update(this.state.value);
	    event.preventDefault();
	}
	catch(err) {
	    const msg = (err.message) ? err.message : 'webservice error';
	    this.setState({error: [msg]});
	}
    }
    

  render() {
      return(
	  <form onblur={this.onBlur} onSubmit={this.onBlur}>
          <label htmlFor="ssName">Open Spreadsheet Name
            <input type="text" id={this.props.id} value={this.state.value} label={this.props.label} onChange={this.handleChange} />
          <br />
	  <span className={this.state.error}></span>
	  </label>
         </form>
      );
  }

}

