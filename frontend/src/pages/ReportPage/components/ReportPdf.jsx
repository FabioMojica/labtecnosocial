
import { Text, View, Image, StyleSheet, Page, Document, Font } from "@react-pdf/renderer";
import { parseDocument } from "htmlparser2";
import logoLight from "../../../assets/labTecnoSocialLogoLight.png"
import { formatDateParts } from "../../../utils";


const MAX_CHARS_PER_LINE = 80;



Font.registerHyphenationCallback((word) => {
    const chunkSize = 1;
    const result = [];
    for (let i = 0; i < word.length; i += chunkSize) {
        result.push(word.slice(i, i + chunkSize));
    }
    return result;
});

const styles = StyleSheet.create({
    page: {
        display: 'flex',
        flexDirection: 'column',
        fontSize: 12,
        fontFamily: "Helvetica"
    },
    headerPage: {
        backgroundColor: '#1F7D53',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        height: 60,
        width: '100%',
    },
    reportDataHeader: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
    },
    logoHeader: {
        width: 100,
        height: 40
    },
    titleHeader: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
        flexGrow: 1,
        flexBasis: 0,
    },
    metadataHeader: {
        width: 120,
        maxWidth: 120,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingLeft: 10,
    },
    metaDataTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    metaDataDates: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#f1eaea',
    },
    contentPage: {
        padding: 20,
    },
    paragraph: { marginBottom: 10, flexWrap: 'wrap', wordBreak: 'break-word' },
    bold: { fontWeight: "bold", flexWrap: 'wrap', wordBreak: 'break-word' },
    italic: { fontStyle: "italic", flexWrap: 'wrap', wordBreak: 'break-word' },
    underline: { textDecoration: "underline", flexWrap: 'wrap', wordBreak: 'break-word' },
    strike: { textDecoration: "line-through", flexWrap: 'wrap', wordBreak: 'break-word' },
    list: { marginVertical: 5, paddingLeft: 15, flexWrap: 'wrap', wordBreak: 'break-word' },
    listItem: { marginBottom: 2, flexWrap: 'wrap', wordBreak: 'break-word' },
    image: { marginVertical: 5, maxWidth: "100%", height: "auto" },
});

const getFontSizeForTitle = (title) => {
    if (!title) return 20;
    if (title.length > 30) return 18;
    return 25;
};

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
    console.log(counters, level);

    const numbers = counters.slice(0, level + 1);
    console.log(numbers.join(".") + ".")
    return numbers.join(".") + ".";
};


const renderList = (node, key, parentCounters = []) => {
    if (!node.children) return null;

    let counters = [...parentCounters];

    return node.children.map((liNode, i) => {
        if (liNode.type !== "tag" || liNode.name !== "li") return null;

        const indentClass = liNode.attribs?.class || "";
        console.log("indent", indentClass)
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

         const textAlign =
            liNode.attribs?.class?.includes("ql-align-center")
                ? "center"
                : liNode.attribs?.class?.includes("ql-align-right")
                    ? "right"
                    : liNode.attribs?.class?.includes("ql-align-justify")
                        ? "justify"
                        : "left";

        return (
            <View key={`${key}-${i}`}>
                <Text style={{ marginLeft, marginBottom: 2, textAlign }}>
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
            <Page size="A4" style={styles.page} wrap={true}>
                <View style={styles.headerPage}>
                    <View style={styles.reportDataHeader} wrap={true}>
                        <Image src={logoLight} alt="Lab Tecno Social Logo" style={styles.logoHeader} />
                        <View style={{display: 'flex', flexDirection: 'row', height: '100%', alignItems: 'center', flex: 1, paddingHorizontal: 10, borderLeft: '1px solid #FFFFFF', borderRight: '1px solid #FFFFFF'}}>
                            <Text wrap={true} style={{ ...styles.titleHeader, fontSize: getFontSizeForTitle(title) }}>
                                {title}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.metadataHeader}>
                        <Text style={styles.metaDataTitle}>
                            Datos de generación:
                        </Text>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 4 }}>
                            <Text style={styles.metaDataTitle}>
                                Fecha:
                            </Text>
                            <Text style={styles.metaDataDates}>
                                {formatDateParts(Date.now()).date}
                            </Text>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
                            <Text style={styles.metaDataTitle}>
                                Hora:
                            </Text>
                            <Text style={styles.metaDataDates}>
                                {formatDateParts(Date.now()).time}
                            </Text>
                        </View>
                    </View>
                </View>


                <View style={styles.contentPage}>
                    {elements.map((el, index) => {
                        return (
                            <View key={el.id} style={styles.section}>
                                {el.type === "text" && (
                                    <View>{renderQuillHTML(el?.content?.content_html)}</View>
                                )}

                                {el.type === "image" && el.src && (
                                    <Image src={el.src} style={styles.image} />
                                )}
                            </View>
                        );

                    })}
                </View>
            </Page>
        </Document>
    );
};