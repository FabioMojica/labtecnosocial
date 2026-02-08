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

const cleanHtmlForQuill = (html, quill) => {
    // Crear un div temporal para parsear
    const div = document.createElement('div');
    div.innerHTML = html;

    // Solo extraer el texto plano
    const plainText = div.textContent || div.innerText || "";

    // Insertar en Quill en la posición actual
    const range = quill.getSelection(true);
    quill.deleteText(range.index, range.length); // eliminar selección si hay
    quill.insertText(range.index, plainText);    // insertar texto plano
    quill.setSelection(range.index + plainText.length, 0);
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

export const ReportElementItem = memo(({ element, index, numberOfPreviousSameType, showCharts = true, onChange, removeElement }) => {
    const [localValue, setLocalValue] = useState(
        element?.content?.content_html ?? ""
    );

    const quillRef = useRef(null);
    useEffect(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();

    const handlePaste = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const clipboardData = e.clipboardData || window.clipboardData;
        const html = clipboardData.getData('text/html') || clipboardData.getData('text/plain');
        if (!html) return;

        const safeHtml = DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['b', 'i', 'u', 'p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'a'],
            ALLOWED_ATTR: ['href', 'target', 'rel']
        });

        const range = quill.getSelection(true);
        quill.deleteText(range.index, range.length);
        quill.clipboard.dangerouslyPasteHTML(range.index, safeHtml);
        quill.setSelection(range.index + safeHtml.length, 0);
    };

    quill.root.addEventListener('paste', handlePaste, true);

    return () => {
        quill.root.removeEventListener('paste', handlePaste, true);
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

        // SANITIZAR el HTML antes de ponerlo en Quill
        html = DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['b', 'i', 'u', 'p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'a'],
            ALLOWED_ATTR: ['href', 'target', 'rel']
        });

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
                    <Box display="flex" flexItem gap={1} mr={1}>
                        <DragIndicatorIcon fontSize="medium" />
                        <Divider orientation="vertical" flexItem sx={{ alignSelf: 'stretch' }} />
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
                        // <ReactQuill
                        //     ref={quillRef}
                        //     theme="snow"
                        //     className="quill-dark"
                        //     value={localValue}
                        //     modules={quillModules}
                        //     onChange={(html, delta, source, editor) => {

                        //         setLocalValue(html);
                        //         debouncedSave({
                        //             ...element,
                        //             content: {
                        //                 content_html: html,
                        //                 content_delta: editor.getContents(),
                        //             },
                        //         });
                        //     }}

                        // />

                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={localValue}
                            modules={quillModules}
                            onChange={(html, delta, source, editor) => {
                                // Sanitize HTML antes de guardar
                                const safeHtml = DOMPurify.sanitize(html, {
                                    ALLOWED_TAGS: ['b', 'i', 'u', 'p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'a'],
                                    ALLOWED_ATTR: ['href', 'target', 'rel']
                                });

                                setLocalValue(safeHtml);
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
