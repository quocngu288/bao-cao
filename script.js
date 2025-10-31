// Dữ liệu doanh thu
const revenueData = {
  "Quy Nhơn": {
    "Tháng 8": 336223500,
    "Tháng 9": 290326986,
    "Tháng 10": 195631972,
  },
  "Quảng Ngãi": {
    "Tháng 8": 257725000,
    "Tháng 9": 228070000,
    "Tháng 10": 188408000,
  },
  "Kon Tum": {
    "Tháng 7": 105418000,
    "Tháng 8": 144504000,
    "Tháng 9": 110343000,
    "Tháng 10": 82177000,
  },
};

// Tính toán lợi nhuận tự động
function calculateProfit() {
  const profitElements = document.querySelectorAll(".profit");

  profitElements.forEach((element) => {
    const row = element.closest("tr");

    // Lấy doanh thu từ data attribute hoặc từ ô revenue
    const revenueText = row.querySelector(".revenue")?.textContent || "";
    const revenue =
      parseInt(revenueText.replace(/[^\d]/g, "")) ||
      parseInt(element.dataset.revenue) ||
      0;

    // Lấy mặt bằng từ cột thứ 3 (index 2)
    const rentCell = row.querySelectorAll("td")[2];
    const rentText = rentCell?.textContent || "";
    let rent = 0;
    if (rentText.includes("phòng")) {
      // Nếu là "4 phòng", giả sử giá trị mặc định hoặc tính theo số phòng
      const roomCount = parseInt(rentText.match(/\d+/)?.[0] || "0");
      rent = roomCount * 5000000; // Giả sử mỗi phòng 5 triệu
    } else {
      rent = parseInt(rentText.replace(/[^\d]/g, "")) || 0;
    }

    // Lấy nhân viên từ cột staff-cost
    const staffCell = row.querySelector(".staff-cost");
    const staffText = staffCell?.textContent || "";
    const staff = parseInt(staffText.replace(/[^\d]/g, "")) || 0;

    // Tính tổng chi phí = mặt bằng + nhân viên
    const totalCosts = rent + staff;

    // Tính lợi nhuận = doanh thu - chi phí
    const profit = revenue - totalCosts;

    // Cập nhật giá trị lợi nhuận
    element.textContent = formatCurrency(profit);

    // Cập nhật data attributes để tính tổng sau này
    element.dataset.revenue = revenue;
    element.dataset.costs = totalCosts;

    // Thêm class màu sắc dựa trên lợi nhuận
    element.classList.remove("profit-high", "profit-medium", "profit-low");
    if (profit >= 200000000) {
      element.classList.add("profit-high");
    } else if (profit >= 100000000) {
      element.classList.add("profit-medium");
    } else {
      element.classList.add("profit-low");
    }
  });
}

// Cập nhật tổng lợi nhuận
function updateTotalProfit() {
  const profitElements = document.querySelectorAll(".profit");
  let totalProfit = 0;

  profitElements.forEach((element) => {
    const revenue = parseInt(element.dataset.revenue);
    const costs = parseInt(element.dataset.costs);
    totalProfit += revenue - costs;
  });

  // Thêm tổng lợi nhuận vào summary cards nếu cần
  const summaryCards = document.querySelector(".summary-cards");
  if (summaryCards && !document.getElementById("totalProfit")) {
    const profitCard = document.createElement("div");
    profitCard.className = "summary-card";
    profitCard.innerHTML = `
      <h3>Tổng Lợi Nhuận</h3>
      <div class="amount" id="totalProfit">${formatCurrency(totalProfit)}</div>
    `;
    summaryCards.appendChild(profitCard);
  } else if (document.getElementById("totalProfit")) {
    document.getElementById("totalProfit").textContent =
      formatCurrency(totalProfit);
  }
}

// Tính tổng doanh thu
function calculateTotalRevenue() {
  let total = 0;
  Object.values(revenueData).forEach((branch) => {
    Object.values(branch).forEach((amount) => {
      total += amount;
    });
  });
  return total;
}

// Tìm chi nhánh tốt nhất
function findBestBranch() {
  let bestBranch = "";
  let maxRevenue = 0;

  Object.entries(revenueData).forEach(([branch, months]) => {
    const branchTotal = Object.values(months).reduce(
      (sum, amount) => sum + amount,
      0
    );
    if (branchTotal > maxRevenue) {
      maxRevenue = branchTotal;
      bestBranch = branch;
    }
  });

  return bestBranch;
}

