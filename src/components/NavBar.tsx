import ThemeSwitch from "./ThemeSwitch";
import LanguageSwitch from "./Language";
import LoginDialog from "./Login";
import { IconButton } from "@radix-ui/themes";
import { Link, useLocation } from "react-router-dom";
import { usePublicInfo } from "@/contexts/PublicInfoContext";
import { useTranslation } from "react-i18next";
import { Home, Rss } from "lucide-react";
import { SunIcon } from "@radix-ui/react-icons";

const NavBar = () => {
  const { publicInfo } = usePublicInfo();
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { to: "/", label: t("common.home"), icon: Home },
    {
      to: "/service",
      label: t("common.network", { defaultValue: "网络" }),
      icon: Rss,
    },
  ];

  return (
    <nav className="angel-topbar">
      <div className="angel-topbar-left">
        <div className="angel-menu-tabs">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={`angel-menu-item ${active ? "is-active" : ""}`}>
                <Icon size={14} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="angel-topbar-right">
        <ThemeSwitch
          icon={
            <IconButton variant="soft" className="angel-top-btn">
              <SunIcon />
            </IconButton>
          }
        />
        <LanguageSwitch
          icon={
            <IconButton variant="soft" className="angel-top-btn">
              <span className="text-xs font-semibold">A/中</span>
            </IconButton>
          }
        />

        {publicInfo?.private_site && !document.cookie.includes("temp_key") ? (
          <LoginDialog
            trigger={<button className="angel-login-btn">{t("login.title", { defaultValue: "登录" })}</button>}
            autoOpen={publicInfo?.private_site && !document.cookie.includes("temp_key")}
            info={t("common.private_site")}
            onLoginSuccess={() => {
              window.location.reload();
            }}
          />
        ) : (
          <LoginDialog trigger={<button className="angel-login-btn">{t("login.title", { defaultValue: "登录" })}</button>} />
        )}
      </div>
    </nav>
  );
};

export default NavBar;
