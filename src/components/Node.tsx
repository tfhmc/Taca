import React from "react";
import { Card, Flex, IconButton, Separator, Text } from "@radix-ui/themes";
import type { LiveData, Record } from "../types/LiveData";
import Flag from "./Flag";
import { useTranslation } from "react-i18next";
import Tips from "./ui/tips";
import { formatBytes } from "@/utils/unitHelper";
import { Box } from "@radix-ui/themes";
import type { TFunction } from "i18next";
import { Link } from "react-router-dom";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import { Cpu, HardDrive, Info, MemoryStick } from "lucide-react";
import { usePublicInfo } from "@/contexts/PublicInfoContext";
import { getOSImage } from "@/utils";

export function formatUptime(seconds: number, t: TFunction): string {
  if (!seconds || seconds < 0) return t("nodeCard.time_second", { val: 0 });
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d} ${t("nodeCard.time_day")}`;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface NodeProps {
  basic: NodeBasicInfo;
  live: Record | undefined;
  online: boolean;
}

const PercentBar = ({ label, value }: { label: string; value: number }) => {
  const safe = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const barClass = safe >= 80 ? "hot" : safe >= 50 ? "warm" : "cool";
  const displayWidth = safe <= 0 ? 14 : Math.max(safe, 14);

  return (
    <div className="angel-row">
      <div className="angel-row-label">{label}</div>
      <div className="angel-bar-track">
        <div className={`angel-bar-fill ${barClass}`} style={{ width: `${displayWidth}%` }}>
          <span className="angel-bar-pill">{Math.round(safe)}%</span>
        </div>
      </div>
    </div>
  );
};

const TextRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="angel-row text-row">
    <div className="angel-row-label">{label}</div>
    <div className="angel-row-text">{children}</div>
  </div>
);

const Node = React.memo(({ basic, live, online }: NodeProps) => {
  const [t] = useTranslation();
  const defaultLive = {
    cpu: { usage: 0 },
    ram: { used: 0 },
    swap: { used: 0 },
    disk: { used: 0 },
    network: { up: 0, down: 0, totalUp: 0, totalDown: 0 },
    uptime: 0,
    message: "",
  } as Record;

  const liveData = live || defaultLive;

  const memPercent = basic.mem_total ? (liveData.ram.used / basic.mem_total) * 100 : 0;
  const swapPercent = basic.swap_total ? (liveData.swap.used / basic.swap_total) * 100 : 0;
  const diskPercent = basic.disk_total ? (liveData.disk.used / basic.disk_total) * 100 : 0;

  const uploadSpeed = formatBytes(liveData.network.up);
  const downloadSpeed = formatBytes(liveData.network.down);
  const totalUpload = formatBytes(liveData.network.totalUp);
  const totalDownload = formatBytes(liveData.network.totalDown);

  const getTrafficUsed = () => {
    const up = liveData.network.totalUp || 0;
    const down = liveData.network.totalDown || 0;
    switch (basic.traffic_limit_type) {
      case "up":
        return up;
      case "down":
        return down;
      case "max":
        return Math.max(up, down);
      case "min":
        return Math.min(up, down);
      case "sum":
      default:
        return up + down;
    }
  };

  const trafficUsed = getTrafficUsed();
  const trafficRemaining =
    basic.traffic_limit > 0 ? Math.max(0, basic.traffic_limit - trafficUsed) : 0;

  const formatCycle = (days: number) => {
    if (days === -1) return t("billing.once", { defaultValue: "一次性" });
    if (days === 30) return t("billing.month", { defaultValue: "月" });
    if (days === 365) return t("billing.year", { defaultValue: "年" });
    if (days === 7) return t("billing.week", { defaultValue: "周" });
    if (days > 0) return t("billing.days", { val: days, defaultValue: `${days}天` });
    return t("billing.once", { defaultValue: "一次性" });
  };

  const formatPrice = () => {
    if (basic.price < 0) return t("billing.free", { defaultValue: "免费" });
    if (basic.price === 0) return "";
    const cycleText = formatCycle(basic.billing_cycle);
    const currencyRaw = (basic.currency || "").toUpperCase();
    const currencySymbol =
      currencyRaw === "CNY" || currencyRaw === "RMB"
        ? "元"
        : currencyRaw === "USD"
          ? "$"
          : currencyRaw === "EUR"
            ? "€"
            : basic.currency || "元";

    if (currencySymbol === "元") {
      return `${basic.price}${currencySymbol}/${cycleText}`;
    }
    return `${currencySymbol}${basic.price}/${cycleText}`;
  };

  const getRemainingDays = () => {
    if (!basic.expired_at) return "";
    const expire = new Date(basic.expired_at).getTime();
    if (Number.isNaN(expire)) return "";
    const now = Date.now();
    const days = Math.ceil((expire - now) / (1000 * 60 * 60 * 24));
    if (days >= 36500) return t("billing.permanent", { defaultValue: "永久" });
    if (days >= 0) {
      return t("billing.remaining_days", {
        days: new Intl.NumberFormat().format(days),
        defaultValue: `剩余${days}天`,
      });
    }
    return t("billing.expired", { defaultValue: "已到期" });
  };

  const priceText = formatPrice();
  const remainingDays = getRemainingDays();
  const formatCapacity = (bytes: number) => {
    const gb = bytes / 1024 / 1024 / 1024;
    if (gb >= 1) return `${gb < 10 ? gb.toFixed(1) : Math.round(gb)}GB`;
    const mb = bytes / 1024 / 1024;
    if (mb >= 1) return `${Math.round(mb)}MB`;
    return formatBytes(bytes);
  };

  return (
    <Card id={basic.uuid} className="node-card angel-node-card">
      <Flex direction="column" gap="2">
        <Flex justify="between" align="center" className="angel-card-header">
          <Flex align="center" gap="2" style={{ minWidth: 0 }}>
            <img
              src={getOSImage(basic.os)}
              alt={basic.os}
              title={basic.os}
              className="w-5 h-5"
            />
            <Flag flag={basic.region} />
            <Link to={`/instance/${basic.uuid}`} className="angel-node-title-link">
              <Text weight="bold" size="6" className="angel-node-title" truncate>
                {basic.name}
              </Text>
            </Link>
          </Flex>
          <Flex gap="2" align="center">
            {live?.message && <Tips color="#CE282E">{live.message}</Tips>}
            <Tips
              mode="popup"
              side="left"
              trigger={
                <IconButton variant="ghost" size="1" className="angel-info-btn">
                  <Info size={14} />
                </IconButton>
              }
            >
              <div className="space-y-1 text-xs">
                <div><b>OS</b>: {basic.os} / {basic.arch}</div>
                <div><b>CPU</b>: {basic.cpu_name || "-"}</div>
                <div><b>GPU</b>: {basic.gpu_name || "-"}</div>
                <div><b>Virt</b>: {basic.virtualization || "-"}</div>
                <div>
                  <b>Traffic Limit</b>:{" "}
                  {basic.traffic_limit > 0
                    ? `${formatBytes(trafficRemaining)} / ${formatBytes(basic.traffic_limit)} (${basic.traffic_limit_type ?? "sum"})`
                    : "-"}
                </div>
                <div><b>Load</b>: {liveData.load?.load1?.toFixed?.(2) ?? "0.00"} / {liveData.load?.load5?.toFixed?.(2) ?? "0.00"} / {liveData.load?.load15?.toFixed?.(2) ?? "0.00"}</div>
                <div><b>Conn</b>: TCP {liveData.connections?.tcp ?? 0} / UDP {liveData.connections?.udp ?? 0}</div>
                <div><b>Proc</b>: {liveData.process ?? 0}</div>
              </div>
            </Tips>
          </Flex>
        </Flex>

        <Separator size="4" className="angel-card-separator" />

        <div className="angel-card-body">
          <PercentBar label="CPU" value={liveData.cpu.usage} />
          <PercentBar label={t("nodeCard.ram")} value={memPercent} />
          <PercentBar label={t("nodeCard.swap")} value={swapPercent} />

          <TextRow label={t("nodeCard.networkSpeed")}>
            <span className="net-down">↓ {downloadSpeed}/s</span>
            <span className="net-up">↑ {uploadSpeed}/s</span>
          </TextRow>

          <TextRow label={t("nodeCard.totalTraffic")}>
            <span className="traffic-down">⬇ {totalDownload}</span>
            <span className="traffic-up">⬆ {totalUpload}</span>
          </TextRow>

          <PercentBar label={t("nodeCard.disk")} value={diskPercent} />

          <TextRow label={t("nodeCard.info", { defaultValue: "Info" })}>
            <span className="i cpu"><Cpu size={14} /> {basic.cpu_cores} Core</span>
            <span className="i mem"><MemoryStick size={14} /> {formatCapacity(basic.mem_total)}</span>
            <span className="i disk"><HardDrive size={14} /> {formatCapacity(basic.disk_total)}</span>
          </TextRow>

          <TextRow label={t("nodeCard.online")}>
            <span>◔ {online ? formatUptime(liveData.uptime, t) : "-"}</span>
            {priceText && <span>· {priceText}</span>}
            {remainingDays && <span>· {remainingDays}</span>}
          </TextRow>
        </div>
      </Flex>
    </Card>
  );
});

export default Node;

type NodeGridProps = {
  nodes: NodeBasicInfo[];
  liveData: LiveData;
};

export const NodeGrid = ({ nodes, liveData }: NodeGridProps) => {
  const { publicInfo } = usePublicInfo();
  const offlineServerPosition = publicInfo?.theme_settings?.offlineServerPosition;
  const onlineNodes = liveData?.online || [];

  const sortedNodes = [...nodes].sort((a, b) => {
    const aIsOnline = onlineNodes.includes(a.uuid);
    const bIsOnline = onlineNodes.includes(b.uuid);

    if (offlineServerPosition === "First") {
      if (!aIsOnline && bIsOnline) return -1;
      if (aIsOnline && !bIsOnline) return 1;
    } else if (offlineServerPosition !== "Keep") {
      if (aIsOnline && !bIsOnline) return -1;
      if (!aIsOnline && bIsOnline) return 1;
    }

    return a.weight - b.weight;
  });

  return (
    <Box
      className="angel-grid-wrap"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "22px",
        width: "100%",
      }}
    >
      {sortedNodes.map((node) => {
        const isOnline = onlineNodes.includes(node.uuid);
        const nodeData = liveData?.data ? liveData.data[node.uuid] : undefined;

        return <Node key={node.uuid} basic={node} live={nodeData} online={isOnline} />;
      })}
    </Box>
  );
};
