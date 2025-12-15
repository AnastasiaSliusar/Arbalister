import { LabIcon } from "@jupyterlab/ui-components";

import arrowIPCSvg from "../style/icons/arrow.svg";
import arrowIPCDarkSvg from "../style/icons/arrow_dark.svg";
import avroSvg from "../style/icons/avro.svg";
import orcLightSvg from "../style/icons/orc.svg";
import orcDarkSvg from "../style/icons/orc_light.svg";
import parquetSvgLight from "../style/icons/parquet_dark.svg";
import parquetSvgDark from "../style/icons/parquet_light.svg";

export const getLabIcon = (labIconName: string, iconSvg: string) => {
  return new LabIcon({
    name: `arbalister:${labIconName}`,
    svgstr: iconSvg,
  });
};

const PARQUET_ICON = getLabIcon("parquet", parquetSvgLight);
const PARQUET_DARK_ICON = getLabIcon("parquet-dark", parquetSvgDark);

const ARROW_IPC_ICON = getLabIcon("arrowipc", arrowIPCSvg);
const ARROW_IPC_DARK_ICON = getLabIcon("arrowipc-dark", arrowIPCDarkSvg);

const ORC_ICON = getLabIcon("orc", orcLightSvg);
const ORC_DARK_ICON = getLabIcon("orc-dark", orcDarkSvg);

const AVRO_ICON = getLabIcon("avro", avroSvg);
const AVRO_DARK_ICON = getLabIcon("avro-dark", avroSvg);

export const getParquetIcon = (isLight: boolean) => {
  console.log("???");
  const check = isLight ? PARQUET_ICON : PARQUET_DARK_ICON;
  console.log("check", check);
  return check;
};

export const getArrowIPCIcon = (isLight: boolean) => {
  return isLight ? ARROW_IPC_ICON : ARROW_IPC_DARK_ICON;
};
export const getORCIcon = (isLight: boolean) => {
  return isLight ? ORC_ICON : ORC_DARK_ICON;
};
export const getAvroIcon = (isLight: boolean) => {
  return isLight ? AVRO_ICON : AVRO_DARK_ICON;
};
