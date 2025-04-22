import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import axios from "axios";
import { z } from "zod";

export interface Country {
    cioc?: string;
    cca2?: string;
    ccn3?: string;
    name: {
        common: string;
        official: string;
    };
    flags: {
        alt?: string;
    };
}

export function setTools(server: McpServer) {
    server.tool(
        "get_flag_details_by_country",
        "Returns a country's flag description based on its name, formatted as: [CIOC-CCA2-CCN3 (Common Name/Official Name)] Flag Description",
        { country_name: z.string() },
        async ({ country_name }) => {
            const flag_data = await axios.get(
                `https://restcountries.com/v3.1/name/${country_name}`
              ).then((res) => {
                if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
                   return 'No country data found!';
                }
            
                return res.data.map((country: Country) => {
                  const codes = [
                    country.cioc,
                    country.cca2,
                    country.ccn3
                  ].filter(Boolean).join('-');
                  
                  const names = [
                    country.name.common,
                    country.name.official
                  ].filter(Boolean).join('/');
            
                  return `[${codes} (${names})]: ${country.flags.alt || 'No flag description available'} \n`;
                }).join('\n');
              }).catch((error) => {
                if (axios.isAxiosError(error)) {
                  if (error.response?.status === 404) {
                    return 'Country not found!';
                  }
                  return `Error fetching country data: ${error.message}`;
                }
                return `An unexpected error occurred: ${error.message}`;
              });


            return {
                content: [{
                    type: "text",
                    text: flag_data
                }]
            };
        }
    )
}