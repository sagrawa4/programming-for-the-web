# i544

Submitted By :    Shruti Agrawal

# Instructions to Run :
Typing npm ci within directory followed by npm start will start a web server listening on an available port (usually 8080). Accessing that server using a browser should display a single page spreadsheet web application which uses the web services

# Aims
The aims of this project are as follows:
* To implement a Single Page App.
* Exposure to react.js framework.

# Requirements
It should provide an input widget to allow the user to provide the name of a spreadsheet to be opened. This widget should only allow spreadsheet names which contain alphanumeric, underscore, hyphen or space characters. If an invalid name is provided, then it should display a suitable error message.

If a valid spreadsheet name is provided, then the contents of that spreadsheet from the project 3 web services should be displayed. This display should have two main areas:

A data input area.

The current spreadsheet data displayed as a table. The table should be for a fixed-size 10x10 spreadsheet with row headers 1 
…
 10 and column headers A 
…
 J. The name of the spreadsheet should be displayed in the topmost leftmost cell.

The data cells should display the value of the data in that cell. Mousing over a cell should show a pop-up containing the formula for that cell.

Focusing a cell (either by mouse or keyboard tabs) should provide visual feedback as to which cell is currently focused. The cell-id and formula for the focused cell should be displayed in the data input area. Manually focusing the data input area and updating it with a new formula should result in that formula being entered into that spreadsheet cell. The spreadsheet display should immediately reflect all cascaded updates.

When the right mouse context-menu button is clicked on a spreadsheet data cell, a context menu with the following selections should be displayed:

Copy: Selecting this menu item should have the effect of copying the formula of the targeted cell. The appearance of the targeted cell should change to indicate that it is the source of the current copy.

Delete: Selecting this menu item should delete the data in the targeted cell.

Paste: Selecting this menu item should paste the the previously copied formula into the targeted cell. All relative references in the copied formula should be translated as per the targeted cell. If such a translation is not possible, then a suitable error message should be displayed below the spreadsheet display.

The Copy and Delete options should be inactive if the targeted cell does not have any data to copy or delete. The Paste option should be inactive if there is no current formula to be pasted.

When the right mouse context-menu button is clicked over the spreadsheet name located in the topmost leftmost cell, a context menu containing a single Clear option should be displayed. Selecting this option should clear the entire spreadsheet.
