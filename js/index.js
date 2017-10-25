"use strict";

(function() {
  const TABLE_ROW_LENGTH = 100;
  const TABLE_COLUMN_LENGTH = 100;
  let cellJustBlurred = null;

  const data = {
    storeValue: (cellName, value) => {
      //TODO: sanitize value
      data[cellName] = data[cellName] || {};
      data[cellName].value = value;
    },
    getValue: cellName => {
      const cell = data[cellName];

      if (cell === undefined) {
        return "";
      }

      return cell.value === undefined ? "" : cell.value;
    },
    getFormatting: cellName => {
      const cell = data[cellName];

      if (cell === undefined) {
        return "";
      }

      return cell.formatting === undefined ? "" : cell.formatting;
    },
    dependentCells: cellName => {
      const dependents = [];

      for (let property in data) {
        const isCellData = /[A-Z]+\d+/g.test(property);

        if (isCellData) {
          const isDependent = data[property].value.indexOf(cellName) > -1;

          if (isDependent) {
            dependents.push(property);
          }
        }
      }
      return dependents;
    },
    toggleCellBold: cellName => {
      const cell = data[cellName];

      if (cell === undefined) {
        return;
      }

      if (cell.formatting === undefined) {
        cell.formatting = [];
      }

      var index = cell.formatting.indexOf("bold");

      if (index > -1) {
        cell.formatting.splice(index, 1);
      } else {
        cell.formatting.push("bold");
      }
    }
  };

  document.getElementById("refreshBtn").addEventListener("click", e => {
    tableBody.innerHTML = "";
    refreshTable();
  });

  document.getElementById("boldBtn").addEventListener("click", e => {
    if (cellJustBlurred === null) {
      return;
    }

    const col = cellLocation.getColumn(cellJustBlurred);
    const row = cellLocation.getRow(cellJustBlurred);

    const cell = getCell(col, row)[0];

    cell.style.fontWeight = cell.style.fontWeight === "" ? "bold" : "";
    data.toggleCellBold(col + row);
  });

  function setCellJustBlurred(element) {
    if (element === null || element === undefined) {
      cellJustBlurred = null;
    }

    var col = element.getAttribute("data-column");
    var row = element.getAttribute("data-row");

    if (col === null || row === null) {
      cellJustBlurred = null;
    } else {
      cellJustBlurred = col + row;
    }
  }

  function getValueByCellName(cellName) {
    return evaluateExpression(data.getValue(cellName));
  }

  //TODO: Make it work for decimals
  function evaluateExpression(exp) {
    if (exp[0] !== "=") {
      return exp;
    }

    exp = exp.substring(1, exp.length);

    if (/^SUM/.test(exp)) {
      exp = expandSUM(exp);
    }

    exp = exp.replace(/[A-Z]+\d+/g, getValueByCellName);

    return new Function("return " + exp)();
  }

  function expandSUM(exp) {
    const range = exp.match(/[A-Z]+\d+/g);

    const start = range[0];
    const end = range[1];
    const startCol = cellLocation.getColumn(start);
    let startRow = cellLocation.getRow(start);
    const endCol = cellLocation.getColumn(end);
    let endRow = cellLocation.getRow(end);

    if (startCol !== endCol) {
      return "";
    }

    if (startRow > endRow) {
      const temp = startRow;
      startRow = endRow;
      endRow = temp;
    }

    let expanded = startCol + startRow;

    startRow++;

    while (startRow <= endRow) {
      expanded += "+" + startCol + startRow;

      startRow++;
    }

    return expanded;
  }

  const tableBody = document.getElementById("tableBody");

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
    const row = cell.getAttribute("data-row");

    const cellName = col + row;

    data.storeValue(cellName, value);
    cell.innerHTML = evaluateExpression(value);

    const dependentCells = data.dependentCells(cellName);

    dependentCells.forEach(cellName => {
      refreshCell(cellName);
    });
  }

  function refreshCell(cellName) {
    const value = getValueByCellName(cellName);

    const col = cellLocation.getColumn(cellName);
    const row = cellLocation.getRow(cellName);

    const cell = getCell(col, row);

    cell[0].innerText = value;
  }

  function getCell(col, row) {
    return document.querySelectorAll(
      '[data-column="' + col + '"][data-row="' + row + '"]'
    );
  }

  function refreshTable() {
    const tableHeaderRow = document.getElementById("tableHeaderRow");

    for (let i = 1; i <= TABLE_ROW_LENGTH; i++) {
      const row = tableBody.insertRow(i - 1);

      for (let j = 0; j <= TABLE_COLUMN_LENGTH; j++) {
        const cell = row.insertCell(j);

        //First cell in a row. Readonly displaying the row number.
        if (j === 0) {
          cell.innerHTML = i;
        } else {
          const col = cellLocation.columnHeaderFromPosition(Number(j));
          const cellName = col + i;
          cell.innerHTML = evaluateExpression(data.getValue(cellName));
          cell.setAttribute("data-column", col);
          cell.setAttribute("data-row", i);
          cell.setAttribute("contenteditable", "true");
          cell.addEventListener("blur", e => {
            let element = e.target;
            cellUpdated(element);
            setCellJustBlurred(element);
          });
        }
      }
    }
  }

  const cellLocation = {
    A_CharCode: "A".charCodeAt(),
    Z_CharCode: "Z".charCodeAt(),

    columnHeaderFromPosition: function(nNum) {
      let result;
      const range = this.Z_CharCode - this.A_CharCode + 1;

      if (nNum <= range) {
        result = this.letter(nNum);
      } else {
        const modulo = nNum % range;
        const quotient = Math.floor(nNum / range);
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
    },

    getColumn: cellName => {
      return cellName.match(/[A-Z]/)[0];
    },
    getRow: cellName => {
      return cellName.match(/\d+/)[0];
    }
  };

  drawTable();
})();
