import axios from "axios";


export class ExcelService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

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

  async getWorksheet(fileId: string, worksheetName?: string) {
    try {
      const worksheetsResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/worksheets`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      const worksheets = worksheetsResponse.data.value;

      const targetWorksheet = worksheetName
        ? worksheets.find((ws: any) => ws.name === worksheetName)
        : worksheets[0];

      if (!targetWorksheet) {
        throw new Error(`Worksheet "${worksheetName}" not found`);
      }

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

  async createExcelFile(filename: string, data?: any[][]) {
    try {
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

      if (data && data.length > 0) {
        const worksheetsResponse = await axios.get(
          `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/worksheets`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );

        const defaultWorksheet = worksheetsResponse.data.value[0];

        const rows = data.length;
        const columns = Math.max(...data.map((row) => row.length));
        const range = `A1:${String.fromCharCode(65 + columns - 1)}${rows}`;

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
