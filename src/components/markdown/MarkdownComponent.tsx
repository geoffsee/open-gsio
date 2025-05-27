import React from "react";

import {
    Box,
    Code,
    Divider,
    Heading,
    Link,
    List,
    ListItem,
    OrderedList,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
} from "@chakra-ui/react";
import {marked} from "marked";

import markedKatex from "marked-katex-extension";
import katex from "katex";
import CodeBlock from "../code/CodeBlock";
import ImageWithFallback from "./ImageWithFallback";

try {
    if (localStorage) {
        marked.use(
            markedKatex({
                nonStandard: false,
                displayMode: true,
                throwOnError: false,
                strict: true,
                colorIsTextColor: true,
                errorColor: "red",
            }),
        );
    }
} catch (_) {
}

const MemoizedCodeBlock = React.memo(CodeBlock);

const getHeadingProps = (depth: number) => {
    switch (depth) {
        case 1:
            return {as: "h1", size: "xl", mt: 4, mb: 2};
        case 2:
            return {as: "h2", size: "lg", mt: 3, mb: 2};
        case 3:
            return {as: "h3", size: "md", mt: 2, mb: 1};
        case 4:
            return {as: "h4", size: "sm", mt: 2, mb: 1};
        case 5:
            return {as: "h5", size: "sm", mt: 2, mb: 1};
        case 6:
            return {as: "h6", size: "xs", mt: 2, mb: 1};
        default:
            return {as: `h${depth}`, size: "md", mt: 2, mb: 1};
    }
};

interface TableToken extends marked.Tokens.Table {
    align: Array<"center" | "left" | "right" | null>;
    header: (string | marked.Tokens.TableCell)[];
    rows: (string | marked.Tokens.TableCell)[][];
}

const CustomHeading: React.FC<{ text: string; depth: number }> = ({
                                                                      text,
                                                                      depth,
                                                                  }) => {
    const headingProps = getHeadingProps(depth);
    return (
        <Heading
            {...headingProps}
            wordBreak="break-word"
            maxWidth="100%"
            color="text.accent"
        >
            {text}
        </Heading>
    );
};

const CustomParagraph: React.FC<{ children: React.ReactNode }> = ({
                                                                      children,
                                                                  }) => {
    return (
        <Text
            as="p"
            fontSize="sm"
            lineHeight="short"
            wordBreak="break-word"
            maxWidth="100%"
        >
            {children}
        </Text>
    );
};

const CustomBlockquote: React.FC<{ children: React.ReactNode }> = ({
                                                                       children,
                                                                   }) => {
    return (
        <Box
            as="blockquote"
            borderLeft="4px solid"
            borderColor="gray.200"
            fontStyle="italic"
            color="gray.600"
            pl={4}
            maxWidth="100%"
            wordBreak="break-word"
            mb={2}
        >
            {children}
        </Box>
    );
};

const CustomCodeBlock: React.FC<{ code: string; language?: string }> = ({
                                                                            code,
                                                                            language,
                                                                        }) => {
    return (
        <MemoizedCodeBlock
            language={language}
            code={code}
            onRenderComplete={() => Promise.resolve()}
        />
    );
};

const CustomHr: React.FC = () => <Divider my={4}/>;

const CustomList: React.FC<{
    ordered?: boolean;
    start?: number;
    children: React.ReactNode;
}> = ({ordered, start, children}) => {
    const commonStyles = {
        fontSize: "sm",
        wordBreak: "break-word" as const,
        maxWidth: "100%" as const,
        stylePosition: "outside" as const,
        mb: 2,
        pl: 4,
    };

    return ordered ? (
        <OrderedList start={start} {...commonStyles}>
            {children}
        </OrderedList>
    ) : (
        <List styleType="disc" {...commonStyles}>
            {children}
        </List>
    );
};

const CustomListItem: React.FC<{
    children: React.ReactNode;
}> = ({children}) => {
    return <ListItem mb={1}>{children}</ListItem>;
};

const CustomKatex: React.FC<{ math: string; displayMode: boolean }> = ({
                                                                           math,
                                                                           displayMode,
                                                                       }) => {
    const renderedMath = katex.renderToString(math, {displayMode});

    return (
        <Box
            as="span"
            display={displayMode ? "block" : "inline"}
            // bg={bg}
            p={displayMode ? 4 : 1}
            my={displayMode ? 4 : 0}
            borderRadius="md"
            overflow="auto"
            maxWidth="100%"
            dangerouslySetInnerHTML={{__html: renderedMath}}
        />
    );
};

