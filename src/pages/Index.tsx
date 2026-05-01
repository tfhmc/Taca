import React, { Suspense, useMemo } from "react";
import { useLiveData } from "../contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";
import Loading from "@/components/loading";
const NodeDisplay = React.lazy(() => import("../components/NodeDisplay"));

const Index = () => {
  const { live_data } = useLiveData();
  const { nodeList, isLoading, error, refresh } = useNodeList();

  React.useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const groups = useMemo(() => {
    const list = nodeList || [];
    const map = new Map<string, typeof list>();
    list.forEach((node) => {
      const k = node.group?.trim() || "Asia";
      const arr = map.get(k) || [];
      arr.push(node);
      map.set(k, arr);
    });
    return Array.from(map.entries());
  }, [nodeList]);

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="angel-home">
      {groups.map(([groupName, groupNodes]) => (
        <section key={groupName} className="angel-group-block">
          <Suspense fallback={null}>
            <NodeDisplay
              nodes={groupNodes}
              liveData={live_data?.data ?? { online: [], data: {} }}
            />
          </Suspense>
        </section>
      ))}
    </div>
  );
};

export default Index;
