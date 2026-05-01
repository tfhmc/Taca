import React from "react";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import type { LiveData } from "../types/LiveData";
import { NodeGrid } from "./Node";
import "./NodeDisplay.css";

interface NodeDisplayProps {
  nodes: NodeBasicInfo[];
  liveData: LiveData;
}

const NodeDisplay: React.FC<NodeDisplayProps> = ({ nodes, liveData }) => {
  return (
    <div className="w-full">
      <NodeGrid nodes={nodes} liveData={liveData} />
    </div>
  );
};

export default NodeDisplay;
