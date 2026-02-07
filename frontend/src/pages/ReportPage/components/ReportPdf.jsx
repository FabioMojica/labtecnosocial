import React from "react";
import { Text, View, Image, StyleSheet, Page, Document } from "@react-pdf/renderer";
import { parseDocument } from "htmlparser2";

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
    paragraph: { marginBottom: 10 },
    bold: { fontWeight: "bold" },
    italic: { fontStyle: "italic" },
    underline: { textDecoration: "underline" },
    strike: { textDecoration: "line-through" },
    list: { marginVertical: 5, paddingLeft: 15 },
    listItem: { marginBottom: 2 },
    image: { marginVertical: 5, maxWidth: "100%", height: "auto" },
});

const cleanNode = (node) => {
    if (!node) return null;
    if (node.type === "tag" && node.name === "span" && node.attribs?.class === "ql-ui") return null;
    return node;
};

const getTextFromNode = (node) => {
    if (!node) return [];
    if (node.type === "text") return [node.data];

    if (node.type === "tag") {
        const children = (node.children || []).map(getTextFromNode).flat();
        let style = {};
        if (node.name === "strong" || node.name === "b") style = styles.bold;
        if (node.name === "i" || node.name === "em") style = styles.italic;
        if (node.name === "u") style = styles.underline;
        if (node.name === "s" || node.name === "strike") style = styles.strike;
        return children.map((child, i) =>
            typeof child === "string" ? <Text key={i} style={style}>{child}</Text> : child
        );
    }
    return [];
};

const getNumberedBullet = (counters, level) => {
    const numbers = counters.slice(0, level + 1);
    return numbers.join(".") + ".";
};


const renderList = (node, key, parentCounters = []) => {
    if (!node.children) return null;

    let counters = [...parentCounters];

    return node.children.map((liNode, i) => {
        if (liNode.type !== "tag" || liNode.name !== "li") return null;

        const indentClass = liNode.attribs?.class || "";
        const level = parseInt((indentClass.match(/ql-indent-(\d)/) || [0, 0])[1]);

        counters[level] = (counters[level] || 0) + 1;

        for (let l = level + 1; l < counters.length; l++) {
            counters[l] = 0;
        }

        const marginLeft = 15 * (level + 1);

        const bullet = liNode.attribs?.["data-list"] === "ordered"
            ? getNumberedBullet(counters, level)
            : "•";

        const sublist = liNode.children?.find(n => n.name === "ol" || n.name === "ul");

        return (
            <View key={`${key}-${i}`}>
                <Text style={{ marginLeft, marginBottom: 2 }}>
                    {bullet} {renderNode(liNode, `${key}-${i}`)}
                </Text>
                {sublist && renderList(sublist, `${key}-${i}`, [...counters])}
            </View>
        );
    });
};


const renderNode = (node, key) => {
    node = cleanNode(node);
    if (!node) return null;

    if (node.type === "text") return <Text key={key}>{node.data}</Text>;

    if (node.type === "tag") {
        const children = (node.children || []).map((child, i) => renderNode(child, `${key}-${i}`));

        const textAlign =
            node.attribs?.class?.includes("ql-align-center")
                ? "center"
                : node.attribs?.class?.includes("ql-align-right")
                    ? "right"
                    : node.attribs?.class?.includes("ql-align-justify")
                        ? "justify"
                        : "left";

        switch (node.name) {
            case "p":
                return <Text key={key} style={{ ...styles.paragraph, textAlign }}>{children}</Text>;
            case "h1":
                return <Text key={key} style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8, textAlign }}>{children}</Text>;
            case "h2":
                return <Text key={key} style={{ fontSize: 20, fontWeight: "bold", marginBottom: 6, textAlign }}>{children}</Text>;
            case "h3":
                return <Text key={key} style={{ fontSize: 16, fontWeight: "bold", marginBottom: 6, textAlign }}>{children}</Text>;

            case "ol":
            case "ul":
                return (
                    <View key={key} style={{ marginVertical: 5 }}>
                        {renderList(node, key)}
                    </View>
                );


            case "li":
                return <Text key={key} style={{ marginBottom: 2 }}>{children}</Text>;
            case "img":
                return <Image key={key} src={node.attribs.src} style={styles.image} />;
            case "br":
                return <Text key={key}>{"\n"}</Text>;
            default:
                return <Text key={key}>{children}</Text>;
        }
    }

    return null;
};

export const renderQuillHTML = (html) => {
    const doc = parseDocument(html);
    return doc.children.map((node, i) => renderNode(node, `node-${i}`));
};

export const ReportPDF = ({ title, elements }) => {
    console.log(elements);
    return (
        <Document>
            <Page style={styles.page}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>
                    {title}
                </Text>

                {elements.map((el, index) => {
                    try {
                        return (
                            <View key={el.id} style={styles.section}>
                                <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                                    {el.type.toUpperCase()} #{index + 1}
                                </Text>

                                {el.type === "text" && (
                                    <View>{renderQuillHTML(el.content)}</View>
                                )}

                                {el.type === "image" && el.src && (
                                    <Image src={el.src} style={styles.image} />
                                )}
                            </View>
                        );
                    } catch (error) {
                        console.error("Error renderizando elemento:", el, error);
                        return (
                            <View key={el.id} style={styles.section}>
                                <Text style={{ color: "red" }}>
                                    ⚠️ No se puede renderizar este elemento
                                </Text>
                            </View>
                        );
                    }
                })}

            </Page>
        </Document>
    );
};