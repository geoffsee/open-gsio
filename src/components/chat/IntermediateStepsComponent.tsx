import React from "react";
import { observer } from "mobx-react-lite";
import clientChatStore from "../../stores/ClientChatStore";

export const IntermediateStepsComponent = observer(({ hidden }) => {
  return (
    <div hidden={hidden}>
      {clientChatStore.intermediateSteps.map((step, index) => {
        switch (step.kind) {
          case "web-search": {
            return <WebSearchResult key={index} data={step.data} />;
          }
          case "tool-result":
            return <ToolResult key={index} data={step.data} />;
          default:
            return <GenericStep key={index} data={step.data} />;
        }
      })}
    </div>
  );
});

const WebSearchResult = () => {
  return (
    <div>
      {/*{webResults?.map(r => <Box>*/}
      {/*    <Text>{r.title}</Text>*/}
      {/*    <Text>{r.url}</Text>*/}
      {/*    <Text>{r.snippet}</Text>*/}
      {/*</Box>)}*/}
    </div>
  );
};

export const ToolResult = ({ data }) => {
  return (
    <div className="tool-result">
      <h3>Tool Result</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export const GenericStep = ({ data }) => {
  return (
    <div className="generic-step">
      <h3>Generic Step</h3>
      <p>{data.description || "No additional information provided."}</p>
    </div>
  );
};