const CustomTable: React.FC<{
    header: React.ReactNode[];
    align: Array<"center" | "left" | "right" | null>;
    rows: React.ReactNode[][];
}> = ({header, align, rows}) => {
    return (
        <Table
            variant="simple"
            size="sm"
            my={4}
            borderRadius="md"
            overflow="hidden"
        >
            <Thead bg="background.secondary">
                <Tr>
                    {header.map((cell, i) => (
                        <Th
                            key={i}
                            textAlign={align[i] || "left"}
                            fontWeight="bold"
                            p={2}
                            minW={16}
                            wordBreak="break-word"
                        >
                            {cell}
                        </Th>
                    ))}
                </Tr>
            </Thead>
            <Tbody>
                {rows.map((row, rIndex) => (
                    <Tr key={rIndex}>
                        {row.map((cell, cIndex) => (
                            <Td
                                key={cIndex}
                                textAlign={align[cIndex] || "left"}
                                p={2}
                                wordBreak="break-word"
                            >
                                {cell}
                            </Td>
                        ))}
                    </Tr>
                ))}
            </Tbody>
        </Table>
    );
};

const CustomHtmlBlock: React.FC<{ content: string }> = ({content}) => {
    return <Box dangerouslySetInnerHTML={{__html: content}} mb={2}/>;
};

const CustomText: React.FC<{ text: React.ReactNode }> = ({text}) => {
    return (
        <Text
            fontSize="sm"
            lineHeight="short"
            color="text.accent"
            wordBreak="break-word"
            maxWidth="100%"
            as="span"
        >
            {text}
        </Text>
    );
};

interface CustomStrongProps {
    children: React.ReactNode;
}

const CustomStrong: React.FC<CustomStrongProps> = ({children}) => {
    return <Text as="strong">{children}</Text>;
};

const CustomEm: React.FC<{ children: React.ReactNode }> = ({children}) => {
    return (
        <Text
            as="em"
            fontStyle="italic"
            lineHeight="short"
            wordBreak="break-word"
            display="inline"
        >
            {children}
        </Text>
    );
};

const CustomDel: React.FC<{ text: string }> = ({text}) => {
    return (
        <Text
            as="del"
            textDecoration="line-through"
            lineHeight="short"
            wordBreak="break-word"
            display="inline"
        >
            {text}
        </Text>
    );
};

const CustomCodeSpan: React.FC<{ code: string }> = ({code}) => {
    const bg = useColorModeValue("gray.100", "gray.800");
    return (
        <Code
            fontSize="sm"
            bg={bg}
            overflowX="clip"
            borderRadius="md"
            wordBreak="break-word"
            maxWidth="100%"
            p={0.5}
        >
            {code}
        </Code>
    );
};

const CustomMath: React.FC<{ math: string; displayMode?: boolean }> = ({
                                                                           math,
                                                                           displayMode = false,
                                                                       }) => {
    return (
        <Box
            as="span"
            display={displayMode ? "block" : "inline"}
            p={displayMode ? 4 : 1}
            my={displayMode ? 4 : 0}
            borderRadius="md"
            overflow="auto"
            maxWidth="100%"
            className={`math ${displayMode ? "math-display" : "math-inline"}`}
        >
            {math}
        </Box>
    );
};

const CustomLink: React.FC<{
    href: string;
    title?: string;
    children: React.ReactNode;
}> = ({href, title, children, ...props}) => {
    return (
        <Link
            href={href}
            title={title}
            isExternal
            sx={{
                "& span": {
                    color: "text.link",
                },
            }}
            maxWidth="100%"
            color="teal.500"
            wordBreak="break-word"
            {...props}
        >
            {children}
        </Link>
    );
};

const CustomImage: React.FC<{ href: string; text: string; title?: string }> = ({
                                                                                   href,
                                                                                   text,
                                                                                   title,
                                                                               }) => {
    return (
        <ImageWithFallback
            src={href}
            alt={text}
            title={title}
            maxW="100%"
            width="auto"
            height="auto"
            my={2}
        />
    );
};

