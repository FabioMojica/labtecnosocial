import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Checkbox, Box, Typography, Card } from "@mui/material";
import dayjs from "dayjs";
import { buildRowsFromCommits } from "./utils/dataGridAdapter";
import { columns } from "./utils/columns";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const CustomizedDataGrid = ({
  commits,
  title,
  selectable = false,
  selected = false,
  onSelectChange,
  interval,
  selectedPeriod = "all",
}) => {

  const filteredCommits = React.useMemo(() => {
    if (!commits || commits.length === 0) return [];

    const today = dayjs().startOf("day");
    let startDate, endDate;

    switch (selectedPeriod) {
      case "today":
        startDate = today;
        endDate = today.endOf("day");
        break;
      case "lastWeek":
        startDate = today.subtract(7, "day");
        endDate = today.endOf("day");
        break;
      case "lastMonth":
        startDate = today.subtract(1, "month");
        endDate = today.endOf("day");
        break;
      case "lastSixMonths":
        startDate = today.subtract(6, "month");
        endDate = today.endOf("day");
        break;
      default:
        startDate = null;
        endDate = null;
    }

    if (!startDate) return commits;

    return commits.filter((c) => {
      const commitDate = dayjs(c.commit.author.date);
      return (
        commitDate.isSameOrAfter(startDate, "day") &&
        commitDate.isSameOrBefore(endDate, "day")
      );
    });
  }, [commits, selectedPeriod]);


  // Construimos las filas con los commits filtrados
  const rows = React.useMemo(
    () => buildRowsFromCommits(filteredCommits),
    [filteredCommits]
  );

  return (
    <Card variant="outlined" sx={{
      p: 0,
      position: 'relative',
    }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          pt: 2,
          mb: 1,
          pl: 2,
          pr: 1
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography component="h2" variant="subtitle2">
            {title}
          </Typography>
          <Typography variant="caption" color='textSecondary'>{interval}</Typography>
        </Box>

        {selectable && rows.length > 0 && (
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Checkbox checked={selected} onChange={(e) => onSelectChange?.(e.target.checked)} />
          </Box>
        )}
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
        }
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
        density="compact"
      />
    </Card>
  );
};
