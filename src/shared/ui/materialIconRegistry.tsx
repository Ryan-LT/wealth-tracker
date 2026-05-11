"use client";

import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import AccountBalance from "@mui/icons-material/AccountBalance";
import AccountBalanceOutlined from "@mui/icons-material/AccountBalanceOutlined";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceWalletOutlined from "@mui/icons-material/AccountBalanceWalletOutlined";
import AccountCircle from "@mui/icons-material/AccountCircle";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import Add from "@mui/icons-material/Add";
import Apartment from "@mui/icons-material/Apartment";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircle from "@mui/icons-material/CheckCircle";
import CreditCard from "@mui/icons-material/CreditCard";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import CurrencyExchange from "@mui/icons-material/CurrencyExchange";
import Dashboard from "@mui/icons-material/Dashboard";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import Delete from "@mui/icons-material/Delete";
import Download from "@mui/icons-material/Download";
import Edit from "@mui/icons-material/Edit";
import ErrorIcon from "@mui/icons-material/Error";
import Event from "@mui/icons-material/Event";
import EventOutlined from "@mui/icons-material/EventOutlined";
import Handshake from "@mui/icons-material/Handshake";
import HelpOutlineOutlined from "@mui/icons-material/HelpOutlineOutlined";
import HelpOutlined from "@mui/icons-material/HelpOutlined";
import Home from "@mui/icons-material/Home";
import Insights from "@mui/icons-material/Insights";
import InsightsOutlined from "@mui/icons-material/InsightsOutlined";
import MoneyOff from "@mui/icons-material/MoneyOff";
import Notifications from "@mui/icons-material/Notifications";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import Payments from "@mui/icons-material/Payments";
import Percent from "@mui/icons-material/Percent";
import ReceiptLong from "@mui/icons-material/ReceiptLong";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import Savings from "@mui/icons-material/Savings";
import SavingsOutlined from "@mui/icons-material/SavingsOutlined";
import Search from "@mui/icons-material/Search";
import Settings from "@mui/icons-material/Settings";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import ShowChart from "@mui/icons-material/ShowChart";
import TrendingDown from "@mui/icons-material/TrendingDown";
import TrendingUp from "@mui/icons-material/TrendingUp";
import Work from "@mui/icons-material/Work";
import WorkOutlined from "@mui/icons-material/WorkOutlined";

export type MuiBackedIcon = ComponentType<SvgIconProps>;

type IconPair = { filled: MuiBackedIcon; outlined?: MuiBackedIcon };

const REGISTRY: Record<string, IconPair> = {
  account_balance: { filled: AccountBalance, outlined: AccountBalanceOutlined },
  account_balance_wallet: {
    filled: AccountBalanceWallet,
    outlined: AccountBalanceWalletOutlined,
  },
  account_circle: { filled: AccountCircle, outlined: AccountCircleOutlined },
  add: { filled: Add },
  apartment: { filled: Apartment },
  calendar_month: {
    filled: CalendarMonth,
    outlined: CalendarMonthOutlined,
  },
  check_circle: { filled: CheckCircle },
  credit_card: { filled: CreditCard, outlined: CreditCardOutlined },
  currency_exchange: { filled: CurrencyExchange },
  dashboard: { filled: Dashboard, outlined: DashboardOutlined },
  delete: { filled: Delete },
  download: { filled: Download },
  edit: { filled: Edit },
  error: { filled: ErrorIcon },
  event: { filled: Event, outlined: EventOutlined },
  handshake: { filled: Handshake },
  help_outline: { filled: HelpOutlineOutlined, outlined: HelpOutlined },
  home: { filled: Home },
  insights: { filled: Insights, outlined: InsightsOutlined },
  money_off: { filled: MoneyOff },
  notifications: {
    filled: Notifications,
    outlined: NotificationsOutlined,
  },
  payments: { filled: Payments },
  percent: { filled: Percent },
  receipt_long: { filled: ReceiptLong, outlined: ReceiptLongOutlined },
  savings: { filled: Savings, outlined: SavingsOutlined },
  search: { filled: Search },
  settings: { filled: Settings, outlined: SettingsOutlined },
  show_chart: { filled: ShowChart },
  trending_down: { filled: TrendingDown },
  trending_up: { filled: TrendingUp },
  work: { filled: Work, outlined: WorkOutlined },
};

export function resolveSymbolIcon(name: string, useOutlined: boolean): MuiBackedIcon {
  const pair = REGISTRY[name];
  if (!pair) {
    return HelpOutlined;
  }
  if (useOutlined && pair.outlined) {
    return pair.outlined;
  }
  return pair.filled;
}