function parseTokens(tokens: marked.Token[]): JSX.Element[] {
    const output: JSX.Element[] = [];
    let blockquoteContent: JSX.Element[] = [];

    tokens.forEach((token, i) => {
        switch (token.type) {
            case "heading":
                output.push(
                    <CustomHeading key={i} text={token.text} depth={token.depth}/>,
                );
                break;

            case "paragraph": {
                const parsedContent = token.tokens
                    ? parseTokens(token.tokens)
                    : token.text;
                if (blockquoteContent.length > 0) {
                    blockquoteContent.push(
                        <CustomParagraph key={i}>{parsedContent}</CustomParagraph>,
                    );
                } else {
                    output.push(
                        <CustomParagraph key={i}>{parsedContent}</CustomParagraph>,
                    );
                }
                break;
            }
            case "br":
                output.push(<br key={i}/>);
                break;
            case "escape": {
                break;
            }
            case "blockquote_start":
                blockquoteContent = [];
                break;

            case "blockquote_end":
                output.push(
                    <CustomBlockquote key={i}>
                        {parseTokens(blockquoteContent)}
                    </CustomBlockquote>,
                );
                blockquoteContent = [];
                break;
            case "blockquote": {
                output.push(
                    <CustomBlockquote key={i}>
                        {token.tokens ? parseTokens(token.tokens) : null}
                    </CustomBlockquote>,
                );
                break;
            }
            case "math":
                output.push(
                    <CustomMath key={i} math={(token as any).value} displayMode={true}/>,
                );
                break;

            case "inlineMath":
                output.push(
                    <CustomMath
                        key={i}
                        math={(token as any).value}
                        displayMode={false}
                    />,
                );
                break;
            case "inlineKatex":
            case "blockKatex": {
                const katexToken = token as any;
                output.push(
                    <CustomKatex
                        key={i}
                        math={katexToken.text}
                        displayMode={katexToken.displayMode}
                    />,
                );
                break;
            }
            case "code":
                output.push(
                    <CustomCodeBlock key={i} code={token.text} language={token.lang}/>,
                );
                break;

            case "hr":
                output.push(<CustomHr key={i}/>);
                break;
            case "list": {
                const {ordered, start, items} = token;
                const listItems = items.map((listItem, idx) => {
                    const nestedContent = parseTokens(listItem.tokens);
                    return <CustomListItem key={idx}>{nestedContent}</CustomListItem>;
                });

                output.push(
                    <CustomList key={i} ordered={ordered} start={start}>
                        {listItems}
                    </CustomList>,
                );
                break;
            }
            case "table": {
                const tableToken = token as TableToken;

                output.push(
                    <CustomTable
                        key={i}
                        header={tableToken.header.map((cell) =>
                            typeof cell === "string" ? cell : parseTokens(cell.tokens || []),
                        )}
                        align={tableToken.align}
                        rows={tableToken.rows.map((row) =>
                            row.map((cell) =>
                                typeof cell === "string"
                                    ? cell
                                    : parseTokens(cell.tokens || []),
                            ),
                        )}
                    />,
                );
                break;
            }
            case "html":
                output.push(<CustomHtmlBlock key={i} content={token.text}/>);
                break;
            case "def":
            case "space":
                break;
            case "strong":
                output.push(
                    <CustomStrong key={i}>
                        {parseTokens(token.tokens || [])}
                    </CustomStrong>,
                );
                break;
            case "em":
                output.push(
                    <CustomEm key={i}>
                        {token.tokens ? parseTokens(token.tokens) : token.text}
                    </CustomEm>,
                );
                break;

            case "codespan":
                output.push(<CustomCodeSpan key={i} code={token.text}/>);
                break;

            case "link":
                output.push(
                    <CustomLink key={i} href={token.href} title={token.title}>
                        {token.tokens ? parseTokens(token.tokens) : token.text}
                    </CustomLink>,
                );
                break;

            case "image":
                output.push(
                    <CustomImage
                        key={i}
                        href={token.href}
                        title={token.title}
                        text={token.text}
                    />,
                );
                break;

            case "text": {
                const parsedContent = token.tokens
                    ? parseTokens(token.tokens)
                    : token.text;

                if (blockquoteContent.length > 0) {
                    blockquoteContent.push(
                        <React.Fragment key={i}>{parsedContent}</React.Fragment>,
                    );
                } else {
                    output.push(<CustomText key={i} text={parsedContent}/>);
                }
                break;
            }

            default:
                console.warn("Unhandled token type:", token.type, token);
        }
    });

    return output;
}

export function renderMarkdown(markdown: string): JSX.Element[] {
    marked.setOptions({
        breaks: true,
        gfm: true,
        silent: false,
        async: true,
    });

    const tokens = marked.lexer(markdown);
    return parseTokens(tokens);
}
