import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { getFromLocalStorage, saveToLocalStorage } from "../utils";
import { PropertyPriceFilters } from "./FiltersBar";
import { v4 as uuidv4 } from "uuid";

type SavedStat = {
  id: string;
  note?: string;
} & PropertyPriceFilters;

const savedStatsKey = "savedStats";

export const SavedStats = ({
  currentFilters,
  handleChangeFilters,
}: {
  currentFilters: PropertyPriceFilters;
  handleChangeFilters: (filters: PropertyPriceFilters) => void;
}) => {
  const [note, setNote] = useState<string>("");
  const [savedStats, setSavedStats] = useState<SavedStat[]>(() => {
    const savedStats = getFromLocalStorage<SavedStat[]>(savedStatsKey);
    return savedStats ?? [];
  });

  const [selectedStat, setSelectedStat] = useState<SavedStat | null>(null);

  const handleSaveStat = (stat: SavedStat) => {
    const newSavedStats = [...savedStats, stat];

    setSavedStats(newSavedStats);
    saveToLocalStorage(savedStatsKey, newSavedStats);
  };

  const handleSelectSavedStat = (stat: SavedStat) => {
    handleChangeFilters(stat);
    setSelectedStat(stat);
    setNote(stat.note ?? "");
  };

  const handleSaveNote = () => {
    if (!selectedStat) return;

    const newSavedStats = savedStats.map((stat) => {
      if (stat.id === selectedStat.id) {
        return {
          ...stat,
          note,
        };
      }
      return stat;
    });

    setSavedStats(newSavedStats);
    saveToLocalStorage(savedStatsKey, newSavedStats);
  };

  return (
    <Box display={"flex"} width="100%" gap={2} alignItems={"flex-start"}>
      <Stack spacing={2}>
        {savedStats.map((stat) => (
          <Button
            variant={stat.id === selectedStat?.id ? "contained" : "outlined"}
            onClick={() => handleSelectSavedStat(stat)}
            key={stat.id}
          >
            {stat.propertyType}-{stat.startQuarter}-{stat.endQuarter}
          </Button>
        ))}
        <Button
          variant="contained"
          sx={{ whiteSpace: "nowrap" }}
          onClick={() => handleSaveStat({ ...currentFilters, id: uuidv4() })}
        >
          Save current configuration
        </Button>
      </Stack>
      {selectedStat ? (
        <Box
          display={"flex"}
          width={"100%"}
          justifyContent={"center"}
          alignItems={"center"}
          gap={3}
        >
          <Typography variant="h6">Note:</Typography>
          <TextField
            value={note}
            onChange={(e) => setNote(e.target.value)}
            size="small"
            variant="outlined"
            fullWidth
          />
          <Button
            onClick={handleSaveNote}
            sx={{ whiteSpace: "nowrap" }}
            variant="contained"
          >
            Save note
          </Button>
        </Box>
      ) : (
        <Typography variant="h6">Select a saved configuration</Typography>
      )}
    </Box>
  );
};
