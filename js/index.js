"use strict";

(function() {
  const TABLE_ROW_LENGTH = 100;
  const TABLE_COLUMN_LENGTH = 100;

  const data = {
    storeValue: (cellName, value) => {
      //TODO: sanitize value
      data[cellName] = value;
    },
    getValue: cellName => {
      const value = data[cellName];

      return value === undefined ? "" : value;
    },
    dependentCells: cellName => {
      let dependents = [];

      for (let property in data) {
        let isCellData = /[A-Z]+\d+/g.test(property);

        if (isCellData) {
          let isDependent = data[property].indexOf(cellName) > -1;

          if (isDependent) {
            dependents.push(property);
          }
        }
      }
      return dependents;
    }
  };

  function getValueByCellName(cellName) {
    return evaluateExpression(data.getValue(cellName));
  }

  //TODO: Make it work for decimals
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
    //TODO: refactor to avoid duplication
    let cellName = cellLocation.columnHeaderFromPosition(Number(col)) + row;

    data.storeValue(cellName, value);
    cell.innerHTML = evaluateExpression(value);

    let dependentCells = data.dependentCells(cellName);

    dependentCells.forEach(cellName => {
      refreshCell(cellName);
    });
  }

  function refreshCell(cellName) {
    let value = getValueByCellName(cellName);

    var colHeader = cellName.match(/[A-Z]/)[0];
    var col = cellLocation.columnPositionFromHeader(colHeader);
    var row = cellName.match(/\d+/)[0];

    var cell = document.querySelectorAll(
      '[data-column="' + col + '"][data-row="' + row + '"]'
    );
    cell[0].innerText = value;
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
          let cellName = cellLocation.columnHeaderFromPosition(Number(j)) + i;
          cell.innerHTML = evaluateExpression(data.getValue(cellName));
          cell.setAttribute("data-column", j);
          cell.setAttribute("data-row", i);
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
