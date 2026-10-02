import type { Messages } from "../en";

export const nav: Messages["nav"] = {
  groups: {
    overview: "Tổng quan",
    planning: "Kế hoạch",
    records: "Hồ sơ",
    system: "Hệ thống",
  },
  items: {
    dashboard: { label: "Tổng quan", short: "Trang chủ", description: "Tài sản ròng, dòng tiền và tình trạng mục tiêu trong nháy mắt" },
    goals: { label: "Mục tiêu", short: "Mục tiêu", description: "Kế hoạch mục tiêu, dự phóng và các mốc thanh toán" },
    allocations: { label: "Thanh khoản", short: "Thanh khoản", description: "Tài sản đang được phân bổ cho các kế hoạch ra sao" },
    assets: { label: "Tài sản", short: "Tài sản", description: "Mọi thứ bạn sở hữu và tốc độ bạn có thể dùng đến" },
    income: { label: "Thu nhập & chi tiêu", short: "Thu nhập", description: "Các nguồn thu nhập và chi tiêu trung bình hằng tháng" },
    debts: { label: "Khoản nợ", short: "Khoản nợ", description: "Khoản vay, thẻ tín dụng và các nghĩa vụ khác" },
    loans: { label: "Khoản vay cá nhân", short: "Cho vay", description: "Tiền cho người khác vay hoặc vay của người khác" },
    settings: { label: "Cài đặt", short: "Cài đặt", description: "Giao diện, đồng bộ và phiên đăng nhập" },
  },
  quickAdd: {
    asset: { label: "Thêm tài sản", short: "Tài sản", keywords: "tạo mới tài sản create new asset" },
    income: { label: "Thêm nguồn thu nhập", short: "Thu nhập", keywords: "tạo mới thu nhập lương create new income salary" },
    debt: { label: "Thêm khoản nợ", short: "Khoản nợ", keywords: "tạo mới khoản nợ vay create new debt loan" },
    loan: { label: "Thêm khoản vay cá nhân", short: "Cho vay", keywords: "tạo mới cho vay đi vay create lend borrow" },
    plan: { label: "Kế hoạch mục tiêu mới", short: "Kế hoạch", keywords: "tạo mới kế hoạch mục tiêu create goal plan" },
  },
};
