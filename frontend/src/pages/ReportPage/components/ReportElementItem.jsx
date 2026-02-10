import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography, IconButton, Divider, Avatar } from "@mui/material";
import { Delete as DeleteIcon, DragIndicator as DragIndicatorIcon } from "@mui/icons-material";
import { ChartRenderer } from "./ChartRenderer";
import { ResizableImage } from "./ResizableImage";
import { integrationsConfig } from "../../../utils";
import ReactQuill, { Quill } from "react-quill-new";
import debounce from "lodash.debounce";
import DOMPurify from 'dompurify';

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

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        [{ align: [] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'clean'],
    ],
};

const MAX_INDENT = 10;
const ALLOWED_CLASSES = {
    li: Array.from({ length: MAX_INDENT }, (_, i) => `ql-indent-${i + 1}`),
    ol: Array.from({ length: MAX_INDENT }, (_, i) => `ql-indent-${i + 1}`),
    ul: Array.from({ length: MAX_INDENT }, (_, i) => `ql-indent-${i + 1}`),
};

const quillPurifyConfig = {
    ALLOWED_TAGS: [
        'h1', 'h2', 'h3',
        'b', 'i', 'u',
        'p', 'br', 'ul',
        'ol', 'li', 'strong',
        'em', 'a'
    ],
    ALLOWED_ATTR: [
        'href',
        'target',
        'rel',
        'class'
    ],
    ALLOWED_CLASSES: {
        'li': ALLOWED_CLASSES.li,
        'ol': ALLOWED_CLASSES.ol,
        'ul': ALLOWED_CLASSES.ul,
    }
};