// Tìm tháng tốt nhất
function findBestMonth() {
  const monthTotals = {};

  Object.values(revenueData).forEach((branch) => {
    Object.entries(branch).forEach(([month, amount]) => {
      monthTotals[month] = (monthTotals[month] || 0) + amount;
    });
  });

  let bestMonth = "";
  let maxAmount = 0;

  Object.entries(monthTotals).forEach(([month, amount]) => {
    if (amount > maxAmount) {
      maxAmount = amount;
      bestMonth = month;
    }
  });

  return bestMonth;
}

// Cập nhật thông tin tổng quan
function updateSummary() {
  document.getElementById("totalRevenue").textContent = formatCurrency(
    calculateTotalRevenue()
  );
  document.getElementById("bestBranch").textContent = findBestBranch();
  document.getElementById("bestMonth").textContent = findBestMonth();
  document.getElementById("lastUpdate").textContent = new Date().toLocaleString(
    "vi-VN"
  );
}

// Tạo biểu đồ
function createChart() {
  const canvas = document.getElementById("revenueChart");
  if (!canvas) {
    console.error("Không tìm thấy canvas element!");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Không thể lấy context từ canvas!");
    return;
  }

  // Xóa biểu đồ cũ nếu có
  if (window.revenueChartInstance) {
    window.revenueChartInstance.destroy();
  }

  // Lấy tất cả tháng có dữ liệu
  const allMonths = new Set();
  Object.values(revenueData).forEach((branch) => {
    Object.keys(branch).forEach((month) => allMonths.add(month));
  });
  const months = Array.from(allMonths).sort((a, b) => {
    const monthOrder = {
      "Tháng 7": 7,
      "Tháng 8": 8,
      "Tháng 9": 9,
      "Tháng 10": 10,
    };
    return monthOrder[a] - monthOrder[b];
  });

  const branches = Object.keys(revenueData);

  const datasets = branches.map((branch, index) => {
    const colors = [
      {
        border: "#667eea",
        background: "rgba(102, 126, 234, 0.1)",
        point: "#667eea",
      },
      {
        border: "#f093fb",
        background: "rgba(240, 147, 251, 0.1)",
        point: "#f093fb",
      },
      {
        border: "#4facfe",
        background: "rgba(79, 172, 254, 0.1)",
        point: "#4facfe",
      },
    ];
    return {
      label: branch,
      data: months.map((month) => revenueData[branch][month] || 0),
      backgroundColor: colors[index].background,
      borderColor: colors[index].border,
      pointBackgroundColor: colors[index].point,
      pointBorderColor: "#ffffff",
      pointBorderWidth: 3,
      borderWidth: 4,
      fill: true,
      tension: 0.6,
      pointRadius: 8,
      pointHoverRadius: 12,
      pointHoverBackgroundColor: colors[index].point,
      pointHoverBorderColor: "#ffffff",
      pointHoverBorderWidth: 4,
    };
  });

  // Tạo biểu đồ và lưu instance
  window.revenueChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 2.5,
      plugins: {
        title: {
          display: true,
          text: "📊 Doanh Thu Theo Tháng",
          font: {
            size: 22,
            weight: "bold",
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          },
          color: "#2c3e50",
          padding: {
            top: 20,
            bottom: 30,
          },
        },
        legend: {
          display: true,
          position: "top",
          align: "center",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 25,
            font: {
              size: 16,
              weight: "bold",
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
            color: "#2c3e50",
            boxWidth: 20,
            boxHeight: 20,
          },
        },
        tooltip: {
          backgroundColor: "rgba(44, 62, 80, 0.95)",
          titleColor: "#ecf0f1",
          bodyColor: "#ecf0f1",
          borderColor: "#3498db",
          borderWidth: 2,
          cornerRadius: 12,
          displayColors: true,
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            size: 13,
            weight: "500",
          },
          padding: 12,
          callbacks: {
            title: function (context) {
              return "📅 " + context[0].label;
            },
            label: function (context) {
              return (
                "🏢 " +
                context.dataset.label +
                ": " +
                formatCurrency(context.parsed.y)
              );
            },
            afterLabel: function (context) {
              const value = context.parsed.y;
              if (value >= 200000000) {
                return "💰 Doanh thu cao";
              } else if (value >= 100000000) {
                return "📈 Doanh thu tốt";
              } else {
                return "📊 Doanh thu ổn định";
              }
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(52, 152, 219, 0.1)",
            drawBorder: false,
          },
          ticks: {
            font: {
              size: 14,
              weight: "bold",
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
            color: "#2c3e50",
            padding: 15,
          },
          border: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(52, 152, 219, 0.1)",
            drawBorder: false,
          },
          ticks: {
            font: {
              size: 12,
              weight: "500",
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
            color: "#2c3e50",
            padding: 15,
            callback: function (value) {
              if (value >= 1000000000) {
                return (value / 1000000000).toFixed(1) + "B VNĐ";
              } else if (value >= 1000000) {
                return (value / 1000000).toFixed(0) + "M VNĐ";
              } else if (value >= 1000) {
                return (value / 1000).toFixed(0) + "K VNĐ";
              }
              return value + " VNĐ";
            },
          },
          border: {
            display: false,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      elements: {
        point: {
          radius: 0,
          hoverRadius: 12,
        },
        line: {
          borderCapStyle: "round",
          borderJoinStyle: "round",
        },
      },
      animation: {
        duration: 2000,
        easing: "easeInOutQuart",
        delay: (context) => {
          let delay = 0;
          if (context.type === "data" && context.mode === "default") {
            delay = context.dataIndex * 200 + context.datasetIndex * 100;
          }
          return delay;
        },
      },
      hover: {
        animationDuration: 300,
      },
    },
  });
}

// Thêm hiệu ứng số đếm
function animateNumbers() {
  const elements = document.querySelectorAll(".revenue");
  elements.forEach((element) => {
    const finalValue = element.textContent;
    const numericValue = parseInt(finalValue.replace(/[^\d]/g, ""));

    if (numericValue) {
      let currentValue = 0;
      const increment = numericValue / 50;
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= numericValue) {
          currentValue = numericValue;
          clearInterval(timer);
        }
        element.textContent = formatCurrency(Math.floor(currentValue));
      }, 30);
    }
  });
}

