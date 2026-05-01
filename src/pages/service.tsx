import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useNodeList } from "@/contexts/NodeListContext";
import MiniPingChart from "@/components/MiniPingChart";
import { useIsMobile } from "@/hooks/use-mobile";

const ranges = [
  { key: "1h", hours: 1 },
  { key: "6h", hours: 6 },
  { key: "12h", hours: 12 },
  { key: "24h", hours: 24 },
  { key: "7d", hours: 24 * 7 },
  { key: "30d", hours: 24 * 30 },
];

const ServicePage = () => {
  const [t] = useTranslation();
  const isMobile = useIsMobile();
  const { nodeList } = useNodeList();
  const nodes = nodeList ?? [];
  const [selectedUuid, setSelectedUuid] = useState<string>("");
  const [selectedRange, setSelectedRange] = useState<"1h" | "6h" | "12h" | "24h" | "7d" | "30d">("24h");
  const [leftWidth, setLeftWidth] = useState(320);
  const draggingRef = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedUuid && nodes.length > 0) {
      setSelectedUuid(nodes[0].uuid);
    }
  }, [nodes, selectedUuid]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.uuid === selectedUuid),
    [nodes, selectedUuid],
  );

  const chartHours = useMemo(
    () => ranges.find((r) => r.key === selectedRange)?.hours ?? 24,
    [selectedRange],
  );

  const onStartDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;

    const onMove = (ev: MouseEvent) => {
      if (!draggingRef.current || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const raw = ev.clientX - rect.left;
      const min = 240;
      const max = Math.max(380, rect.width - 420);
      const next = Math.max(min, Math.min(max, raw));
      setLeftWidth(next);
    };

    const onUp = () => {
      draggingRef.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  if (isMobile) {
    return (
      <div className="angel-home" style={{ paddingBottom: 16 }}>
        <Card className="service-mobile-panel">
          <div className="service-mobile-top-row">
            <div className="service-mobile-scroll">
              {nodes.map((node) => (
                <button
                  key={node.uuid}
                  className={`service-mobile-chip ${node.uuid === selectedUuid ? "active" : ""}`}
                  onClick={() => setSelectedUuid(node.uuid)}
                >
                  {node.name}
                </button>
              ))}
            </div>
          </div>

          <Flex justify="between" align="center" mt="2" mb="2" gap="2" wrap="wrap">
            <Text size="2" weight="bold">{selectedNode?.name ?? "-"}</Text>
            <Flex gap="1">
              {ranges.map((r) => (
                <Button
                  key={r.key}
                  size="1"
                  variant={selectedRange === r.key ? "solid" : "soft"}
                  onClick={() => setSelectedRange(r.key as "1h" | "6h" | "12h" | "24h" | "7d" | "30d")}
                >
                  {r.key}
                </Button>
              ))}
            </Flex>
          </Flex>

          {selectedUuid ? (
            <MiniPingChart uuid={selectedUuid} height={420} hours={chartHours} />
          ) : (
            <div className="py-10 text-center text-muted-foreground">{t("common.select")}</div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="angel-home" style={{ paddingBottom: 16 }}>
      <div ref={wrapRef} className="service-split-wrap">
        <Card className="service-left-panel" style={{ width: leftWidth }}>
          <Text size="3" weight="bold" className="mb-2 block">
            {t("common.serverList", { defaultValue: "Server List" })}
          </Text>
          <div className="service-node-list">
            {nodes.map((node) => (
              <button
                key={node.uuid}
                className={`service-node-item ${node.uuid === selectedUuid ? "active" : ""}`}
                onClick={() => setSelectedUuid(node.uuid)}
              >
                {node.name}
              </button>
            ))}
          </div>
        </Card>

        <div className="service-divider" onMouseDown={onStartDrag} />

        <Card className="service-right-panel">
          <Flex justify="between" align="center" mb="2" wrap="wrap" gap="2">
            <Text size="3" weight="bold">{selectedNode?.name ?? "-"}</Text>
            <Flex gap="1">
              {ranges.map((r) => (
                <Button
                  key={r.key}
                  size="1"
                  variant={selectedRange === r.key ? "solid" : "soft"}
                  onClick={() => setSelectedRange(r.key as "1h" | "6h" | "12h" | "24h" | "7d" | "30d")}
                >
                  {r.key}
                </Button>
              ))}
            </Flex>
          </Flex>
          {selectedUuid ? (
            <MiniPingChart uuid={selectedUuid} height={560} hours={chartHours} />
          ) : (
            <div className="py-10 text-center text-muted-foreground">{t("common.select")}</div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ServicePage;
