import * as React from 'react';

function ControlPanel() {
  return (
    <div className="control-panel">
      <p>
        Data source:{' '}
        <a href="https://en.wikipedia.org/wiki/List_of_United_States_cities_by_population">
          Wikipedia
        </a>
      </p>
      <div className="source-link">
        <a
          href="https://github.com/visgl/react-map-gl/tree/8.0-release/examples/mapbox/controls"
          target="_new"
        >
          View Code ↗
        </a>
      </div>
    </div>
  );
}

export default React.memo(ControlPanel);
