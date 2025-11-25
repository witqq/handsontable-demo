import React, { useRef, useState, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';

const data = [
  ['2019', 10, 11, 12, 13, 14],
  ['2020', 20, 11, 14, 13, 15],
  ['2021', 30, 15, 12, 13, 16],
  ['2022', 40, 20, 18, 17, 18],
];

const columnNames = ['Год', 'Tesla', 'Volvo', 'Toyota', 'Ford', 'BMW'];
const DEFAULT_WIDTH = 80;

// CSS для индикаторов скрытых колонок (только в заголовках)
const hiddenIndicatorStyles = `
  th.hidden-indicator-left {
    position: relative;
  }
  th.hidden-indicator-left::before {
    content: '◀';
    position: absolute;
    left: 2px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 8px;
    color: #1890ff;
  }
  th.hidden-indicator-right {
    position: relative;
  }
  th.hidden-indicator-right::after {
    content: '▶';
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 8px;
    color: #1890ff;
  }
`;

function App() {
  const hotRef = useRef(null);
  const [hiddenCols, setHiddenCols] = useState([]);

  // Добавляем стили при монтировании
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = hiddenIndicatorStyles;
    document.head.appendChild(styleEl);
    return () => styleEl.remove();
  }, []);

  // Функция для обновления индикаторов
  const updateIndicators = () => {
    if (!hotRef.current?.hotInstance) return;
    const hot = hotRef.current.hotInstance;
    const table = hot.rootElement;

    // Очищаем старые классы (ищем во всех контейнерах handsontable)
    document.querySelectorAll('.hidden-indicator-left, .hidden-indicator-right').forEach(cell => {
      cell.classList.remove('hidden-indicator-left', 'hidden-indicator-right');
    });

    // Определяем какие колонки имеют скрытых соседей
    const colsWithHiddenLeft = new Set();
    const colsWithHiddenRight = new Set();

    hiddenCols.forEach(hiddenIdx => {
      // Следующая видимая колонка справа получает индикатор слева
      for (let i = hiddenIdx + 1; i < columnNames.length; i++) {
        if (!hiddenCols.includes(i)) {
          colsWithHiddenLeft.add(i);
          break;
        }
      }
      // Предыдущая видимая колонка слева получает индикатор справа
      for (let i = hiddenIdx - 1; i >= 0; i--) {
        if (!hiddenCols.includes(i)) {
          colsWithHiddenRight.add(i);
          break;
        }
      }
    });

    // Применяем классы к заголовкам колонок
    // Handsontable создает несколько таблиц, ищем в clone_top (фиксированный заголовок)
    const cloneTop = table.querySelector('.ht_clone_top');
    const headerContainer = cloneTop || table;
    const headers = headerContainer.querySelectorAll('thead th');

    console.log('Headers found:', headers.length, 'Hidden left:', [...colsWithHiddenLeft], 'Hidden right:', [...colsWithHiddenRight]);

    headers.forEach((th, idx) => {
      // idx 0 это угловая ячейка (rowHeader), колонки начинаются с 1
      const colIdx = idx - 1;
      if (colIdx >= 0) {
        if (colsWithHiddenLeft.has(colIdx)) {
          th.classList.add('hidden-indicator-left');
          console.log('Added left indicator to col', colIdx);
        }
        if (colsWithHiddenRight.has(colIdx)) {
          th.classList.add('hidden-indicator-right');
          console.log('Added right indicator to col', colIdx);
        }
      }
    });
  };

  // Обновляем индикаторы после изменения скрытых колонок
  useEffect(() => {
    setTimeout(updateIndicators, 100);
  }, [hiddenCols]);

  const toggleColumn = (colIndex) => {
    if (hiddenCols.includes(colIndex)) {
      setHiddenCols(hiddenCols.filter(c => c !== colIndex));
    } else {
      setHiddenCols([...hiddenCols, colIndex]);
    }
  };

  // Генерируем ширины колонок: 0.1 для скрытых, DEFAULT_WIDTH для остальных
  const colWidths = columnNames.map((_, idx) =>
    hiddenCols.includes(idx) ? 0.1 : DEFAULT_WIDTH
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>Handsontable 6.2.4 - Скрытие колонок (workaround)</h2>

      <div style={{ marginBottom: 15 }}>
        <strong>Переключить колонки:</strong>{' '}
        {columnNames.map((name, idx) => (
          <button
            key={idx}
            onClick={() => toggleColumn(idx)}
            style={{
              margin: '0 5px',
              padding: '5px 10px',
              backgroundColor: hiddenCols.includes(idx) ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {name} {hiddenCols.includes(idx) ? '(скрыта)' : ''}
          </button>
        ))}
      </div>

      <HotTable
        ref={hotRef}
        data={data}
        colHeaders={true}
        rowHeaders={true}
        width="600"
        height="250"
        colWidths={colWidths}
        manualColumnResize={true}
        contextMenu={{
          items: {
            'row_above': { name: 'Вставить строку выше' },
            'row_below': { name: 'Вставить строку ниже' },
            'separator1': '---------',
            'remove_row': { name: 'Удалить строку' },
            'separator2': '---------',
            'hide_column': {
              name: 'Скрыть колонку',
              callback: function(key, selection) {
                const col = selection[0].start.col;
                toggleColumn(col);
              }
            },
            'show_all_columns': {
              name: 'Показать все колонки',
              callback: function() {
                setHiddenCols([]);
              }
            }
          }
        }}
      />

      <p style={{ marginTop: 15, color: '#666' }}>
        Примечание: HiddenColumns плагин был только в handsontable-pro.<br/>
        Это workaround через colWidths = 0.1px
      </p>
    </div>
  );
}

export default App;
