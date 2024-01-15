import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { PropertyType, useSquareMetersData } from "./hooks/useSquareMetersData";
import { useMemo, useState } from "react";
import {
  generateQuarters,
  getFromURLParams,
  parseQuaterValueToDate,
  saveToURLParams,
} from "./utils";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Chart,
  Tooltip,
} from "chart.js";
import { PropertyPriceFilters, FiltersBar } from "./components/FiltersBar";
import { SavedStats } from "./components/SavedStats";

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const filtersParamsKeys: {
  [key in keyof PropertyPriceFilters]: string;
} = {
  propertyType: "property_type",
  startQuarter: "start_quarter",
  endQuarter: "end_quarter",
} as const;

const getInitialFilters = (): PropertyPriceFilters => {
  const startQuarter = getFromURLParams<string>(filtersParamsKeys.startQuarter);
  const endQuarter = getFromURLParams<string>(filtersParamsKeys.endQuarter);
  const propertyType = getFromURLParams<PropertyType>(
    filtersParamsKeys.propertyType
  );

  return {
    startQuarter: startQuarter ?? "2009K1",
    endQuarter: endQuarter ?? "2021K2",
    propertyType: propertyType ?? "Smahaus",
  };
};

function App() {
  const [currentFilters, setCurrentFilters] =
    useState<PropertyPriceFilters>(getInitialFilters);

  const { data, isLoading } = useSquareMetersData({
    queryArgs: currentFilters,
  });

  const handleChangeFilters = (data: PropertyPriceFilters) => {
    setCurrentFilters(data);

    saveToURLParams(filtersParamsKeys.startQuarter, data.startQuarter);
    saveToURLParams(filtersParamsKeys.endQuarter, data.endQuarter);
    saveToURLParams(filtersParamsKeys.propertyType, data.propertyType);
  };

  const chartLabels = useMemo(() => {
    const startDate = parseQuaterValueToDate(currentFilters.startQuarter);
    const endDate = parseQuaterValueToDate(currentFilters.endQuarter);
    const quarters = generateQuarters({ startDate, endDate });

    return quarters;
  }, [currentFilters.startQuarter, currentFilters.endQuarter]);

  return (
    <Container maxWidth="lg" sx={{ marginX: "auto" }}>
      <Box
        width={"100%"}
        display="flex"
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        gap={3}
      >
        <Typography variant="h3">Norwegian House Prices</Typography>
        <FiltersBar
          initialFilters={currentFilters}
          onFiltersChange={handleChangeFilters}
        />
        {isLoading && (
          <Box
            height={400}
            width={"100%"}
            display="flex"
            justifyContent={"center"}
            alignItems={"center"}
          >
            <CircularProgress />
          </Box>
        )}
        {data?.value && (
          <Box
            width="100%"
            height="400px"
            display="flex"
            justifyContent={"center"}
          >
            <Bar
              options={{
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
              }}
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    label: "Avarage price per square meter (NOK)",
                    data: data?.value,
                  },
                ],
              }}
            />
          </Box>
        )}
        <SavedStats
          handleChangeFilters={handleChangeFilters}
          currentFilters={currentFilters}
        />
      </Box>
    </Container>
  );
}

export default App;
