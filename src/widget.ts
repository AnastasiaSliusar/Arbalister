import { DataGrid } from "@lumino/datagrid";
import { Panel } from "@lumino/widgets";
import type * as DataGridModule from "@lumino/datagrid";

import { ArrowModel } from "./model";

export class ArrowGridViewer extends Panel {
  constructor() {
    super();
    this.addClass("arrow-viewer");

    this._grid = new DataGrid({
      defaultSizes: {
        rowHeight: 24,
        columnWidth: 144,
        rowHeaderWidth: 64,
        columnHeaderHeight: 36,
      },
    });
    this._grid.addClass("arrow-grid-viewer");
    this.addWidget(this._grid);
    this.updateGrid();
  }

  async updateGrid() {
    this._grid.dataModel = await ArrowModel.fetch("data/gen/test.parquet");
  }

  private _grid: DataGridModule.DataGrid;
}
