import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography, IconButton, Divider, Avatar } from "@mui/material";
import { Delete as DeleteIcon, DragIndicator as DragIndicatorIcon } from "@mui/icons-material";
import { ChartRenderer } from "./ChartRenderer";
import { ResizableImage } from "./ResizableImage";
import { integrationsConfig } from "../../../utils";
import ReactQuill from "react-quill-new";
import debounce from "lodash.debounce";

const getElementLabel = (type) => {
    switch (type) {
        case 'text':
            return 'Texto';
        case 'chart':
            return 'Gráfico';
        case 'image':
            return 'Imagen';
        default:
            return 'Elemento';
    }
};

const quillFormats = [
    'header', 
  'align',
  'bold',
  'italic',
  'underline',
  'list',
  'bullet',
  'link',
];
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ align: [] }], 
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean'],
  ],
};



const ReportElementItem = memo(({ element, index, numberOfPreviousSameType, showCharts = true, onChange, removeElement }) => {

    const handleResize = useCallback((newWidth, newHeight, alt) => {
        onChange(element.id, { ...element, width: newWidth, height: newHeight, alt });
    }, [element, onChange]);

    const [localValue, setLocalValue] = useState(element.content);

    useEffect(() => {
        setLocalValue(element.content);
    }, [element.content]);

    const debouncedSave = useRef(
        debounce((val) => {
            onChange(element.id, { ...element, content: val });
        }, 300)
    ).current;

    useEffect(() => {
        return () => {
            debouncedSave.cancel?.();
        };
    }, [debouncedSave]);


    return (
        <Box
            id={element.id}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 1,
                borderRadius: 1,
                bgcolor: 'background.paper',
                boxShadow: 4,
                gap: 1,
                transition: 'background-color 0.2s, box-shadow 0.2s',
                cursor: showCharts ? 'default' : 'grab',
                '&:hover': { bgcolor: 'action.hover' },
            }}
        >
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                {!showCharts && (
                    <Box display="flex" alignItems="center" gap={1} mr={1}>
                        <DragIndicatorIcon fontSize="medium" />
                        <Divider orientation="vertical" flexItem />
                    </Box>
                )}

                {/* ELEMENT INFO */}
                <Box display="flex" flexDirection="column" flexGrow={1}>
                    <Typography variant="caption" fontWeight="bold">
                        {getElementLabel(element.type)} #{numberOfPreviousSameType}
                    </Typography>

                    {element.type === 'text' && !showCharts && (
                        <Typography variant="caption" color="text.secondary" sx={{
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {element.content.replace(/<[^>]+>/g, '').slice(0, 50)}
                            {element.content.replace(/<[^>]+>/g, '').length > 50 ? '...' : ''}
                        </Typography>
                    )}

                    {element.type === 'chart' && (
                        <Box display="flex" flexDirection="column" gap={0.5}>
                            <Typography variant="caption" color="textSecondary" fontSize={11}>
                                Proyecto: {element?.integration_data?.project?.name ?? 'N/A'}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{
                                    bgcolor: integrationsConfig[element?.integration_data?.integration?.platform]?.color,
                                    width: 20,
                                    height: 20
                                }}>
                                    {React.createElement(
                                        integrationsConfig[element?.integration_data?.integration?.platform]?.icon,
                                        { fontSize: "small", htmlColor: "#fff" }
                                    )}
                                </Avatar>
                                <Box display="flex" flexDirection="column">
                                    <Typography variant="caption" fontWeight="bold" color={integrationsConfig[element?.integration_data?.integration?.platform]?.color} lineHeight={1}>
                                        {element?.integration_data?.integration?.platform ?? 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" fontSize={11}>
                                        {element?.integration_data?.integration?.name ?? 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* DELETE BUTTON */}
                {showCharts && (
                    <IconButton size="small" color="error" onClick={() => removeElement(element.id)}>
                        <DeleteIcon />
                    </IconButton>
                )}
            </Box>

            {showCharts && <Divider />}

            {/* CONTENT AREA */}
            {showCharts && (
                <>
                    {element.type === "text" && (
                        <ReactQuill
                            theme="snow"
                            className="quill-dark"
                            value={localValue}
                            formats={quillFormats}
                            modules={quillModules} 
                            onChange={(val) => {
                                setLocalValue(val);
                                debouncedSave(val);
                            }}
                        />

                    )}

                    {element.type === "chart" && <ChartRenderer element={element} />}

                    {element.type === 'image' && (
                        <ResizableImage
                            element={element}
                            onResize={handleResize}
                            onResizeStop={(w, h, alt) => handleResize(w, h, alt)}
                        />
                    )}
                </>
            )}
        </Box>
    );
});
// }, (prev, next) => prev.element === next.element);

export default ReportElementItem;