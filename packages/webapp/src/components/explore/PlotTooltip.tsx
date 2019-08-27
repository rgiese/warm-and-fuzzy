import React from "react";
import { Segment, Header, Grid } from "semantic-ui-react";
import { CustomTooltip } from "./NivoMissingDefinitions";

const PlotTooltip: CustomTooltip = ({ node }): React.ReactElement => {
  return (
    <Segment size="small" style={{ borderTop: `2px solid ${node.style.color}` }}>
      <Header size="small">{node.data.serieId}</Header>
      <Grid columns={2} divided>
        <Grid.Row>
          <Grid.Column>Time: {node.data.formattedX}</Grid.Column>
          <Grid.Column>{node.data.formattedY} &deg;C</Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  );
};

export default PlotTooltip;
