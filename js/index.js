"use strict";

(function() {
  const TABLE_ROW_LENGTH = 100;
  const TABLE_COLUMN_LENGTH = 100;

  const data = {};

  function storeValue(col, row, value) {
    data[col + "_" + row] = value;
  }

  function retrieveValue(col, row) {
    const value = data[col + "_" + row];

    //Need to evvaluate the value here incase it is build up from other cells.
    return value === undefined ? "" : evaluateExpression(value);
  }

  function retrieveValueByCellName(cellName) {
    var colName = cellName.match(/[A-Z]+/)[0];

    var col = getColumnNumber(colName);

    var row = cellName.match(/\d+/)[0];

    return retrieveValue(col, row);
  }

  function evaluateExpression(exp) {
    if (exp[0] !== "=") {
      return exp;
    }

    exp = exp.substring(1, exp.length);

    exp = exp.replace(/[A-Z]+\d+/g, retrieveValueByCellName);

    return new Function("return " + exp)();
  }

  const tableBody = document.getElementById("tableBody");

  document.getElementById("refreshBtn").addEventListener("click", e => {
    tableBody.innerHTML = "";
    refreshTable();
  });

  function drawTable() {
    //Table headings
    for (let i = 1; i <= TABLE_COLUMN_LENGTH; i++) {
      const cell = tableHeaderRow.insertCell(i);
      cell.innerHTML = numberToLetters(i);
    }
    //Table body
    refreshTable();
  }

  function cellUpdated(cell) {
    const value = cell.innerHTML;

    const col = cell.getAttribute("data-column");
    const row = cell.parentElement.getAttribute("data-row");
    storeValue(col, row, value);
    cell.innerHTML = evaluateExpression(value);
  }

  function refreshTable() {
    const tableHeaderRow = document.getElementById("tableHeaderRow");

    for (let i = 1; i <= TABLE_ROW_LENGTH; i++) {
      const row = tableBody.insertRow(i - 1);
      row.setAttribute("data-row", i);

      for (let j = 0; j <= TABLE_COLUMN_LENGTH; j++) {
        const cell = row.insertCell(j);

        //First cell in a row. Readonly displaying the row number.
        if (j === 0) {
          cell.innerHTML = i;
        } else {
          cell.innerHTML = evaluateExpression(retrieveValue(j, i));
          cell.setAttribute("data-column", j);
          //All other row editable
          cell.setAttribute("contenteditable", "true");
          //Might need to fix this for efficiency
          cell.addEventListener("blur", e => {
            cellUpdated(e.target);
          });
        }
      }
    }
  }

  function getColumnNumber(str) {
    //After reverse each item in array will have an index representing its value
    const arr = str.split("").reverse();

    const A_CharCode = "A".charCodeAt();
    const Z_CharCode = "Z".charCodeAt();
    const range = Z_CharCode - (A_CharCode - 1);

    return arr
      .map((x, i) => {
        return (x.charCodeAt() - (A_CharCode - 1)) * Math.pow(range, i);
      })
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      });
  }

  function numberToLetters(nNum) {
    var result;
    if (nNum <= 26) {
      result = letter(nNum);
    } else {
      var modulo = nNum % 26;
      var quotient = Math.floor(nNum / 26);
      if (modulo === 0) {
        result = letter(quotient - 1) + letter(26);
      } else {
        result = letter(quotient) + letter(modulo);
      }
    }

    return result;
  }

  function letter(nNum) {
    var a = "A".charCodeAt(0);
    return String.fromCharCode(a + nNum - 1);
  }

  drawTable();
})();
