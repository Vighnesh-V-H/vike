import axios from "axios";

/**
 * Service class for Microsoft Excel operations
 */
export class ExcelService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get all Excel files from OneDrive
   */
  async getExcelFiles() {
    try {
      const response = await axios.get(
        "https://graph.microsoft.com/v1.0/me/drive/root/search(q='.xlsx')?$top=25",
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.data.value.map((file: any) => ({
        id: file.id,
        name: file.name,
        webUrl: file.webUrl,
        lastModifiedDateTime: file.lastModifiedDateTime,
        size: file.size,
        createdDateTime: file.createdDateTime,
      }));
    } catch (error) {
      console.error("Error fetching Excel files:", error);
      throw error;
    }
  }

  /**
   * Get a specific worksheet from an Excel file
   */
  async getWorksheet(fileId: string, worksheetName?: string) {
    try {
      // First, get all worksheets in the workbook
      const worksheetsResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/worksheets`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      const worksheets = worksheetsResponse.data.value;

      // If no worksheet name is specified, use the first one
      const targetWorksheet = worksheetName
        ? worksheets.find((ws: any) => ws.name === worksheetName)
        : worksheets[0];

      if (!targetWorksheet) {
        throw new Error(`Worksheet "${worksheetName}" not found`);
      }

      // Get the used range of the worksheet
      const rangeResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/worksheets/${targetWorksheet.id}/usedRange`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return {
        worksheetName: targetWorksheet.name,
        values: rangeResponse.data.values,
        address: rangeResponse.data.address,
      };
    } catch (error) {
      console.error("Error fetching worksheet:", error);
      throw error;
    }
  }

  /**
   * Update cells in a worksheet
   */
  async updateCells(
    fileId: string,
    worksheetName: string,
    range: string,
    values: any[][]
  ) {
    try {
      await axios.patch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/worksheets/${worksheetName}/range(address='${range}')`,
        {
          values,
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true };
    } catch (error) {
      console.error("Error updating cells:", error);
      throw error;
    }
  }

  /**
   * Create a new Excel file
   */
  async createExcelFile(filename: string, data?: any[][]) {
    try {
      // Create an empty Excel file
      const createResponse = await axios.post(
        "https://graph.microsoft.com/v1.0/me/drive/root/children",
        {
          name: `${filename}.xlsx`,
          file: {},
          "@microsoft.graph.conflictBehavior": "rename",
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const fileId = createResponse.data.id;

      // If data is provided, add it to the first worksheet
      if (data && data.length > 0) {
        // Get the worksheets in the new file
        const worksheetsResponse = await axios.get(
          `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/worksheets`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );

        const defaultWorksheet = worksheetsResponse.data.value[0];

        // Determine the range based on data dimensions
        const rows = data.length;
        const columns = Math.max(...data.map((row) => row.length));
        const range = `A1:${String.fromCharCode(65 + columns - 1)}${rows}`;

        // Update the cells with data
        await this.updateCells(fileId, defaultWorksheet.name, range, data);
      }

      return {
        fileId,
        name: `${filename}.xlsx`,
        webUrl: createResponse.data.webUrl,
      };
    } catch (error) {
      console.error("Error creating Excel file:", error);
      throw error;
    }
  }
}
