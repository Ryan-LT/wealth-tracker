import type { Messages } from "../en";

export const auth: Messages["auth"] = {
  login: {
    title: "Đăng nhập",
    description: "Nhập thông tin đăng nhập để tiếp tục.",
    username: "Tên đăng nhập hoặc email",
    password: "Mật khẩu",
    submit: "Đăng nhập",
    submitting: "Đang đăng nhập…",
    newHere: "Bạn mới đến?",
    createAccount: "Tạo tài khoản",
  },
  register: {
    pageTitle: "Tạo tài khoản",
    title: "Tạo tài khoản",
    description: "Tài khoản của bạn bắt đầu trống và chỉ bạn mới xem được dữ liệu của nó.",
    username: "Tên đăng nhập",
    usernameHint: "Bạn dùng tên này để đăng nhập. 3–32 chữ cái hoặc chữ số.",
    displayName: "Tên (không bắt buộc)",
    email: "Email (không bắt buộc)",
    emailHint: "Giúp bạn đăng nhập bằng email.",
    password: "Mật khẩu",
    passwordHint: (p) => `Tối thiểu ${p.min} ký tự.`,
    confirm: "Xác nhận mật khẩu",
    submit: "Tạo tài khoản",
    submitting: "Đang tạo tài khoản…",
    haveAccount: "Đã có tài khoản?",
    signIn: "Đăng nhập",
  },
  offline: {
    title: "Bạn đang ngoại tuyến",
    body: "Trang này chưa được lưu để dùng ngoại tuyến. Các trang bạn đã mở trước đó vẫn hoạt động — dữ liệu được giữ trên thiết bị này và sẽ đồng bộ khi bạn kết nối lại.",
    openDashboard: "Mở trang Tổng quan",
  },
  pageError: {
    title: "Trang này gặp lỗi",
    fallback: "Đã xảy ra lỗi khi hiển thị trang này. Dữ liệu của bạn vẫn an toàn.",
    retry: "Thử lại",
  },
};
