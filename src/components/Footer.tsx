import { Flex, Text } from "@radix-ui/themes";
import { usePublicInfo } from "@/contexts/PublicInfoContext";

const Footer = () => {
  const { publicInfo } = usePublicInfo();
  const customFooterHtml = publicInfo?.theme_settings?.customFooterHtml || "";

  return (
    <div className="footer p-2 border-t-1 border-t-[var(--gray-7)]">
      {customFooterHtml ? (
        <Text
          size="1"
          color="gray"
          className="flex flex-col justify-center items-center"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: customFooterHtml,
            }}
          ></span>
          <Text size="2" color="gray">
            Powered by Komari Monitor
          </Text>
          <Text size="2" color="gray">
            主题-Taca-TF
          </Text>
        </Text>
      ) : (
        <Flex
          direction={{ initial: "column", md: "row" }}
          justify="between"
          align={{ initial: "center", md: "start" }}
          gap="4"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <Flex direction="column" gap="2" align={{ initial: "center", md: "start" }}>
            <Text size="2" color="gray">
              Powered by Komari Monitor
            </Text>
            <Text size="2" color="gray">
              主题-Taca-TF
            </Text>
          </Flex>
        </Flex>
      )}
    </div>
  );
};

export default Footer;
