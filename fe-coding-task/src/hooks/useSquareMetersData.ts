import { useQuery } from "@tanstack/react-query";
import { generateQuarters, parseQuaterValueToDate } from "../utils";
import { PropertyPriceFilters } from "../components/FiltersBar";

export type PropertyType = "Boliger" | "Smahaus" | "Blokkleiligheter";

export const propertiesNameMap: Record<
  PropertyType,
  {
    name: string;
    code: string;
  }
> = {
  Boliger: {
    name: "Boliger i alt",
    code: "00",
  },
  Smahaus: {
    name: "Småhus",
    code: "02",
  },
  Blokkleiligheter: {
    name: "Blokkleiligheter",
    code: "03",
  },
} as const;

// Don't need anything else
type SquareMetersDataResponse = {
  value: number[];
};

const fetchSquareMetersData = async (args: PropertyPriceFilters) => {
  const startDate = parseQuaterValueToDate(args.startQuarter);
  const endDate = parseQuaterValueToDate(args.endQuarter);
  const quarters = generateQuarters({ startDate, endDate });

  const propertyCode = propertiesNameMap[args.propertyType].code;

  // Just hard code it, the only fetch in the app
  return await fetch("https://data.ssb.no/api/v0/no/table/07241", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: [
        {
          code: "Boligtype",
          selection: {
            filter: "item",
            values: [propertyCode],
          },
        },
        {
          code: "ContentsCode",
          selection: {
            filter: "item",
            values: ["KvPris"],
          },
        },
        {
          code: "Tid",
          selection: {
            filter: "item",
            values: quarters,
          },
        },
      ],
    }),
  }).then(async (res) => (await res.json()) as SquareMetersDataResponse);
};

export const useSquareMetersData = ({
  queryArgs,
}: {
  queryArgs: PropertyPriceFilters;
}) => {
  const query = useQuery({
    queryKey: ["squareMeters", queryArgs],
    queryFn: async () => await fetchSquareMetersData(queryArgs),
  });
  return query;
};
