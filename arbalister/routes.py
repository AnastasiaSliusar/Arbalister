import functools
import os
import pathlib

import datafusion as dtfn
import jupyter_server.base.handlers
import jupyter_server.serverapp
import pyarrow as pa
import tornado
from jupyter_server.utils import url_path_join

from . import arrow as abw


class IpcRouteHandler(jupyter_server.base.handlers.APIHandler):
    """An handler to get file in IPC."""

    @functools.cached_property
    def datafusion_config(self) -> dtfn.SessionConfig:
        """Return the datafusion config."""
        config = dtfn.SessionConfig()
        # String views do not get written properly to IPC
        config.set("datafusion.execution.parquet.schema_force_view_types", "false")
        return config

    def data_file(self, path: str) -> pathlib.Path:
        """Return the file that is requested by the URL path."""
        root_dir = pathlib.Path(os.path.expanduser(self.settings["server_root_dir"])).resolve()
        return root_dir / path

    @tornado.web.authenticated
    async def get(self, path: str) -> None:
        """HTTP GET return an IPC file."""
        file = self.data_file(path)

        self.set_header("Content-Type", "application/vnd.apache.arrow.stream")

        ctx = dtfn.SessionContext(self.datafusion_config)
        read_table = abw.get_table_reader(format=abw.FileFormat.from_filename(file))
        df = read_table(ctx, file)
        table: pa.Table = df.to_arrow_table()

        # TODO can we write directly to socket and send chunks
        sink = pa.BufferOutputStream()
        with pa.ipc.new_stream(sink, table.schema) as writer:
            writer.write_table(table)

        buf: pa.Buffer = sink.getvalue()
        self.write(buf.to_pybytes())  # FIXME to_pybytes copies memory

        await self.flush()


def setup_route_handlers(web_app: jupyter_server.serverapp.ServerWebApplication) -> None:
    """Jupyter server setup entry point."""
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    arrow_route_pattern = url_path_join(base_url, "arrow/stream/(.*)")
    handlers = [(arrow_route_pattern, IpcRouteHandler)]

    web_app.add_handlers(host_pattern, handlers)  # type: ignore[no-untyped-call]
