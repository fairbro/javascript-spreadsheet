"use strict";

(function() {
  const TABLE_ROW_LENGTH = 100;
  const TABLE_COLUMN_LENGTH = 100;

  const data = {
    storeValue: (col, row, value, dependentCells) => {
      data[col + "_" + row] = {
        value: value,
        dependentCells: dependentCells
      };
    },
    getValue: (col, row) => {
      const cellData = data[col + "_" + row];

      return cellData === undefined ? "" : cellData.value;
    },
    getDependentCells: (col, row) => {
      const cellData = data[col + "_" + row];

      return cellData === undefined ? "" : cellData.dependentCells;
    }
  };

  function getValueByCellName(cellName) {
    var colName = cellName.match(/[A-Z]+/)[0];

    var col = cellLocation.columnPositionFromHeader(colName);

    var row = cellName.match(/\d+/)[0];

    return evaluateExpression(data.getValue(col, row));
  }

  function evaluateExpression(exp) {
    if (exp[0] !== "=") {
      return exp;
    }

    exp = exp.substring(1, exp.length);

    exp = exp.replace(/[A-Z]+\d+/g, getValueByCellName);

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
      cell.innerHTML = cellLocation.columnHeaderFromPosition(i);
    }
    //Table body
    refreshTable();
  }

  function cellUpdated(cell) {
    const value = cell.innerHTML;

    const col = cell.getAttribute("data-column");
    const row = cell.parentElement.getAttribute("data-row");
    var dependentCells = value.match(/[A-Z]+\d+/g);
    data.storeValue(col, row, value, dependentCells);
    cell.innerHTML = evaluateExpression(value);
    // var dependentCells = data.getDependentCells(col, row);
    // refreshCells(dependentCells);
  }

  // function refreshCells(arr) {
  //   arr.forEach(function(element) {
  //     var cell = document
  //       .querySelectorAll('[data-row="' + arr.row + '"]')
  //       .querySelectorAll('[data-column="' + arr.col + '"]');
  //     cell.innerHTML = evaluateExpression(data.getValue(arr.col, arr.col));
  //   });
  // }

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
          cell.innerHTML = evaluateExpression(data.getValue(j, i));
          cell.setAttribute("data-column", j);
          cell.setAttribute("contenteditable", "true");
          cell.addEventListener("blur", e => {
            cellUpdated(e.target);
          });
        }
      }
    }
  }

  var cellLocation = {
    A_CharCode: "A".charCodeAt(),
    Z_CharCode: "Z".charCodeAt(),

    columnPositionFromHeader: function(str) {
      //After reverse each item in array will have an index representing its value
      const arr = str.split("").reverse();

      var range = this.Z_CharCode - this.A_CharCode + 1;

      return arr
        .map((x, i) => {
          return (x.charCodeAt() - (this.A_CharCode - 1)) * Math.pow(range, i);
        })
        .reduce((accumulator, currentValue) => {
          return accumulator + currentValue;
        });
    },

    columnHeaderFromPosition: function(nNum) {
      var result;
      var range = this.Z_CharCode - this.A_CharCode + 1;

      if (nNum <= range) {
        result = this.letter(nNum);
      } else {
        var modulo = nNum % range;
        var quotient = Math.floor(nNum / range);
        if (modulo === 0) {
          result = this.letter(quotient - 1) + this.letter(range);
        } else {
          result = this.letter(quotient) + this.letter(modulo);
        }
      }

      return result;
    },

    letter: function(nNum) {
      return String.fromCharCode(this.A_CharCode + nNum - 1);
    }
  };

  drawTable();
})();
