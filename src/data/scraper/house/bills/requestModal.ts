import axios from "axios";
import FormData from "form-data";
import { parse } from "node-html-parser";

const MODAL_URL = "https://www.congress.gov.ph/legisdocs/fetch_history.php";

/**
 * Request for the modal content for a specific row ID
 */
export default async function requestModal(
  rowId: string
): Promise<HTMLTableRowElement[]> {
  const formData = new FormData();
  formData.append("rowid", rowId);
  const { data } = await axios({
    method: "post",
    url: MODAL_URL,
    data: formData,
  });

  const root = parse(data);
  const rows = root.querySelectorAll("tr");

  if (rows == undefined) {
    throw new Error("Could not parse history modal rows");
  }

  return rows as any;
}