export const ReportElementItem = memo(({ element, index, numberOfPreviousSameType, showCharts = true, onChange, removeElement }) => {
    const [localValue, setLocalValue] = useState(
        element?.content?.content_html ?? ""
    );

    const quillRef = useRef(null);
    useEffect(() => {
        if (!quillRef.current) return;
        const quill = quillRef.current.getEditor();

        if (quill.__pasteHandlerAttached) return;

        const handlePaste = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const clipboardData = e.clipboardData || window.clipboardData;
            const text = clipboardData.getData('text/plain');

            if (!text) return;

            const cleanText = text.replace(/\r\n|\r/g, '\n');

            const range = quill.getSelection(true);
            quill.deleteText(range.index, range.length);
            quill.insertText(range.index, cleanText); 
            quill.setSelection(range.index + cleanText.length, 0);
        };


        quill.root.addEventListener('paste', handlePaste, true);
        quill.__pasteHandlerAttached = true;

        return () => {
            quill.root.removeEventListener('paste', handlePaste, true);
            quill.__pasteHandlerAttached = false;
        };
    }, []);


    const [localSize, setLocalSize] = useState({
        width: element.width,
        height: element.height,
    });

    useEffect(() => {
        setLocalSize({
            width: element.width,
            height: element.height,
        });
    }, [element.width, element.height]);


    const debouncedSave = useRef(
        debounce((payload) => {
            onChange(element.id, payload);
        }, 500)
    ).current;


    const debouncedResize = useRef(
        debounce((payload) => {
            onChange(element.id, payload);
        }, 500)
    ).current;

    const handleResize = useCallback(
        (newWidth, newHeight, alt, immediate = false) => {
            setLocalSize({ width: newWidth, height: newHeight });

            const payload = {
                ...element,
                width: newWidth,
                height: newHeight,
                alt,
            };

            if (immediate) {
                debouncedResize.flush?.();
                onChange(element.id, payload);
            } else {
                debouncedResize(payload);
            }
        },
        [element, onChange, debouncedResize]
    );


    useEffect(() => {
        if (!quillRef.current) return;

        const quill = quillRef.current.getEditor();
        const delta = element?.content?.content_delta;
        let html = element?.content?.content_html ?? '';

        html = DOMPurify.sanitize(html, quillPurifyConfig);

        if (delta) {
            // Opción 1: convertir delta a HTML seguro
            quill.setContents(delta);
        } else {
            // Opción 2: solo HTML seguro
            quill.clipboard.dangerouslyPasteHTML(html);
        }

        setLocalValue(html);
    }, [element.id]);

    useEffect(() => {
        return () => {
            debouncedResize.cancel?.();
        };
    }, [debouncedResize]);

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
                    <Box display="flex" alignItems={'center'} flexItem gap={1} mr={1}>
                        <DragIndicatorIcon fontSize="medium" />
                        <Divider orientation="vertical" sx={{ alignSelf: 'stretch', height: 30 }} />
                    </Box>
                )}

                {/* ELEMENT INFO */}
                <Box display="flex" flexDirection="column" flexGrow={1}>
                    <Typography variant="body2" fontWeight="bold" sx={{
                        textDecoration: 'underline'
                    }}>
                        {getElementLabel(element.type)} #{numberOfPreviousSameType}
                    </Typography>

                    {element.type === 'text' && !showCharts && (
                        <Typography variant="caption" color="text.secondary" sx={{
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {element?.content.content_html?.replace(/<[^>]+>/g, '').slice(0, 50)}
                            {element?.content?.content_html?.replace(/<[^>]+>/g, '').length > 50 ? '...' : ''}
                        </Typography>
                    )}

                    {element.type === 'chart' && (
                        <Box display="flex" flexDirection="column" gap={0.5}>
                            <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    width: '100%',
                                    fontSize: 11
                                }}
                                textAlign={'left'}
                            >
                                Proyecto: {element?.integration_data?.project?.name ?? 'N/A'}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{
                                    bgcolor: integrationsConfig[element?.integration_data?.integration?.platform]?.color,
                                    borderRadius: 1,
                                    width: 25,
                                    height: 25
                                }}>
                                    {React.createElement(
                                        integrationsConfig[element?.integration_data?.integration?.platform]?.icon,
                                        { fontSize: "medium", htmlColor: "#fff" }
                                    )}
                                </Avatar>
                                <Box display="flex" alignItems="center" flexDirection="column" maxWidth={300}>
                                    <Typography
                                        lineHeight={1}
                                        variant="caption"
                                        fontWeight="bold"
                                        color={integrationsConfig[element?.integration_data?.integration?.platform]?.color}
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            width: '100%',
                                        }}
                                        textAlign={'left'}
                                    >
                                        {element?.integration_data?.integration?.platform ?? 'N/A'}
                                    </Typography>

                                    <Typography
                                        lineHeight={1.5}
                                        variant="caption"
                                        color="textSecondary"
                                        fontSize={11}
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            width: '100%',
                                        }}
                                        textAlign={'left'}
                                    >
                                        {element?.integration_data?.integration?.name ?? 'N/A'}
                                    </Typography>
                                </Box>

                            </Box>
                        </Box>
                    )}
                </Box>

                {/* DELETE BUTTON */}
                {showCharts && (
                    <IconButton sx={{ alignSelf: 'self-start' }} size="small" color="error" onClick={() => removeElement(element.id)}>
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
                            ref={quillRef}
                            theme="snow"
                            className="quill-dark"

                            value={localValue}
                            modules={quillModules}
                            onChange={(html, delta, source, editor) => {
                                const safeHtml = DOMPurify.sanitize(html, quillPurifyConfig);

                                setLocalValue(html);
                                debouncedSave({
                                    ...element,
                                    content: {
                                        content_html: safeHtml,
                                        content_delta: editor.getContents(),
                                    },
                                });
                            }}
                        />
                    )}

                    {element.type === "chart" && <ChartRenderer element={element} />}

                    {element.type === 'image' && (
                        <ResizableImage
                            element={{
                                ...element,
                                width: localSize.width,
                                height: localSize.height,
                            }}
                            onResize={(w, h, alt) => handleResize(w, h, alt, false)}
                            onResizeStop={(w, h, alt) => handleResize(w, h, alt, true)}
                        />
                    )}
                </>
            )}
        </Box>
    );
});
