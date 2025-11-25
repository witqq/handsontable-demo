import React, { useRef, useState, useEffect, useCallback } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';

const data = [
  ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'],
  ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'],
  ['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'],
  ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'],
  ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'],
  ['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'],
];

const COL_COUNT = 8;
const ROW_COUNT = 6;
const DEFAULT_WIDTH = 50;

function App() {
  const hotRef = useRef(null);
  const [hiddenCols, setHiddenCols] = useState([]);
  const [hiddenRows, setHiddenRows] = useState([]);
  const hiddenColsRef = useRef(hiddenCols);
  const hiddenRowsRef = useRef(hiddenRows);

  // Синхронизируем ref с state для использования в callbacks
  useEffect(() => {
    hiddenColsRef.current = hiddenCols;
    hiddenRowsRef.current = hiddenRows;
  }, [hiddenCols, hiddenRows]);

  // Вычисляем какие колонки имеют скрытых соседей
  const getIndicators = useCallback(() => {
    const left = new Set();
    const right = new Set();

    hiddenCols.forEach(hiddenIdx => {
      // Следующая видимая колонка справа
      for (let i = hiddenIdx + 1; i < COL_COUNT; i++) {
        if (!hiddenCols.includes(i)) {
          left.add(i);
          break;
        }
      }
      // Предыдущая видимая колонка слева
      for (let i = hiddenIdx - 1; i >= 0; i--) {
        if (!hiddenCols.includes(i)) {
          right.add(i);
          break;
        }
      }
    });

    return { left, right };
  }, [hiddenCols]);

  const indicators = getIndicators();

  // Генерируем ширины колонок
  const colWidths = Array.from({ length: COL_COUNT }, (_, idx) =>
    hiddenCols.includes(idx) ? 0.1 : DEFAULT_WIDTH
  );

  // Хук для кастомизации заголовков колонок
  const afterGetColHeader = useCallback((col, TH) => {
    // Убираем старые индикаторы
    TH.style.position = 'relative';
    const oldLeft = TH.querySelector('.indicator-left');
    const oldRight = TH.querySelector('.indicator-right');
    if (oldLeft) oldLeft.remove();
    if (oldRight) oldRight.remove();

    // Добавляем индикатор слева (есть скрытая колонка слева)
    if (indicators.left.has(col)) {
      const span = document.createElement('span');
      span.className = 'indicator-left';
      span.textContent = '◀';
      span.style.cssText = 'position:absolute;left:2px;top:50%;transform:translateY(-50%);font-size:9px;color:#1890ff;cursor:pointer;';
      span.title = 'Есть скрытые колонки слева';
      TH.appendChild(span);
    }

    // Добавляем индикатор справа (есть скрытая колонка справа)
    if (indicators.right.has(col)) {
      const span = document.createElement('span');
      span.className = 'indicator-right';
      span.textContent = '▶';
      span.style.cssText = 'position:absolute;right:2px;top:50%;transform:translateY(-50%);font-size:9px;color:#1890ff;cursor:pointer;';
      span.title = 'Есть скрытые колонки справа';
      TH.appendChild(span);
    }
  }, [indicators]);

  // Хук для кастомизации заголовков строк
  const afterGetRowHeader = useCallback((row, TH) => {
    TH.style.position = 'relative';
    const oldTop = TH.querySelector('.indicator-top');
    const oldBottom = TH.querySelector('.indicator-bottom');
    if (oldTop) oldTop.remove();
    if (oldBottom) oldBottom.remove();

    // Проверяем скрытые строки сверху
    let hasHiddenAbove = false;
    for (let i = row - 1; i >= 0; i--) {
      if (hiddenRows.includes(i)) {
        hasHiddenAbove = true;
        break;
      }
      if (!hiddenRows.includes(i)) break;
    }

    // Проверяем скрытые строки снизу
    let hasHiddenBelow = false;
    for (let i = row + 1; i < ROW_COUNT; i++) {
      if (hiddenRows.includes(i)) {
        hasHiddenBelow = true;
        break;
      }
      if (!hiddenRows.includes(i)) break;
    }

    if (hasHiddenAbove) {
      const span = document.createElement('span');
      span.className = 'indicator-top';
      span.textContent = '▲';
      span.style.cssText = 'position:absolute;top:1px;left:50%;transform:translateX(-50%);font-size:7px;color:#1890ff;';
      TH.appendChild(span);
    }

    if (hasHiddenBelow) {
      const span = document.createElement('span');
      span.className = 'indicator-bottom';
      span.textContent = '▼';
      span.style.cssText = 'position:absolute;bottom:1px;left:50%;transform:translateX(-50%);font-size:7px;color:#1890ff;';
      TH.appendChild(span);
    }
  }, [hiddenRows]);

  // Перерендер при изменении скрытых
  useEffect(() => {
    if (hotRef.current?.hotInstance) {
      hotRef.current.hotInstance.render();
    }
  }, [hiddenCols, hiddenRows]);

  // Функции для контекстного меню
  const getHiddenColsInSelection = (selection) => {
    if (!selection || !selection.length) return [];
    const startCol = Math.min(selection[0].start.col, selection[0].end.col);
    const endCol = Math.max(selection[0].start.col, selection[0].end.col);
    return hiddenColsRef.current.filter(c => c >= startCol && c <= endCol);
  };

  const getHiddenRowsInSelection = (selection) => {
    if (!selection || !selection.length) return [];
    const startRow = Math.min(selection[0].start.row, selection[0].end.row);
    const endRow = Math.max(selection[0].start.row, selection[0].end.row);
    return hiddenRowsRef.current.filter(r => r >= startRow && r <= endRow);
  };

  // Контекстное меню
  const contextMenuConfig = {
    items: {
      'hide_cols': {
        name: 'Скрыть колонку(и)',
        callback: function(key, selection) {
          const startCol = Math.min(selection[0].start.col, selection[0].end.col);
          const endCol = Math.max(selection[0].start.col, selection[0].end.col);
          const newHidden = [...hiddenColsRef.current];
          for (let c = startCol; c <= endCol; c++) {
            if (!newHidden.includes(c)) newHidden.push(c);
          }
          setHiddenCols(newHidden);
        }
      },
      'hide_rows': {
        name: 'Скрыть строку(и)',
        callback: function(key, selection) {
          const startRow = Math.min(selection[0].start.row, selection[0].end.row);
          const endRow = Math.max(selection[0].start.row, selection[0].end.row);
          const newHidden = [...hiddenRowsRef.current];
          for (let r = startRow; r <= endRow; r++) {
            if (!newHidden.includes(r)) newHidden.push(r);
          }
          setHiddenRows(newHidden);
        }
      },
      'sep1': '---------',
      'show_cols_in_range': {
        name: function() {
          const hot = hotRef.current?.hotInstance;
          if (!hot) return 'Показать колонки в диапазоне';
          const sel = hot.getSelected();
          if (!sel) return 'Показать колонки в диапазоне';
          const mapped = [{ start: { col: sel[0][1], row: sel[0][0] }, end: { col: sel[0][3], row: sel[0][2] } }];
          const count = getHiddenColsInSelection(mapped).length;
          return count > 0 ? `Показать колонки (${count})` : 'Показать колонки в диапазоне';
        },
        disabled: function() {
          const hot = hotRef.current?.hotInstance;
          if (!hot) return true;
          const sel = hot.getSelected();
          if (!sel) return true;
          const mapped = [{ start: { col: sel[0][1], row: sel[0][0] }, end: { col: sel[0][3], row: sel[0][2] } }];
          return getHiddenColsInSelection(mapped).length === 0;
        },
        callback: function(key, selection) {
          const toShow = getHiddenColsInSelection(selection);
          setHiddenCols(hiddenColsRef.current.filter(c => !toShow.includes(c)));
        }
      },
      'show_rows_in_range': {
        name: function() {
          const hot = hotRef.current?.hotInstance;
          if (!hot) return 'Показать строки в диапазоне';
          const sel = hot.getSelected();
          if (!sel) return 'Показать строки в диапазоне';
          const mapped = [{ start: { col: sel[0][1], row: sel[0][0] }, end: { col: sel[0][3], row: sel[0][2] } }];
          const count = getHiddenRowsInSelection(mapped).length;
          return count > 0 ? `Показать строки (${count})` : 'Показать строки в диапазоне';
        },
        disabled: function() {
          const hot = hotRef.current?.hotInstance;
          if (!hot) return true;
          const sel = hot.getSelected();
          if (!sel) return true;
          const mapped = [{ start: { col: sel[0][1], row: sel[0][0] }, end: { col: sel[0][3], row: sel[0][2] } }];
          return getHiddenRowsInSelection(mapped).length === 0;
        },
        callback: function(key, selection) {
          const toShow = getHiddenRowsInSelection(selection);
          setHiddenRows(hiddenRowsRef.current.filter(r => !toShow.includes(r)));
        }
      },
      'sep2': '---------',
      'show_all_cols': {
        name: 'Показать все колонки',
        disabled: () => hiddenColsRef.current.length === 0,
        callback: () => setHiddenCols([])
      },
      'show_all_rows': {
        name: 'Показать все строки',
        disabled: () => hiddenRowsRef.current.length === 0,
        callback: () => setHiddenRows([])
      }
    }
  };

  // Высоты строк
  const rowHeights = Array.from({ length: ROW_COUNT }, (_, idx) =>
    hiddenRows.includes(idx) ? 0.1 : 23
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>Handsontable 6.2.4 - Скрытие колонок и строк</h2>

      <div style={{ marginBottom: 10, fontSize: 13, color: '#666' }}>
        Скрытые колонки: {hiddenCols.length > 0 ? hiddenCols.sort((a,b)=>a-b).map(c => String.fromCharCode(65 + c)).join(', ') : '—'}
        {' | '}
        Скрытые строки: {hiddenRows.length > 0 ? hiddenRows.sort((a,b)=>a-b).map(r => r + 1).join(', ') : '—'}
      </div>

      <HotTable
        ref={hotRef}
        data={data}
        colHeaders={true}
        rowHeaders={true}
        width="500"
        height="220"
        colWidths={colWidths}
        rowHeights={rowHeights}
        afterGetColHeader={afterGetColHeader}
        afterGetRowHeader={afterGetRowHeader}
        contextMenu={contextMenuConfig}
      />

      <p style={{ marginTop: 12, color: '#888', fontSize: 12 }}>
        ПКМ для скрытия/показа. Индикаторы ◀▶▲▼ показывают скрытые элементы рядом.
      </p>
    </div>
  );
}

export default App;
