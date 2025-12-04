import { ILayoutRestorer } from "@jupyterlab/application";
import { WidgetTracker } from "@jupyterlab/apputils";
import { ITranslator } from "@jupyterlab/translation";
import type { JupyterFrontEnd, JupyterFrontEndPlugin } from "@jupyterlab/application";
import type { IDocumentWidget } from "@jupyterlab/docregistry";

import { ArrowGridViewerFactory } from "./widget";
import type { ArrowGridViewer } from "./widget";

const arrowGrid: JupyterFrontEndPlugin<void> = {
  activate: activateArrowGrid,
  id: "@jupyterdiana/arrowgridviewer-extension:arrowgrid",
  description: "Adds viewer for file that can be read into Arrow format.",
  requires: [ITranslator],
  optional: [ILayoutRestorer],
  autoStart: true,
};

function activateArrowGrid(
  app: JupyterFrontEnd,
  translator: ITranslator,
  restorer: ILayoutRestorer | null,
): void {
  const factory_arrow = "ArrowTable";

  app.docRegistry.addFileType({
    name: "parquet",
    displayName: "Parquet",
    mimeTypes: ["application/vnd.apache.parquet"],
    extensions: [".parquet"],
    contentType: "file",
    fileFormat: "base64",
  });

  const trans = translator.load("jupyterlab");

  const factory = new ArrowGridViewerFactory({
    name: factory_arrow,
    label: trans.__("Arrow Dataframe Viewer"),
    fileTypes: ["parquet", "csv"],
    defaultFor: ["parquet"],
    readOnly: true,
    translator,
  });
  const tracker = new WidgetTracker<IDocumentWidget<ArrowGridViewer>>({
    namespace: "arrowviewer",
  });

  if (restorer) {
    void restorer.restore(tracker, {
      command: "docmanager:open",
      args: (widget) => ({ path: widget.context.path, factory: factory_arrow }),
      name: (widget) => widget.context.path,
    });
  }

  app.docRegistry.addWidgetFactory(factory);
  const ft = app.docRegistry.getFileType("parquet");

  factory.widgetCreated.connect(async (_sender, widget) => {
    // Track the widget.
    void tracker.add(widget);
    // Notify the widget tracker if restore data needs to update.
    widget.context.pathChanged.connect(() => {
      void tracker.save(widget);
    });

    if (ft) {
      widget.title.icon = ft.icon!;
      widget.title.iconClass = ft.iconClass!;
      widget.title.iconLabel = ft.iconLabel!;
    }

    await widget.content.ready;
  });
}

export default arrowGrid;