// Xử lý popup modal cho hình ảnh hóa đơn
function handleInvoiceModal() {
  const modal = document.getElementById("invoiceModal");
  const modalImage = document.getElementById("modalImage");
  const modalCaption = document.getElementById("modalCaption");
  const closeBtn = document.querySelector(".close");
  const thumbnails = document.querySelectorAll(".invoice-thumbnail");

  // Mở modal khi click vào thumbnail
  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      modal.style.display = "block";
      modalImage.src = this.dataset.fullImage;
      modalCaption.textContent = this.alt;
      document.body.style.overflow = "hidden"; // Ngăn scroll
    });
  });

  // Đóng modal khi click vào nút X
  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Khôi phục scroll
  });

  // Đóng modal khi click bên ngoài
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // Đóng modal bằng phím ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.style.display === "block") {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
}

// Khởi tạo khi trang load
document.addEventListener("DOMContentLoaded", function () {
  // Tính toán lợi nhuận trước
  try {
    calculateProfit();
    updateTotalProfit();
    updateSummary();
  } catch (error) {
    console.error("Lỗi khi tính toán:", error);
  }

  // Khởi tạo modal popup
  try {
    handleInvoiceModal();
  } catch (error) {
    console.error("Lỗi khi khởi tạo modal:", error);
  }

  // Đợi Chart.js load xong và tạo biểu đồ
  function initChart() {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js chưa được load, đang chờ...");
      setTimeout(initChart, 100);
      return;
    }

    try {
      const canvas = document.getElementById("revenueChart");
      if (canvas) {
        createChart();
        console.log("Biểu đồ đã được tạo thành công!");
      } else {
        console.error("Không tìm thấy canvas element với id 'revenueChart'");
      }
    } catch (error) {
      console.error("Lỗi khi tạo biểu đồ:", error);
    }
  }

  // Bắt đầu khởi tạo biểu đồ
  initChart();

  // Delay animation để trang load xong
  setTimeout(() => {
    try {
      animateNumbers();
    } catch (error) {
      console.error("Lỗi khi animate numbers:", error);
    }
  }, 500);
});

// Thêm hiệu ứng hover cho các card
document
  .querySelectorAll(".revenue-table-container, .summary-card")
  .forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });
