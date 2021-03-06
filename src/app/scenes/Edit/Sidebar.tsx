import * as React from "react";
import { BORDER_COLOR, SIDEBAR_WIDTH } from "../../constants";
import { useRooms } from "./hooks/rooms";

import { Separator } from "../../components";
import { RoomsList } from "./RoomsList";

export function Sidebar(props: {}): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        top: 0,
        width: SIDEBAR_WIDTH,
        cursor: "pointer",
        borderRight: `2px solid ${BORDER_COLOR}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <SidebarHeader />
      <Separator />
      <RoomsList />
    </div>
  );
}

function SidebarHeader(props: {}): React.ReactElement {
  const { saveRooms, loadRooms } = useRooms();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      const rawJSON = event.target.result;
      const parsedJSON = JSON.parse(rawJSON);
      loadRooms(parsedJSON);
    });
    reader.readAsText(file);
  };

  return (
    <div>
      <h1
        style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Editor
      </h1>
      <Separator />
      <div style={{ display: "flex", flexDirection: "column", margin: 8 }}>
        {/* Load */}
        <p style={{ fontWeight: "bold" }}>Load:</p>
        <input type="file" accept="application/json" onChange={onFileChange} />

        {/* Save */}
        <p style={{ marginTop: 8, fontWeight: "bold" }}>Save:</p>
        <input type="button" value="Save file" onClick={saveRooms} />
      </div>
    </div>
  );
}
