export {
  INCOME_SOURCES_SEED,
  type IncomeSource,
  type IncomeSourceKind,
} from "@/entities/income/model";
export {
  monthlyIncomeByKind,
  totalMonthlyIncomeFromSources,
} from "@/entities/income/lib/totals";
export {
  totalCapitalAmount,
  wrapIncomeSourceAsProfile,
} from "@/entities/income/lib/wrap-as-profile";
