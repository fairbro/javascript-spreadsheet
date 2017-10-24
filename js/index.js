"use strict";

const data = {};

(function() {
  const TABLE_ROW_LENGTH = 100;
  const TABLE_COLUMN_LENGTH = 100;

  function storeValue(col, row, value) {
    data[col + "_" + row] = value;
  }

  function retrieveValue(col, row) {
    const value = data[col + "_" + row];

    return value === undefined ? "" : value;
  }

  function evaluateExpression(exp) {
    if (exp[0] !== "=") {
      return exp;
    }

    exp = exp.substring(1, exp.length);

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

    refreshTable();
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
            const inputCell = e.target;
            const value = inputCell.innerHTML;

            const col = inputCell.getAttribute("data-column");
            const row = inputCell.parentElement.getAttribute("data-row");
            storeValue(col, row, value);
            cell.innerHTML = evaluateExpression(value);
          });
        }
      }
    }
  }

  function getColumnNumber(str) {
    var arr = str.split("").reverse();
    //Fix 26 and 64
    return arr
      .map((x, i) => {
        return (x.charCodeAt() - 64) * Math.pow(26, i);
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
