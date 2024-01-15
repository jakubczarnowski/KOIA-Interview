import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useMemo } from "react";

import { PropertyType, propertiesNameMap } from "../hooks/useSquareMetersData";
import { generateQuarters } from "../utils";

export const filtersValidationSchema = z
  .object({
    propertyType: z
      .string()
      .refine((value): value is PropertyType =>
        Object.keys(propertiesNameMap).includes(value)
      ),
    startQuarter: z.string(),
    endQuarter: z.string(),
  })
  .superRefine((data, ctx) => {
    const startQuarterYear = parseInt(data.startQuarter.split("K")[0]);
    const endQuarterYear = parseInt(data.endQuarter.split("K")[0]);
    if (startQuarterYear > endQuarterYear) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start quarter must be before end quarter",
        path: ["startQuarter"],
      });
    }
  });

export type PropertyPriceFilters = z.infer<typeof filtersValidationSchema>;

type FiltersBarProps = {
  onFiltersChange: (filters: PropertyPriceFilters) => void;
  initialFilters: PropertyPriceFilters;
};

const MIN_START_YEAR = 2009;

export const FiltersBar = ({
  onFiltersChange,
  initialFilters,
}: FiltersBarProps) => {
  const { handleSubmit, control, formState } = useForm({
    defaultValues: { ...initialFilters },
    resolver: zodResolver(filtersValidationSchema),
  });

  const handleSubmitFilters = (data: PropertyPriceFilters) => {
    onFiltersChange(data);
  };

  const quartersOptions = useMemo(
    () =>
      generateQuarters({
        startDate: new Date(MIN_START_YEAR, 1),
        endDate: new Date(),
      }).slice(0, -1), // remove last quarter because it's not finished yet
    []
  );

  return (
    <form onSubmit={handleSubmit(handleSubmitFilters)}>
      <Box display="flex" alignItems={"center"} width={"100%"} gap={3}>
        <FormControl sx={{ m: 1, minWidth: 200 }}>
          <InputLabel id="property-type-label-id">Property type</InputLabel>
          <Controller
            name="propertyType"
            control={control}
            render={({ field }) => (
              <Select
                error={!!formState.errors.propertyType}
                label="Property Type"
                labelId="property-type-label-id"
                {...field}
              >
                {Object.entries(propertiesNameMap).map(
                  ([propertyType, { name }]) => (
                    <MenuItem key={propertyType} value={propertyType}>
                      {name}
                    </MenuItem>
                  )
                )}
              </Select>
            )}
          />
        </FormControl>

        <Controller
          name="startQuarter"
          control={control}
          render={({ field }) => (
            <Autocomplete
              disablePortal
              disableClearable
              options={quartersOptions}
              sx={{ width: 200 }}
              {...field}
              onChange={(_, value) => field.onChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Start Quarter"
                  helperText={formState.errors.startQuarter?.message}
                  error={!!formState.errors.startQuarter}
                />
              )}
            />
          )}
        />
        <Controller
          name="endQuarter"
          control={control}
          render={({ field }) => (
            <Autocomplete
              disablePortal
              disableClearable
              options={quartersOptions}
              sx={{ width: 200 }}
              {...field}
              onChange={(_, value) => field.onChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="End Quarter"
                  helperText={formState.errors.endQuarter?.message}
                  error={!!formState.errors.endQuarter}
                />
              )}
            />
          )}
        />
        <Button variant="outlined" size="large" type="submit">
          Filter
        </Button>
      </Box>
    </form>
  );
};
