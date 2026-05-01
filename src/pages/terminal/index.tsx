import { useEffect, useMemo, useState } from "react";
import { Button, Card, Flex, Popover, Select, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import MiniPingChart from "@/components/MiniPingChart";
import { useRPC2Call } from "@/contexts/RPC2Context";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";

const TerminalPage = () => {
  const [t] = useTranslation();
  const { call } = useRPC2Call();
  const [nodes, setNodes] = useState<NodeBasicInfo[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await call<any, Record<string, any>>("common:getNodes");
        const list: NodeBasicInfo[] = Object.values(result || {}).map((n: any) => ({
          uuid: n.uuid,
          name: n.name,
          cpu_name: n.cpu_name,
          virtualization: n.virtualization,
          arch: n.arch,
          cpu_cores: n.cpu_cores,
          os: n.os,
          kernel_version: n.kernel_version,
          gpu_name: n.gpu_name,
          region: n.region,
          mem_total: n.mem_total,
          swap_total: n.swap_total,
          disk_total: n.disk_total,
          version: n.version ?? "",
          weight: n.weight ?? 0,
          price: n.price ?? 0,
          tags: n.tags ?? "",
          billing_cycle: n.billing_cycle ?? 0,
          currency: n.currency ?? "",
          group: n.group ?? "",
          traffic_limit: n.traffic_limit ?? 0,
          traffic_limit_type: n.traffic_limit_type,
          expired_at: n.expired_at ?? "",
          created_at: n.created_at ?? "",
          updated_at: n.updated_at ?? "",
          ipv4: n.ipv4,
          ipv6: n.ipv6,
        }));
        setNodes(list);
        if (list.length > 0) setSelected(list[0].uuid);
      } catch {
        setNodes([]);
      }
    })();
  }, [call]);

  const selectedName = useMemo(
    () => nodes.find((n) => n.uuid === selected)?.name ?? "-",
    [nodes, selected],
  );

  return (
    <div className="angel-home" style={{ paddingTop: 10 }}>
      <Card style={{ padding: 16 }}>
        <Flex align="center" gap="3" wrap="wrap">
          <Text size="3" weight="bold">{t("common.services", { defaultValue: "Services" })}</Text>
          <Select.Root value={selected} onValueChange={setSelected}>
            <Select.Trigger placeholder={t("common.select")} style={{ minWidth: 260 }} />
            <Select.Content>
              {nodes.map((n) => (
                <Select.Item key={n.uuid} value={n.uuid}>{n.name}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger>
              <Button disabled={!selected}>{t("nodeCard.ping", { defaultValue: "Latency" })}</Button>
            </Popover.Trigger>
            <Popover.Content width="780px" side="bottom" align="start">
              <div style={{ marginBottom: 8, fontWeight: 600 }}>
                {selectedName} - {t("nodeCard.ping", { defaultValue: "Latency" })}
              </div>
              {selected ? <MiniPingChart uuid={selected} height={360} hours={24} /> : null}
            </Popover.Content>
          </Popover.Root>
        </Flex>
      </Card>
    </div>
  );
};

export default TerminalPage;
