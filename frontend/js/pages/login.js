const form = document.getElementById("loginForm");
const accountInput = document.getElementById("account");
const passwordInput = document.getElementById("password");
const feedback = document.getElementById("loginFeedback");

if (form && accountInput && passwordInput && feedback) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const accountValue = accountInput.value.trim();
    const passwordValue = passwordInput.value;

    if (!accountValue || !passwordValue) {
      feedback.textContent = "請先完整填寫帳號與密碼欄位。";
      return;
    }

    feedback.textContent =
      "目前尚未串接後端驗證，本階段僅提供前端展示。請使用「進入展示模式」查看功能頁。";
  });
}