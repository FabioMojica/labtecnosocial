import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Checkbox, Box, Typography } from "@mui/material";
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
      console.log("xxxxxxxx",startDate);
      console.log("xxxxxxxx", endDate);
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
    <Box sx={{ m: 0, p: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center", 
        }}
      >
        <Typography component="h2" fontWeight={"bold"} variant="subtitle2">
          {title}
        </Typography>

        {selectable && rows.length > 0 && (
          <Checkbox
            checked={selected}
            onChange={(e) => onSelectChange?.(e.target.checked)}
          />
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
    </Box>
  );
};
