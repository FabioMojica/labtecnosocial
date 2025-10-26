import { useEffect, useState } from "react";
import { Box, List, Typography } from "@mui/material";
import ParentItem from "./ParentItem";
import MenuContext from "./MenuContext";
import defaultData from "../default.data.json"; 

const StrategicPlanningTable = ({ year }) => {
  const [columns, setColumns] = useState([]);
  const [selectedFolderNames, setSelectedFolderNames] = useState([]);

  useEffect(() => {
    setColumns(defaultData.columns);
  }, []);

  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);

  const handleItemClick = (item, columnIndex) => {
    if (!item.children) return;
    const newColumns = columns.map((col, index) => {
      if (index === columnIndex + 1) {
        setSelectedFolderNames(prev => {
          const newNames = [...prev];
          newNames[columnIndex + 1] = item.name; 
          return newNames;
        });
        return { ...col, items: item.children };
      } else if (index > columnIndex + 1) {
        return { ...col, items: [] }; 
      }
      return col;
    });
    setColumns(newColumns);
  };

  const handleContextMenu = (event, item, columnIndex) => {
    event.preventDefault();
    setSelectedItem(item);
    setSelectedColumnIndex(columnIndex);
    setContextMenu({ mouseX: event.clientX - 2, mouseY: event.clientY - 4 });
  };

  const handleCloseMenu = () => {
    setContextMenu(null);
  };

  const handleDelete = () => {
    const newColumns = columns.map((col, index) => {
      if (index === selectedColumnIndex) {
        return { ...col, items: col.items.filter(i => i.id !== selectedItem.id) };
      }
      return col;
    });
    setColumns(newColumns);
    handleCloseMenu();
  };

  const handleEdit = () => {
    const newName = prompt("Editar nombre:", selectedItem.name);
    if (newName) {
      const newColumns = columns.map(col => ({
        ...col,
        items: col.items.map(i => (i.id === selectedItem.id ? { ...i, name: newName } : i)),
      }));
      setColumns(newColumns);
    }
    handleCloseMenu();
  };

  const handleAddToNextColumn = () => {
    if (selectedColumnIndex < columns.length - 1) {
      const newColumns = columns.map((col, index) => {
        if (index === selectedColumnIndex + 1) {
          const newItem = { id: Date.now(), name: "Nuevo Item", type: "parent", children: [] };
          return { 
            ...col, 
            items: [...col.items, newItem],
            subItemCount: col.items.filter(item => item.children?.length > 0).length + 1,
          };
        }
        return col;
      });
      setColumns(newColumns);
    }
    handleCloseMenu();
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" width={"100vw"} height={"auto"}>
      <Box display="flex" gap={2} padding={2} borderRadius={2} boxShadow={3} bgcolor="white" flexWrap="wrap">
        {columns.map((column, index) => (
          <Box
            key={index}
            sx={{
              width: 200,
              border: "1px solid #e0e0e0",
              padding: 1,
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: "#fafafa",
              margin: 1
            }}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                backgroundColor: "#f5f5f5",
                padding: "8px 0",
                borderRadius: 1,
                boxShadow: 1
              }}
            >
              <Typography variant="h6" textAlign="center">{column.title}</Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: "#f1f1f1",
                padding: "5px 0",
                borderRadius: 1,
                boxShadow: 1,
                marginTop: 1
              }}
            >
              <Typography variant="body2" textAlign="center" height={30}>
                {selectedFolderNames[index] ? selectedFolderNames[index] : null}
              </Typography>
            </Box>

            <List>
              {column.items.map((item) => (
                <ParentItem
                  key={item.id}
                  item={item}
                  onClick={() => handleItemClick(item, index)}
                  onContextMenu={(e) => handleContextMenu(e, item, index)}
                  isSelected={selectedItem?.id === item.id}
                />
              ))}
            </List>
          </Box>
        ))}
      </Box>
      <MenuContext
        contextMenu={contextMenu}
        handleClose={handleCloseMenu}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleAddToNextColumn={handleAddToNextColumn}
        nextColumn={columns[selectedColumnIndex + 1]?.title}
      />
    </Box>
  );
};

export default StrategicPlanningTable;
