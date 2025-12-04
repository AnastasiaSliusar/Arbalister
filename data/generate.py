import argparse
import pathlib

import faker
import pyarrow as pa

import jupyterdiana.arrow as ja


def generate_table(num_rows: int) -> pa.Table:
    """Generate a table with fake data."""
    gen = faker.Faker()
    data = {
        "name": [gen.name() for _ in range(num_rows)],
        "address": [gen.address().replace("\n", ", ") for _ in range(num_rows)],
        "age": [gen.random_number(digits=2) for _ in range(num_rows)],
        "id": [gen.uuid4() for _ in range(num_rows)],
    }
    return pa.table(data)


def configure_command_single(cmd: argparse.ArgumentParser) -> argparse.ArgumentParser:
    """Configure single subcommand CLI options."""
    cmd.add_argument("--output-file", "-o", type=pathlib.Path, required=True, help="Output file path")
    cmd.add_argument(
        "--output-type",
        "-t",
        choices=[t.name.lower() for t in ja.FileFormat],
        default=None,
        help="Output file type",
    )
    cmd.add_argument("--num-rows", type=int, default=1000, help="Number of rows to generate")
    return cmd


def configure_command_batch(cmd: argparse.ArgumentParser) -> argparse.ArgumentParser:
    """Configure batch subcommand CLI options."""
    cmd.add_argument(
        "--output-file", "-o", type=pathlib.Path, action="append", help="Output file path", default=[]
    )
    cmd.add_argument("--num-rows", type=int, default=1000, help="Number of rows to generate")
    return cmd


def configure_argparse() -> argparse.ArgumentParser:
    """Configure CLI options."""
    parser = argparse.ArgumentParser(description="Generate a table and write to file.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    cmd_one = subparsers.add_parser("single", help="Generate a single table and write to file.")
    configure_command_single(cmd_one)

    cmd_batch = subparsers.add_parser("batch", help="Generate a multiple tables with the same data.")
    configure_command_batch(cmd_batch)

    return parser


def save_table(table: pa.Table, path: pathlib.Path, file_type: ja.FileFormat) -> None:
    """Save a table to file with the given file type."""
    path.parent.mkdir(exist_ok=True, parents=True)
    write_table = ja.get_table_writer(file_type)
    write_table(table, str(path))


def main() -> None:
    """Generate data file."""
    parser = configure_argparse()
    args = parser.parse_args()

    table = generate_table(args.num_rows)

    match args.command:
        case "single":
            ft = next((t for t in ja.FileFormat if t.name.lower() == args.output_type), None)
            if ft is None:
                ft = ja.FileFormat.from_filename(args.output_file)
            save_table(table, args.output_file, ft)
        case "batch":
            for p in args.output_file:
                ft = ja.FileFormat.from_filename(p)
                save_table(table, p, ft)


if __name__ == "__main__":
    main()
